#!/usr/bin/env node
/**
 * NOVERA STUDIO OS — Notion Builder
 *
 * Baut den kompletten Workspace über die Notion-API:
 * Seiten, 11 Datenbanken, 15 Relations, Rollups, Formeln, 50 Ansichten,
 * Beispieldaten.
 *
 *   node scripts/build-notion.mjs
 *
 * Erforderlich:
 *   NOTION_TOKEN        Internal Integration Secret (ntn_...)
 *   NOTION_PARENT_PAGE  ID der Seite, unter der gebaut wird
 *
 * Optional:
 *   NOVERA_CLOCK_URL        URL des Uhr-Widgets (GitHub Pages)
 *   NOVERA_LOGO_URL         Logo als Seiten-Icon; wird sonst aus NOVERA_CLOCK_URL abgeleitet
 *                           (der Fokus-Timer wird ebenfalls daraus abgeleitet)
 *   NOVERA_SPOTIFY_URL      Spotify-Playlist
 *   NOVERA_GCAL_EMBED_URL   Google-Calendar-Einbettung
 *   NOVERA_DRIVE_URL        Drive-Hauptordner
 *
 * Flags:
 *   --no-seed     ohne Beispieldaten
 *   --no-views    ohne Ansichten
 *   --dry-run     nichts schreiben, nur die Payloads prüfen und ausgeben
 *
 * Der Lauf ist wiederholbar: angelegte IDs landen in .novera-state.json und
 * werden beim nächsten Mal wiederverwendet statt doppelt angelegt.
 */

import { loadEnv } from "./lib/env.mjs";
import {
  makeClient, loadState, saveState, withRetry, addProperties,
  log, warn, warnings, errText, rt,
} from "./lib/notion.mjs";

// Zuerst .env einlesen — danach stehen die Werte in process.env.
loadEnv();
import { DATABASES, DB_BY_KEY } from "./lib/schema.mjs";
import { VIEWS, buildViewConfiguration } from "./lib/views.mjs";
import { SEED, SEED_ORDER } from "./lib/seed.mjs";
import * as P from "./lib/pages.mjs";
import { h1, p as para } from "./lib/blocks.mjs";

/* ────────────────────────────────────────────────────────────── Optionen */

const argv = new Set(process.argv.slice(2));
const OPT = {
  seed: !argv.has("--no-seed"),
  views: !argv.has("--no-views"),
  dryRun: argv.has("--dry-run"),
};

const TOKEN = process.env.NOTION_TOKEN;
const PARENT = normalizeId(process.env.NOTION_PARENT_PAGE);

const URLS = {
  clock: process.env.NOVERA_CLOCK_URL || null,
  // Das Logo liegt im selben Verzeichnis wie das Widget, deshalb reicht die
  // Uhr-URL — eine eigene Angabe überschreibt sie.
  logo:
    process.env.NOVERA_LOGO_URL ||
    (process.env.NOVERA_CLOCK_URL
      ? process.env.NOVERA_CLOCK_URL.replace(/\/?$/, "/") + "brand/favicon.svg"
      : null),
  // Der Fokus-Timer liegt neben dem Uhr-Widget unter derselben Adresse.
  focus: process.env.NOVERA_CLOCK_URL
    ? process.env.NOVERA_CLOCK_URL.replace(/\/?$/, "/") + "focus.html"
    : null,
  spotifyEmbed: process.env.NOVERA_SPOTIFY_URL || null,
  googleCalendarEmbed: process.env.NOVERA_GCAL_EMBED_URL || null,
  driveRoot: process.env.NOVERA_DRIVE_URL || null,
};

/** Notion-IDs kommen mal mit Bindestrichen, mal als URL. Beides zulassen. */
function normalizeId(raw) {
  if (!raw) return null;
  const m = String(raw).match(/([0-9a-f]{32})|([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (!m) return null;
  const id = m[0].replace(/-/g, "");
  return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}

if (!OPT.dryRun) {
  if (!TOKEN) fatal("NOTION_TOKEN fehlt.\n  Lege .env an (cp .env.example .env) und trage das Secret ein.\n  Danach: npm run check");
  if (!PARENT) fatal("NOTION_PARENT_PAGE fehlt oder ist keine gültige Notion-Adresse.\n  Trage die Seiten-URL in .env ein.\n  Danach: npm run check");
}

function fatal(msg) {
  console.error(`\n\x1b[31m✗ ${msg}\x1b[0m\n`);
  process.exit(1);
}

const notion = TOKEN ? makeClient(TOKEN, process.env.NOTION_BASE_URL || null) : null;
const state = loadState();

/* ──────────────────────────────────────────────── Status → Select Fallback
 *
 * Notion hat Status-Properties lange nicht über die API zugelassen. Der aktuelle
 * Stand erlaubt es — falls die Instanz das doch ablehnt, wird dieselbe Property
 * als `select` mit identischen Optionen angelegt. Die Ansichten müssen dann
 * `status`-Filter auf `select` umschreiben, das erledigt normalizeFilter().
 */
const propertyTypes = {}; // dbKey -> { propertyName: "status" | "select" | ... }

function statusToSelect(properties) {
  const out = {};
  for (const [name, def] of Object.entries(properties)) {
    out[name] = def.status ? { select: { options: def.status.options } } : def;
  }
  return out;
}

/* ═══════════════════════════════════════════════════════ 1. DATENBANKEN */

async function createDatabases(hqPageId) {
  log.step("Datenbanken anlegen");

  for (const db of DATABASES) {
    const parentPageId = db.key === "invoices" || db.key === "expenses"
      ? state.pages.finance
      : ["access", "requirements", "communication"].includes(db.key)
        ? state.pages.clientRecords
        : hqPageId;

    if (state.databases[db.key]?.dataSourceId) {
      log.skip(`${db.name} existiert bereits`);
      propertyTypes[db.key] = state.databases[db.key].propertyTypes ?? {};
      continue;
    }

    const payload = {
      parent: { type: "page_id", page_id: parentPageId },
      title: rt(db.name),
      description: rt(db.description),
      icon: { type: "emoji", emoji: db.icon },
      initial_data_source: { properties: db.base },
    };

    if (OPT.dryRun) {
      log.ok(`[dry-run] ${db.name} — ${Object.keys(db.base).length} Properties`);
      continue;
    }

    let created;
    try {
      created = await withRetry(() => notion.databases.create(payload), { label: db.name });
    } catch (err) {
      // Zweiter Versuch ohne Status-Properties.
      if (Object.values(db.base).some((d) => d.status)) {
        warn(`${db.name}: Status-Property abgelehnt (${errText(err)}) — wird als Select angelegt.`);
        payload.initial_data_source.properties = statusToSelect(db.base);
        created = await withRetry(() => notion.databases.create(payload), { label: db.name + " (select)" });
      } else {
        throw err;
      }
    }

    const dataSourceId = created.data_sources?.[0]?.id;
    if (!dataSourceId) fatal(`${db.name}: Notion hat keine data_source zurückgegeben.`);

    state.databases[db.key] = { databaseId: created.id, dataSourceId, name: db.name };
    saveState(state);
    log.ok(`${db.name}`);
  }

  // Tatsächliche Property-Typen einlesen — danach steht fest, ob Status oder Select.
  if (!OPT.dryRun) {
    for (const db of DATABASES) {
      const entry = state.databases[db.key];
      if (!entry) continue;
      const ds = await withRetry(
        () => notion.dataSources.retrieve({ data_source_id: entry.dataSourceId }),
        { label: `${db.name} lesen` }
      );
      propertyTypes[db.key] = Object.fromEntries(
        Object.entries(ds.properties).map(([n, v]) => [n, v.type])
      );
      entry.propertyTypes = propertyTypes[db.key];
    }
    saveState(state);
  }
}

/* ═══════════════════════════════════════════════════════ 2. RELATIONS */

async function createRelations() {
  log.step("Relations verknüpfen");

  for (const db of DATABASES) {
    const rels = db.relations ?? {};
    if (Object.keys(rels).length === 0) continue;

    const resolved = {};
    for (const [name, def] of Object.entries(rels)) {
      const target = state.databases[def.__relationTarget];
      if (!target) {
        warn(`${db.name}: Relation "${name}" übersprungen — Ziel ${def.__relationTarget} fehlt.`);
        continue;
      }
      resolved[name] = {
        type: "relation",
        relation: { ...def.relation, data_source_id: target.dataSourceId },
      };
    }

    if (OPT.dryRun) {
      log.ok(`[dry-run] ${db.name} — ${Object.keys(resolved).length} Relations`);
      continue;
    }

    const failed = await addProperties(
      notion, state.databases[db.key].dataSourceId, resolved, `${db.name} Relations`
    );
    log.ok(`${db.name} — ${Object.keys(resolved).length - failed.length} Relations`);
  }
}

/* ══════════════════════════════════ 3.-5. FORMELN, ROLLUPS, SPÄTFORMELN */

async function createDerived(stageKey, label) {
  log.step(label);

  for (const db of DATABASES) {
    const props = db[stageKey] ?? {};
    if (Object.keys(props).length === 0) continue;

    if (OPT.dryRun) {
      log.ok(`[dry-run] ${db.name} — ${Object.keys(props).length} × ${stageKey}`);
      continue;
    }

    const failed = await addProperties(
      notion, state.databases[db.key].dataSourceId, props, `${db.name} ${stageKey}`
    );
    log.ok(`${db.name} — ${Object.keys(props).length - failed.length}/${Object.keys(props).length}`);
  }
}

/* ═══════════════════════════════════════════════════════════ 6. ANSICHTEN */

/**
 * Schreibt `status`-Filter auf `select` um, falls die Property als Select
 * angelegt wurde. Ohne das würden alle Filter ins Leere laufen.
 */
function normalizeFilter(node, types) {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map((n) => normalizeFilter(n, types));

  if (node.and) return { and: normalizeFilter(node.and, types) };
  if (node.or) return { or: normalizeFilter(node.or, types) };

  if (node.property && node.status && types[node.property] === "select") {
    const { status, ...rest } = node;
    return { ...rest, select: status };
  }
  return node;
}

async function createViews() {
  log.step("Ansichten anlegen");

  for (const [dbKey, views] of Object.entries(VIEWS)) {
    const entry = state.databases[dbKey];
    if (!entry) continue;

    const types = propertyTypes[dbKey] ?? {};
    let propertyIds = {};
    if (!OPT.dryRun) {
      const ds = await withRetry(
        () => notion.dataSources.retrieve({ data_source_id: entry.dataSourceId }),
        { label: `${entry.name} Properties` }
      );
      propertyIds = Object.fromEntries(Object.entries(ds.properties).map(([n, v]) => [n, v.id]));
    }

    let made = 0;
    for (const view of views) {
      const stateKey = `${dbKey}:${view.name}`;
      if (state.views[stateKey]) continue;

      const payload = {
        data_source_id: entry.dataSourceId,
        name: view.name,
        type: view.type,
        position: { type: "end" },
      };
      if (view.filter) payload.filter = normalizeFilter(view.filter, types);
      if (view.sorts) payload.sorts = view.sorts;

      const config = OPT.dryRun ? null : buildViewConfiguration(view, propertyIds);
      if (config) payload.configuration = config;
      if (!config && view.type !== "table" && !OPT.dryRun) {
        warn(`${entry.name} / ${view.name}: Property für ${view.type}-Ansicht nicht gefunden — als Tabelle angelegt.`);
        payload.type = "table";
      }

      if (OPT.dryRun) { made++; continue; }

      try {
        const created = await withRetry(() => notion.views.create(payload), { label: stateKey });
        state.views[stateKey] = created.id;
        made++;
      } catch (err) {
        warn(`${entry.name} / ${view.name}: Ansicht nicht angelegt — ${errText(err)}`);
      }
    }
    saveState(state);
    log.ok(`${entry.name} — ${made}/${views.length} Ansichten`);
  }
}

/* ═════════════════════════════════════════════════════════════ 7. SEITEN */

async function createPage(key, { parent, title, icon, iconUrl, blocks }) {
  if (state.pages[key]) { log.skip(`Seite ${title} existiert bereits`); return state.pages[key]; }
  if (OPT.dryRun) { log.ok(`[dry-run] Seite ${title} — ${blocks?.length ?? 0} Blöcke`); return `dry-${key}`; }

  // Externes Icon (das Novera-Logo) wenn vorhanden, sonst das Emoji.
  const pageIcon = iconUrl
    ? { type: "external", external: { url: iconUrl } }
    : { type: "emoji", emoji: icon };

  const page = await withRetry(
    () => notion.pages.create({
      parent: { type: "page_id", page_id: parent },
      properties: { title: { title: rt(title) } },
      icon: pageIcon,
      ...(blocks ? { children: blocks.slice(0, 100) } : {}),
    }),
    { label: `Seite ${title}` }
  );

  if (blocks && blocks.length > 100) await appendBlocks(page.id, blocks.slice(100));

  state.pages[key] = page.id;
  saveState(state);
  log.ok(`Seite ${title}`);
  return page.id;
}

/** Notion nimmt maximal 100 Blöcke pro Request. */
async function appendBlocks(blockId, blocks) {
  for (let i = 0; i < blocks.length; i += 100) {
    await withRetry(
      () => notion.blocks.children.append({ block_id: blockId, children: blocks.slice(i, i + 100) }),
      { label: "Blöcke anhängen" }
    );
  }
}

/**
 * Property-Typen neu einlesen.
 *
 * Nötig, weil beim Anlegen der Datenbanken nur die Basis-Properties existierten.
 * Relations, Formeln und Rollups kommen erst danach dazu — und die Beispieldaten
 * schreiben in genau diese Relations. Ohne diesen Schritt würden die Werte
 * kommentarlos verworfen und der Musterkunde stünde ohne Projekte da.
 */
async function refreshPropertyTypes() {
  if (OPT.dryRun) return;
  for (const db of DATABASES) {
    const entry = state.databases[db.key];
    if (!entry) continue;
    const ds = await withRetry(
      () => notion.dataSources.retrieve({ data_source_id: entry.dataSourceId }),
      { label: `${db.name} Properties neu lesen` }
    );
    propertyTypes[db.key] = Object.fromEntries(
      Object.entries(ds.properties).map(([n, v]) => [n, v.type])
    );
    entry.propertyTypes = propertyTypes[db.key];
  }
  saveState(state);
}

/* ═════════════════════════════════════════════════════ 8. BEISPIELDATEN */

const seedRefs = {}; // "clients:muster" -> pageId

function buildProperties(record, types) {
  const props = {};
  for (const [name, spec] of Object.entries(record)) {
    if (name.startsWith("_")) continue;
    const actual = types[name];
    if (!actual) {
      warn(`Beispieldaten: Property "${name}" existiert nicht — Wert verworfen.`);
      continue;
    }

    if (spec.title !== undefined) props[name] = { title: rt(spec.title) };
    else if (spec.rich_text !== undefined) props[name] = { rich_text: rt(spec.rich_text) };
    else if (spec.number !== undefined) props[name] = { number: spec.number };
    else if (spec.checkbox !== undefined) props[name] = { checkbox: spec.checkbox };
    else if (spec.url !== undefined) props[name] = { url: spec.url };
    else if (spec.email !== undefined) props[name] = { email: spec.email };
    else if (spec.phone_number !== undefined) props[name] = { phone_number: spec.phone_number };
    else if (spec.date !== undefined) props[name] = { date: { start: spec.date } };
    else if (spec.select !== undefined) props[name] = { select: { name: spec.select } };
    else if (spec.multi_select !== undefined) props[name] = { multi_select: spec.multi_select.map((n) => ({ name: n })) };
    else if (spec.status !== undefined) {
      // Fällt auf select zurück, wenn die Property als Select angelegt wurde.
      props[name] = actual === "select" ? { select: { name: spec.status } } : { status: { name: spec.status } };
    } else if (spec.relation !== undefined) {
      const id = seedRefs[spec.relation];
      if (id) props[name] = { relation: [{ id }] };
      else warn(`Beispieldaten: Verweis "${spec.relation}" nicht auflösbar — Verknüpfung fehlt.`);
    }
  }
  return props;
}

async function seedData() {
  log.step("Beispieldaten anlegen");

  for (const dbKey of SEED_ORDER) {
    const entry = state.databases[dbKey];
    const records = SEED[dbKey] ?? [];
    if (!entry || records.length === 0) continue;
    if (state.seeded[dbKey]) { log.skip(`${entry.name} bereits befüllt`); continue; }

    const types = propertyTypes[dbKey] ?? {};
    let n = 0;

    for (const record of records) {
      if (OPT.dryRun) { n++; continue; }

      const body =
        dbKey === "clients" ? P.clientFileBlocks()
        : dbKey === "projects" ? P.projectPageBlocks()
        : null;

      try {
        const page = await withRetry(
          () => notion.pages.create({
            parent: { type: "data_source_id", data_source_id: entry.dataSourceId },
            properties: buildProperties(record, types),
            ...(body ? { children: body.slice(0, 100) } : {}),
          }),
          { label: `${entry.name} Datensatz` }
        );
        if (record._ref) seedRefs[`${dbKey}:${record._ref}`] = page.id;
        n++;
      } catch (err) {
        warn(`${entry.name}: Datensatz nicht angelegt — ${errText(err)}`);
      }
    }

    if (!OPT.dryRun) { state.seeded[dbKey] = true; saveState(state); }
    log.ok(`${entry.name} — ${n} Datensätze`);
  }

  // Knowledge-Seiten haben einen Seitenkörper und laufen deshalb separat.
  const kb = state.databases.knowledge;
  if (kb && !state.seeded.knowledge) {
    const types = propertyTypes.knowledge ?? {};
    let n = 0;
    for (const entry of P.KNOWLEDGE_SEED) {
      if (OPT.dryRun) { n++; continue; }
      const props = { Title: { title: rt(entry.title) } };
      if (types.Category) props.Category = { select: { name: entry.category } };
      if (types.Status) {
        props.Status = types.Status === "select"
          ? { select: { name: entry.status } }
          : { status: { name: entry.status } };
      }
      if (types.Tags && entry.tags.length) props.Tags = { multi_select: entry.tags.map((t) => ({ name: t })) };

      try {
        await withRetry(
          () => notion.pages.create({
            parent: { type: "data_source_id", data_source_id: kb.dataSourceId },
            properties: props,
            children: entry.body.slice(0, 100),
          }),
          { label: `Knowledge ${entry.title}` }
        );
        n++;
      } catch (err) {
        warn(`Knowledge "${entry.title}" nicht angelegt — ${errText(err)}`);
      }
    }
    if (!OPT.dryRun) { state.seeded.knowledge = true; saveState(state); }
    log.ok(`Knowledge — ${n} Seiten`);
  }
}

/* ══════════════════════════════════════════════════════════════ ABLAUF */

async function main() {
  console.log("\n\x1b[1m  NOVERA STUDIO OS — Notion Builder\x1b[0m");
  if (OPT.dryRun) console.log("  \x1b[33mdry-run: es wird nichts geschrieben\x1b[0m");

  /* Seitengerüst zuerst — die Datenbanken brauchen ihre Elternseiten. */
  log.step("Seitengerüst anlegen");
  const hq = await createPage("hq", {
    parent: PARENT ?? "dry",
    title: "NOVERA STUDIO",
    icon: "◆",
    iconUrl: URLS.logo,   // das Novera-Emblem in der Seitenleiste
    blocks: null,
  });
  if (!URLS.logo) {
    warn("NOVERA_LOGO_URL nicht gesetzt — HQ bekommt ◆ statt des Logos. Siehe docs/BRANDING.md.");
  }
  const finance = await createPage("finance", {
    parent: hq, title: "Finance", icon: "💰", blocks: null,
  });
  const clientRecords = await createPage("clientRecords", {
    parent: hq, title: "Client Records", icon: "🗂️", blocks: null,
  });

  await createDatabases(hq);
  await createRelations();
  await createDerived("formulas", "Formeln anlegen");
  await createDerived("rollups", "Rollups anlegen");
  await createDerived("lateFormulas", "Formeln auf Rollups anlegen");
  if (OPT.views) await createViews(); else log.step("Ansichten übersprungen (--no-views)");

  /* Restliche Seiten — brauchen die Datenbank-IDs für ihre Verlinkungen. */
  log.step("Bereichsseiten füllen");
  const db = state.databases;

  await createPage("calendar", { parent: hq, title: "Calendar", icon: "📅", blocks: P.calendarPageBlocks(URLS) });
  await createPage("files", { parent: hq, title: "Files", icon: "📁", blocks: P.filesPageBlocks(URLS) });
  await createPage("google", { parent: hq, title: "Google Workspace", icon: "🔗", blocks: P.googleWorkspaceBlocks() });
  await createPage("tools", { parent: hq, title: "Business Tools", icon: "🧰", blocks: P.businessToolsBlocks() });

  if (!OPT.dryRun) {
    await appendBlocks(finance, P.financePageBlocks({ db }));
    await appendBlocks(clientRecords, P.clientRecordsBlocks({ db }));
    log.ok("Finance und Client Records gefüllt");
  }

  if (OPT.seed) {
    await refreshPropertyTypes();
    await seedData();
  } else {
    log.step("Beispieldaten übersprungen (--no-seed)");
  }

  /* HQ zuletzt — es verlinkt alles andere. */
  log.step("HQ-Dashboard aufbauen");
  const hqContent = P.hqBlocks({ db, pages: state.pages, urls: URLS });
  if (OPT.dryRun) {
    log.ok(`[dry-run] HQ — ${hqContent.length} Blöcke`);
  } else if (!state.pages.hqFilled) {
    await appendBlocks(hq, hqContent);
    state.pages.hqFilled = true;
    saveState(state);
    log.ok(`HQ — ${hqContent.length} Blöcke`);
  } else {
    log.skip("HQ ist bereits gefüllt");
  }

  /* ── Zusammenfassung ── */
  console.log("\n" + "─".repeat(60));
  console.log("\x1b[1m  Fertig.\x1b[0m");
  console.log(`  Datenbanken: ${Object.keys(state.databases).length}`);
  console.log(`  Ansichten:   ${Object.keys(state.views).length}`);
  console.log(`  Seiten:      ${Object.keys(state.pages).filter((k) => k !== "hqFilled").length}`);

  if (warnings.length) {
    console.log(`\n\x1b[33m  ${warnings.length} Hinweis(e):\x1b[0m`);
    warnings.forEach((w) => console.log(`    · ${w}`));
  }

  if (!OPT.dryRun) {
    console.log("\n  Jetzt noch von Hand: \x1b[36mdocs/MANUELL-EINZURICHTEN.md\x1b[0m");
    console.log("  Das sind die verknüpften Ansichten und Templates, die die API nicht anlegen kann.");
  }
  console.log("─".repeat(60) + "\n");
}

main().catch((err) => {
  console.error(`\n\x1b[31m✗ Abbruch: ${errText(err)}\x1b[0m`);
  if (err?.body) console.error(err.body);
  console.error("\nBereits angelegte Objekte stehen in .novera-state.json.");
  console.error("Ein erneuter Lauf setzt dort auf, wo es abgebrochen ist.");
  console.error("Wenn unklar ist, woran es liegt: npm run check\n");
  process.exit(1);
});
