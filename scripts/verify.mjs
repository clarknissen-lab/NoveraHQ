#!/usr/bin/env node
/**
 * Prüflauf gegen einen nachgebauten Notion-Server.
 *
 *   npm run verify
 *
 * Startet lokal einen Server, der sich wie die Notion-API verhält, lässt den
 * echten Builder komplett dagegen laufen und prüft anschließend das Ergebnis:
 * Sind alle Relations da? Sind die Gegenseiten entstanden? Finden die Rollups
 * die Properties, die sie lesen wollen? Stimmen die Filter?
 *
 * Der Nachbau ahmt auch das Verhalten nach, das die Reihenfolge erzwingt:
 * eine Dual-Relation legt die Gegenseite in der Zieldatenbank an, und ein Rollup
 * wird abgelehnt, wenn die referenzierte Property dort noch nicht existiert.
 */

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { unlinkSync, existsSync } from "node:fs";

// Eigene Datei, damit der Prüflauf niemals den State des echten Laufs
// überschreibt oder versehentlich mit ins Repo wandert.
const STATE = new URL("../.novera-state.verify.json", import.meta.url).pathname;

/* ─────────────────────────────────────────────── Notion-Nachbau */

const store = { dataSources: {}, databases: {}, pages: {}, views: [], blocks: [], records: [], covers: [], headingColors: {} };
const problems = [];
let counter = 0;
const nextId = (p) => `${p}-${String(++counter).padStart(4, "0")}`;

/** Die Property-Typen, die der echte Server aus einer Konfiguration ableitet. */
function typeOf(config) {
  const key = Object.keys(config).find((k) => k !== "type" && k !== "name");
  return config.type ?? key;
}

function applyProperties(dsId, properties, phase) {
  const ds = store.dataSources[dsId];
  for (const [name, config] of Object.entries(properties)) {
    const type = typeOf(config);

    // Rollups dürfen nur auf existierende Relations und Ziel-Properties zeigen.
    if (type === "rollup") {
      const relName = config.rollup.relation_property_name;
      const rel = ds.properties[relName];
      if (!rel) {
        problems.push(`${ds.name}: Rollup "${name}" zeigt auf Relation "${relName}", die es (noch) nicht gibt.`);
        continue;
      }
      const target = store.dataSources[rel.__target];
      const wanted = config.rollup.rollup_property_name;
      if (target && !target.properties[wanted]) {
        problems.push(`${ds.name}: Rollup "${name}" liest "${wanted}" aus ${target.name} — dort nicht vorhanden.`);
        continue;
      }
    }

    if (type === "formula") {
      const expr = config.formula?.expression;
      if (!expr) {
        problems.push(`${ds.name}: Formel "${name}" ohne Ausdruck.`);
        continue;
      }

      const open = (expr.match(/\(/g) || []).length;
      const close = (expr.match(/\)/g) || []).length;
      if (open !== close) {
        problems.push(`${ds.name}: Formel "${name}" hat ${open} öffnende und ${close} schließende Klammern.`);
        continue;
      }

      // or()/and() mit nur einem Argument lehnt Notion ab.
      for (const m of expr.matchAll(/\b(or|and)\(/g)) {
        let depth = 0, args = 1, i = m.index + m[0].length;
        for (; i < expr.length; i++) {
          const c = expr[i];
          if (c === "(") depth++;
          else if (c === ")") { if (depth === 0) break; depth--; }
          else if (c === "," && depth === 0) args++;
        }
        if (args < 2) {
          problems.push(`${ds.name}: Formel "${name}" ruft ${m[1]}() mit nur einem Argument auf.`);
        }
      }

      // Jede referenzierte Property muss zu diesem Zeitpunkt existieren —
      // sonst stimmt die Reihenfolge der Durchläufe nicht.
      for (const m of expr.matchAll(/prop\("([^"]+)"\)/g)) {
        const refName = m[1];
        if (refName !== name && !ds.properties[refName]) {
          problems.push(`${ds.name}: Formel "${name}" liest "${refName}" — existiert zu diesem Zeitpunkt noch nicht.`);
        }
      }
      // Kein continue: die Property muss unten trotzdem registriert werden,
      // sonst finden spätere Rollups und Formeln sie nicht.
    }

    if (ds.properties[name] && phase !== "create") {
      problems.push(`${ds.name}: Property "${name}" wird doppelt angelegt.`);
    }

    ds.properties[name] = { id: nextId("prop"), type, __target: null };

    // Dual-Relation: Gegenseite im Ziel anlegen — genau wie Notion es tut.
    if (type === "relation") {
      const targetId = config.relation.data_source_id;
      ds.properties[name].__target = targetId;
      const target = store.dataSources[targetId];
      const synced = config.relation.dual_property?.synced_property_name;
      if (target && synced) {
        if (target.properties[synced]) {
          problems.push(`${target.name}: Gegenseite "${synced}" existiert schon — doppelte Relation deklariert?`);
        }
        target.properties[synced] = { id: nextId("prop"), type: "relation", __target: dsId };
      }
    }
  }
}

const server = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const payload = body ? JSON.parse(body) : {};
    const url = req.url;
    const send = (obj, code = 200) => {
      res.writeHead(code, { "content-type": "application/json" });
      res.end(JSON.stringify(obj));
    };

    /* POST /v1/databases */
    if (req.method === "POST" && url === "/v1/databases") {
      const dbId = nextId("db");
      const dsId = nextId("ds");
      const name = payload.title?.[0]?.text?.content ?? "?";
      store.dataSources[dsId] = { id: dsId, name, properties: {} };
      store.databases[dbId] = { id: dbId, dataSourceId: dsId, name };
      applyProperties(dsId, payload.initial_data_source?.properties ?? {}, "create");
      if (!payload.parent?.page_id) problems.push(`${name}: ohne Elternseite angelegt.`);
      return send({ object: "database", id: dbId, data_sources: [{ id: dsId, name }] });
    }

    /* GET|PATCH /v1/data_sources/:id */
    const dsMatch = url.match(/^\/v1\/data_sources\/([\w-]+)$/);
    if (dsMatch) {
      const ds = store.dataSources[dsMatch[1]];
      if (!ds) return send({ object: "error", status: 404, code: "object_not_found", message: "no data source" }, 404);
      if (req.method === "PATCH") applyProperties(ds.id, payload.properties ?? {}, "update");
      return send({ object: "data_source", id: ds.id, properties: ds.properties });
    }

    /* POST /v1/views */
    if (req.method === "POST" && url === "/v1/views") {
      const ds = store.dataSources[payload.data_source_id];
      if (!ds) return send({ object: "error", status: 400, code: "validation_error", message: "unknown data source" }, 400);

      // Der echte Server verlangt genau eines von database_id, view_id oder
      // create_database — data_source_id allein genügt nicht.
      const anker = ["database_id", "view_id", "create_database"].filter((k) => payload[k]);
      if (anker.length !== 1) {
        problems.push(
          `${ds.name} / ${payload.name}: ${anker.length} von database_id/view_id/create_database gesetzt — genau eines ist nötig.`
        );
      }

      // Filter gegen die tatsächlichen Properties prüfen.
      const checkFilter = (node) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) return node.forEach(checkFilter);
        if (node.and) return checkFilter(node.and);
        if (node.or) return checkFilter(node.or);
        // Relative Datumsangaben: Operatoren wie next_week erwarten {}, während
        // before/after/equals nur eine feste Liste von Schlüsselwörtern oder ein
        // ISO-Datum annehmen. Beides zu verwechseln quittiert Notion mit 400.
        if (node.date) {
          const WERT_OPS = ["equals", "before", "after", "on_or_before", "on_or_after"];
          const ERLAUBT = [
            "today", "tomorrow", "yesterday",
            "one_week_ago", "one_week_from_now",
            "one_month_ago", "one_month_from_now",
          ];
          for (const [op, wert] of Object.entries(node.date)) {
            if (!WERT_OPS.includes(op)) continue;
            if (typeof wert !== "string") continue;
            const istISO = /^\d{4}-\d{2}-\d{2}/.test(wert);
            if (!istISO && !ERLAUBT.includes(wert)) {
              problems.push(
                `${ds.name} / ${payload.name}: date.${op} = "${wert}" ist kein gültiger Wert. ` +
                `Erlaubt sind ${ERLAUBT.join(", ")} oder ein ISO-Datum.`
              );
            }
          }
        }

        if (node.property) {
          const prop = ds.properties[node.property];
          if (!prop) {
            problems.push(`${ds.name} / ${payload.name}: Filter auf unbekannte Property "${node.property}".`);
            return;
          }
          const filterKey = Object.keys(node).find((k) => k !== "property");
          // formula-Properties werden über ihren Ergebnistyp gefiltert — hier nicht prüfbar.
          if (prop.type !== "formula" && filterKey !== prop.type) {
            problems.push(
              `${ds.name} / ${payload.name}: Filter benutzt "${filterKey}", Property "${node.property}" ist aber ${prop.type}.`
            );
          }
        }
      };
      checkFilter(payload.filter);

      for (const sort of payload.sorts ?? []) {
        if (sort.property && !ds.properties[sort.property]) {
          problems.push(`${ds.name} / ${payload.name}: Sortierung auf unbekannte Property "${sort.property}".`);
        }
      }

      const cfg = payload.configuration;
      if (payload.type !== "table" && !cfg) {
        problems.push(`${ds.name} / ${payload.name}: ${payload.type}-Ansicht ohne configuration.`);
      }
      if (cfg?.type === "board" && !cfg.group_by?.property_id) {
        problems.push(`${ds.name} / ${payload.name}: Board ohne group_by.`);
      }

      store.views.push({ ds: ds.name, name: payload.name, type: payload.type });
      return send({ object: "view", id: nextId("view") });
    }

    /* POST /v1/pages */
    if (req.method === "POST" && url === "/v1/pages") {
      const id = nextId("page");
      const parentType = payload.parent?.type;
      if (parentType === "data_source_id") {
        const ds = store.dataSources[payload.parent.data_source_id];
        if (ds) {
          store.records.push({
            ds: ds.name,
            relations: Object.entries(payload.properties ?? {})
              .filter(([, v]) => Array.isArray(v.relation) && v.relation.length > 0).length,
          });
          for (const name of Object.keys(payload.properties ?? {})) {
            const prop = ds.properties[name];
            if (!prop) { problems.push(`${ds.name}: Datensatz schreibt unbekannte Property "${name}".`); continue; }
            const given = Object.keys(payload.properties[name])[0];
            if (given !== prop.type) {
              problems.push(`${ds.name}: Property "${name}" ist ${prop.type}, geschrieben wurde ${given}.`);
            }
          }
        }
      }
      if (payload.cover) store.covers.push(payload.cover?.external?.url ?? "?");
      store.pages[id] = { id, children: (payload.children ?? []).length };
      countBlocks(payload.children ?? []);
      return send({ object: "page", id });
    }

    /* PATCH /v1/blocks/:id/children */
    const blockMatch = url.match(/^\/v1\/blocks\/([\w-]+)\/children$/);
    if (blockMatch && req.method === "PATCH") {
      const children = payload.children ?? [];
      if (children.length > 100) problems.push(`Block-Append mit ${children.length} Blöcken — Limit ist 100.`);
      countBlocks(children);
      return send({ object: "list", results: [] });
    }

    problems.push(`Nicht abgedeckter Aufruf: ${req.method} ${url}`);
    return send({ object: "error", status: 404, code: "object_not_found", message: url }, 404);
  });
});

function countBlocks(blocks) {
  for (const b of blocks) {
    store.blocks.push(b.type ?? Object.keys(b).find((k) => k !== "object"));
    const type = Object.keys(b).find((k) => k !== "type" && k !== "object");
    const inner = b[type];

    if (type === "column_list") {
      const cols = inner.children ?? [];
      if (cols.length < 2) problems.push(`column_list mit ${cols.length} Spalte(n) — Notion verlangt mindestens 2.`);
      for (const col of cols) countBlocks(col.column?.children ?? []);
    } else if (inner?.children) {
      countBlocks(inner.children);
    }

    // Falsch geformter Rich-Text ist der häufigste Fehler beim Blockbau:
    // rich_text MUSS ein Array von Textsegmenten sein, kein verschachtelter Block.
    if (inner && "rich_text" in inner) {
      if (!Array.isArray(inner.rich_text)) {
        problems.push(`Block "${type}": rich_text ist ${typeof inner.rich_text}, erwartet wird ein Array.`);
      } else {
        for (const rtItem of inner.rich_text) {
          if (rtItem?.type !== "text" || typeof rtItem?.text?.content !== "string") {
            problems.push(`Block "${type}": ungültiges Rich-Text-Segment.`);
          } else if (rtItem.text.content.length > 2000) {
            problems.push(`Block "${type}": Rich-Text über 2000 Zeichen.`);
          }
        }
      }
    }
    if (/^heading_[123]$/.test(type) && inner.color) {
      store.headingColors[inner.color] = (store.headingColors[inner.color] ?? 0) + 1;
    }
    // Notion akzeptiert als callout.icon.emoji ausschließlich echte Emoji.
    // Schriftzeichen wie ＋ (U+FF0B), ▪ (U+25AA) oder ✓ (U+2713) sehen passend
    // aus, werden aber mit einem validation_error abgelehnt.
    //
    // Die Prüfung ist bewusst streng: Sie verlangt ein Zeichen, das von sich aus
    // Emoji_Presentation hat, und lässt Folgen wie ☁️ (U+2601 U+FE0F) nicht
    // durch. Solche Folgen sind unicodeseitig gültige Emoji, aber ob Notions
    // Liste sie führt, ist von hier aus nicht prüfbar. Eindeutige Emoji ohne
    // Variantenselektor kosten nichts und können nicht scheitern.
    if (type === "callout") {
      const zeichen = inner?.icon?.emoji;
      if (inner?.icon?.type === "emoji") {
        if (!zeichen) {
          problems.push("Callout mit icon.type emoji, aber ohne Zeichen.");
        } else if (!/^\p{Emoji_Presentation}/u.test(zeichen)) {
          const punkte = [...zeichen]
            .map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"))
            .join(" ");
          problems.push(`Callout-Icon "${zeichen}" (${punkte}) ist kein Emoji — Notion lehnt es ab.`);
        }
      }
    }

    if (type === "embed" && !inner.url) problems.push("Embed ohne URL.");
    if (type === "bookmark" && !inner.url) problems.push("Bookmark ohne URL.");
  }
}

/* ───────────────────────────────────────────────────────── Ablauf */

if (existsSync(STATE)) unlinkSync(STATE);

server.listen(0, "127.0.0.1", () => {
  const port = server.address().port;
  console.log(`\n  Nachgebauter Notion-Server auf Port ${port}\n`);

  const child = spawn(
    process.execPath,
    [new URL("./build-notion.mjs", import.meta.url).pathname],
    {
      env: {
        ...process.env,
        NOTION_TOKEN: "ntn_verify",
        NOVERA_STATE_FILE: ".novera-state.verify.json",
        NOTION_PARENT_PAGE: "00000000000000000000000000000001",
        NOTION_BASE_URL: `http://127.0.0.1:${port}`,
        NOVERA_CLOCK_URL: "https://example.github.io/NoveraHQ/",
        NOVERA_SPOTIFY_URL: "https://open.spotify.com/embed/playlist/000",
        NOVERA_GCAL_EMBED_URL: "https://calendar.google.com/calendar/embed?src=demo",
        NOVERA_DRIVE_URL: "https://drive.google.com/drive/folders/demo",
      },
      stdio: "inherit",
    }
  );

  child.on("exit", (code) => {
    server.close();

    console.log("\n" + "═".repeat(64));
    console.log("  PRÜFERGEBNIS");
    console.log("═".repeat(64));

    const dsList = Object.values(store.dataSources);
    console.log(`\n  Datenbanken: ${dsList.length}`);
    for (const ds of dsList) {
      const types = {};
      for (const prop of Object.values(ds.properties)) types[prop.type] = (types[prop.type] ?? 0) + 1;
      const summary = Object.entries(types).sort().map(([t, n]) => `${t}:${n}`).join(" ");
      console.log(`    ${ds.name.padEnd(22)} ${String(Object.keys(ds.properties).length).padStart(2)} Properties  ${summary}`);
    }

    console.log(`\n  Ansichten: ${store.views.length}`);
    console.log(`  Seiten:    ${Object.keys(store.pages).length}`);
    console.log(`  Blöcke:    ${store.blocks.length}`);
    console.log(`  Datensätze: ${store.records.length} (davon ${linkedRecords()} Verknüpfungen gesetzt)`);
    console.log(`  Cover:     ${store.covers.length}`);
    console.log(`  Sektionsbänder: ${Object.entries(store.headingColors).map(([c,n])=>c+" x"+n).join(", ") || "—"}`);

    /* Die Prüfungen aus der Qualitätskontrolle, Abschnitt 32 des Auftrags. */
    console.log("\n  Verknüpfungen:");
    const checks = [
      // Der Weg vom Lead bis zum laufenden Hosting muss durchgängig verknüpft sein.
      ["Lead ↔ Kunde", has("Leads", "Kunde") && has("Kunden", "Lead")],
      ["Kunde ↔ Projekte", has("Kunden", "Projekte") && has("Projekte", "Kunde")],
      ["Kunde ↔ Angebote", has("Kunden", "Angebote") && has("Angebote", "Kunde")],
      ["Kunde ↔ Websites", has("Kunden", "Websites") && has("Websites", "Kunde")],
      ["Kunde ↔ Hosting & Domains", has("Kunden", "Hosting & Domains") && has("Hosting & Domains", "Kunde")],
      ["Kunde ↔ Zugänge", has("Kunden", "Zugänge") && has("Zugänge", "Kunde")],
      ["Kunde ↔ Aufgaben", has("Kunden", "Aufgaben") && has("Aufgaben", "Kunde")],
      ["Projekt ↔ Websites", has("Projekte", "Websites") && has("Websites", "Projekt")],
      ["Projekt ↔ Aufgaben", has("Projekte", "Aufgaben") && has("Aufgaben", "Projekt")],
      ["Projekt ↔ Angebote", has("Projekte", "Angebote") && has("Angebote", "Projekt")],
      ["Website ↔ Blueprint", has("Websites", "Blueprint") && has("Website Blueprints", "Website")],
      ["Website ↔ Hosting", has("Websites", "Hosting") && has("Hosting & Domains", "Website")],
      ["Kunde ↔ Blueprints", has("Kunden", "Blueprints") && has("Website Blueprints", "Kunde")],
      ["Lead ↔ Angebot", has("Leads", "Angebot") && has("Angebote", "Lead")],

      // Rechnende Felder
      ["Projektfortschritt rechnet", has("Projekte", "Fortschritt")],
      ["Angebotssumme rechnet", propType("Angebote", "Gesamtpreis") === "formula"],
      ["Hosting-Marge rechnet", propType("Hosting & Domains", "Marge") === "formula"],
      ["Offene Aufgaben je Kunde rechnen", has("Kunden", "Offene Aufgaben")],
      ["Frist-Countdown bei Aufgaben", propType("Aufgaben", "Frist") === "formula"],
      ["Domain-Countdown bei Hosting", propType("Hosting & Domains", "Ablauf") === "formula"],

      // Regeln, die nicht verletzt werden dürfen
      ["Passwortfeld ist eine feste Formel", propType("Zugänge", "Passwort") === "formula"],
      ["Keine Finanzdatenbank in Notion", !ds("Rechnungen") && !ds("Invoices") && !ds("Ausgaben")],
      ["Neun Datenbanken, nicht mehr", Object.keys(store.dataSources).length === 9],
      ["Branding-Link bei der Website", has("Websites", "Branding")],
      ["Novera Care bei Hosting gespiegelt", has("Hosting & Domains", "Novera Care")],
      ["Beispieldaten sind tatsächlich verknüpft", linkedRecords() >= 14],
    ];

    /* Die Abschlussprüfung aus dem Audit: der komplette Weg eines Kunden.
       Jeder Pfeil muss über eine echte Relation laufen — sonst reißt die Kette
       genau dort, wo man sie im Alltag braucht. */
    const kette = [
      ["Lead", "Angebot", "Leads", "Angebot"],
      ["Angebot", "Kunde", "Angebote", "Kunde"],
      ["Kunde", "Projekt", "Kunden", "Projekte"],
      ["Projekt", "Website", "Projekte", "Websites"],
      ["Website", "Blueprint", "Websites", "Blueprint"],
      ["Projekt", "Aufgaben", "Projekte", "Aufgaben"],
      ["Website", "Hosting", "Websites", "Hosting"],
      ["Kunde", "Zugänge", "Kunden", "Zugänge"],
    ];
    const ketteOk = kette.every(([, , db, prop]) => has(db, prop));
    checks.push([
      "Kette Lead → Angebot → Kunde → Projekt → Website → Blueprint → Hosting",
      ketteOk,
    ]);
    for (const [label, ok] of checks) {
      console.log(`    ${ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m"} ${label}`);
      if (!ok) problems.push(`Prüfung fehlgeschlagen: ${label}`);
    }

    if (problems.length) {
      console.log(`\n  \x1b[31m${problems.length} Problem(e):\x1b[0m`);
      [...new Set(problems)].forEach((pr) => console.log(`    · ${pr}`));
      console.log("");
      process.exit(1);
    }

    console.log("\n  \x1b[32mAlles sauber.\x1b[0m\n");
    process.exit(code ?? 0);
  });
});

/**
 * Summe aller Relation-Werte in den angelegten Datensätzen.
 * Fällt das auf 0, wurden die Verknüpfungen still verworfen — genau der Fehler,
 * der entsteht, wenn die Property-Typen vor dem Anlegen der Relations gelesen werden.
 */
function linkedRecords() {
  return store.records.reduce((sum, r) => sum + r.relations, 0);
}

function ds(name) { return Object.values(store.dataSources).find((d) => d.name === name); }
function has(dbName, propName) { return Boolean(ds(dbName)?.properties[propName]); }
function propType(dbName, propName) { return ds(dbName)?.properties[propName]?.type; }
