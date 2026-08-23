#!/usr/bin/env node
/**
 * Verbindungstest.
 *
 *   npm run check
 *
 * Prüft der Reihe nach: Node-Version, .env, Token, Elternseite, Schreibrecht.
 * Bricht beim ersten Problem ab und sagt konkret, was zu tun ist — damit man
 * das nicht erst mitten im Aufbau merkt.
 */

import { loadEnv } from "./lib/env.mjs";
import { makeClient, errText } from "./lib/notion.mjs";
import { existsSync } from "node:fs";

const C = {
  ok:   (s) => `\x1b[32m✓\x1b[0m ${s}`,
  bad:  (s) => `\x1b[31m✗\x1b[0m ${s}`,
  dim:  (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

function fail(what, why, fix) {
  console.log(C.bad(what));
  console.log(`\n  ${why}\n`);
  console.log(`  ${C.bold("So geht es weiter:")}`);
  fix.split("\n").forEach((l) => console.log(`  ${l}`));
  console.log("");
  process.exit(1);
}

function normalizeId(raw) {
  if (!raw) return null;
  const m = String(raw).match(
    /([0-9a-f]{32})|([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  );
  if (!m) return null;
  const id = m[0].replace(/-/g, "");
  return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}

console.log(`\n  ${C.bold("Novera Studio OS — Verbindungstest")}\n`);

/* ── 1. Node-Version ─────────────────────────────────────────────────── */

const major = Number(process.versions.node.split(".")[0]);
if (major < 18) {
  fail(
    `Node ${process.versions.node} ist zu alt`,
    "Der Builder braucht Node 18 oder neuer.",
    "Aktuelle Version von nodejs.org installieren, Terminal neu öffnen,\n" +
      "dann noch einmal: npm run check"
  );
}
console.log(C.ok(`Node ${process.versions.node}`));

/* ── 2. .env ─────────────────────────────────────────────────────────── */

const env = loadEnv();
if (!env.loaded && !process.env.NOTION_TOKEN) {
  fail(
    ".env fehlt",
    "Die Datei mit deinen Zugangsdaten ist noch nicht angelegt.",
    "cp .env.example .env        (Windows: copy .env.example .env)\n\n" +
      "Danach .env in einem Editor öffnen und NOTION_TOKEN sowie\n" +
      "NOTION_PARENT_PAGE eintragen."
  );
}
console.log(C.ok(env.loaded ? `.env gelesen (${env.keys.length} Einträge)` : "Werte aus der Umgebung"));

/* ── 3. Token vorhanden und plausibel ────────────────────────────────── */

const token = process.env.NOTION_TOKEN;
if (!token || token.includes("hier_dein_secret")) {
  fail(
    "NOTION_TOKEN fehlt",
    "In .env steht noch kein echtes Secret.",
    "1. notion.so/my-integrations öffnen\n" +
      "2. Deine Integration anklicken\n" +
      "3. Internal Integration Secret → Show → kopieren\n" +
      "4. In .env bei NOTION_TOKEN einsetzen"
  );
}
if (!/^(ntn_|secret_)/.test(token)) {
  fail(
    "NOTION_TOKEN sieht nicht wie ein Notion-Secret aus",
    `Es beginnt mit "${token.slice(0, 6)}…" — erwartet wird ntn_ oder secret_.`,
    "Prüfe, ob du versehentlich die Integration-ID statt des Secrets kopiert hast.\n" +
      "Das Secret steht unter: Configure → Internal Integration Secret → Show"
  );
}
console.log(C.ok(`Token gefunden (${token.slice(0, 7)}…)`));

/* ── 4. Elternseite angegeben ────────────────────────────────────────── */

const rawParent = process.env.NOTION_PARENT_PAGE;
const parent = normalizeId(rawParent);
if (!parent) {
  fail(
    "NOTION_PARENT_PAGE fehlt oder ist keine Notion-Adresse",
    rawParent
      ? `Aus "${String(rawParent).slice(0, 50)}" lässt sich keine Seiten-ID lesen.`
      : "In .env steht noch keine Seite.",
    "1. In Notion eine leere Seite anlegen, z.B. „Novera“\n" +
      "2. Die Adresse aus der Browserzeile kopieren\n" +
      "3. Komplett in .env bei NOTION_PARENT_PAGE einsetzen\n\n" +
      "In der Notion-App: ••• → Copy link"
  );
}
console.log(C.ok(`Elternseite ${parent.slice(0, 8)}…`));

/* ── 5. Token gültig? ────────────────────────────────────────────────── */

const notion = makeClient(token, process.env.NOTION_BASE_URL || null);

let me;
try {
  me = await notion.users.me({});
} catch (err) {
  const status = err?.status;
  if (status === 401) {
    fail(
      "Notion weist das Token zurück",
      "Das Secret ist ungültig oder wurde zurückgezogen.",
      "notion.so/my-integrations → Integration → Secret neu kopieren\n" +
        "und in .env einsetzen."
    );
  }
  fail(
    "Keine Verbindung zu Notion",
    errText(err),
    "Internetverbindung prüfen. Hinter einem Firmennetz kann api.notion.com\n" +
      "gesperrt sein — dann in einem anderen Netz versuchen."
  );
}
console.log(C.ok(`Token gültig — Integration „${me?.name ?? "?"}“`));

/* ── 6. Elternseite erreichbar? ──────────────────────────────────────── */

let page;
try {
  page = await notion.pages.retrieve({ page_id: parent });
} catch (err) {
  if (err?.status === 404) {
    fail(
      "Die Seite ist nicht mit der Integration verbunden",
      "Notion zeigt Integrationen ausschließlich Seiten, die ausdrücklich für sie\n" +
        "  freigegeben wurden. Das ist der mit Abstand häufigste Fehler.",
      "1. Die Seite in Notion öffnen\n" +
        "2. Oben rechts auf •••\n" +
        "3. Connections (Verbindungen) → Connect to\n" +
        `4. Deine Integration „${me?.name ?? "Novera Builder"}“ auswählen\n\n` +
        "Dann noch einmal: npm run check"
    );
  }
  fail("Die Seite lässt sich nicht lesen", errText(err), "Ist die Adresse wirklich eine Seite und keine Datenbank?");
}

const pageTitle =
  page?.properties?.title?.title?.[0]?.plain_text ??
  Object.values(page?.properties ?? {})
    .find((p) => p.type === "title")?.title?.[0]?.plain_text ??
  "ohne Titel";

console.log(C.ok(`Seite erreichbar — „${pageTitle}“`));

/* ── 7. Schreibrecht ─────────────────────────────────────────────────── */

try {
  // Das Setzen desselben Icons ändert nichts, verlangt aber Schreibrecht.
  await notion.pages.update({ page_id: parent, icon: page.icon ?? null });
} catch (err) {
  if (err?.status === 403) {
    fail(
      "Die Integration darf nicht schreiben",
      "Sie kann lesen, aber nichts anlegen.",
      "notion.so/my-integrations → Integration → Capabilities\n" +
        "Dort „Insert content“ und „Update content“ aktivieren."
    );
  }
  fail("Schreibtest fehlgeschlagen", errText(err), "Capabilities der Integration prüfen.");
}
console.log(C.ok("Schreibrecht vorhanden"));

/* ── Optionales ──────────────────────────────────────────────────────── */

console.log("");
const optional = [
  ["NOVERA_CLOCK_URL", "Header mit Logo, Uhr und Fokus-Timer"],
  ["NOVERA_SPOTIFY_URL", "Arbeitsplaylist"],
  ["NOVERA_GCAL_EMBED_URL", "Google Calendar im Dashboard"],
  ["NOVERA_DRIVE_URL", "Drive-Hauptordner"],
];
for (const [key, what] of optional) {
  const set = Boolean(process.env[key]);
  console.log(
    set ? C.ok(C.dim(what)) : `  ${C.dim("·")} ${C.dim(what + " — " + key + " nicht gesetzt")}`
  );
}

const stateExists = existsSync(new URL("../.novera-state.json", import.meta.url).pathname);

console.log("\n" + "─".repeat(58));
console.log(`  ${C.bold("Alles bereit.")}`);
if (stateExists) {
  console.log(C.dim("  Es gibt bereits einen Lauf. Ein erneuter Build ergänzt nur,"));
  console.log(C.dim("  was noch fehlt, und legt nichts doppelt an."));
}
console.log(`\n  Jetzt bauen:  ${C.cyan("npm run build")}`);
console.log("─".repeat(58) + "\n");
