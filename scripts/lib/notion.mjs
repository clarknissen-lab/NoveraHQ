/**
 * Client-Wrapper um @notionhq/client.
 *
 * Aufgaben:
 *   - Retry bei 429 (Rate Limit) und 5xx
 *   - State-File, damit ein zweiter Lauf nichts doppelt anlegt
 *   - Fehler-Isolation: schlägt ein Property-Batch fehl, wird Property für
 *     Property nachgezogen, damit ein einziger Tippfehler nicht den Lauf killt
 */

import { Client, APIResponseError } from "@notionhq/client";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const STATE_FILE = new URL("../../.novera-state.json", import.meta.url).pathname;

/* ───────────────────────────────────────────────────────────────── Logging */

const C = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

export const log = {
  step: (msg) => console.log(`\n${C.bold(C.cyan("▸ " + msg))}`),
  ok: (msg) => console.log(`  ${C.green("✓")} ${msg}`),
  skip: (msg) => console.log(`  ${C.dim("·")} ${C.dim(msg)}`),
  warn: (msg) => console.log(`  ${C.yellow("!")} ${C.yellow(msg)}`),
  fail: (msg) => console.log(`  ${C.red("✗")} ${C.red(msg)}`),
  info: (msg) => console.log(`  ${C.dim(msg)}`),
};

/** Gesammelte Warnungen — werden am Ende als Zusammenfassung ausgegeben. */
export const warnings = [];
export function warn(msg) {
  warnings.push(msg);
  log.warn(msg);
}

/* ─────────────────────────────────────────────────────────────────── State */

export function loadState() {
  if (!existsSync(STATE_FILE)) return { databases: {}, pages: {}, views: {}, seeded: {} };
  try {
    const s = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    return { databases: {}, pages: {}, views: {}, seeded: {}, ...s };
  } catch {
    warn(`State-File ${STATE_FILE} ist beschädigt — es wird neu aufgebaut.`);
    return { databases: {}, pages: {}, views: {}, seeded: {} };
  }
}

export function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

/* ────────────────────────────────────────────────────────────────── Client */

export function makeClient(token, baseUrl = null) {
  return new Client({
    auth: token,
    notionVersion: "2025-09-03",
    // Nur für den Prüflauf gegen den lokalen Nachbau (npm run verify).
    ...(baseUrl ? { baseUrl } : {}),
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Führt einen API-Call aus und wiederholt ihn bei Rate-Limit oder Serverfehler.
 * Fachliche Fehler (validation_error) werden sofort durchgereicht — die wiederholen
 * sich ohnehin.
 */
export async function withRetry(fn, { label = "request", attempts = 5 } = {}) {
  let delay = 1000;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const retryable =
        err instanceof APIResponseError
          ? err.status === 429 || err.status >= 500
          : /ECONNRESET|ETIMEDOUT|EAI_AGAIN|fetch failed/i.test(String(err?.message));

      if (!retryable || i === attempts) throw err;

      const wait = err?.headers?.get?.("retry-after")
        ? Number(err.headers.get("retry-after")) * 1000
        : delay;
      log.skip(`${label}: Versuch ${i} fehlgeschlagen (${err.status ?? "netz"}), neuer Versuch in ${wait}ms`);
      await sleep(wait);
      delay = Math.min(delay * 2, 16000);
    }
  }
}

export function errText(err) {
  if (err instanceof APIResponseError) return `${err.status} ${err.code}: ${err.message}`;
  return String(err?.message ?? err);
}

/* ─────────────────────────────────────────────────── Property-Updates */

/**
 * Fügt Properties zu einer Data Source hinzu.
 *
 * Erst als Batch. Schlägt der Batch fehl, wird jede Property einzeln versucht,
 * damit genau benannt werden kann, welche nicht durchging — und alle anderen
 * trotzdem ankommen.
 *
 * @returns {Promise<string[]>} Namen der Properties, die NICHT angelegt werden konnten
 */
export async function addProperties(notion, dataSourceId, properties, label) {
  const names = Object.keys(properties);
  if (names.length === 0) return [];

  try {
    await withRetry(
      () => notion.dataSources.update({ data_source_id: dataSourceId, properties }),
      { label }
    );
    return [];
  } catch (batchErr) {
    log.skip(`${label}: Batch abgelehnt (${errText(batchErr)}) — einzeln nachziehen`);
  }

  const failed = [];
  for (const name of names) {
    try {
      await withRetry(
        () =>
          notion.dataSources.update({
            data_source_id: dataSourceId,
            properties: { [name]: properties[name] },
          }),
        { label: `${label}/${name}` }
      );
    } catch (err) {
      failed.push(name);
      warn(`${label}: Property "${name}" konnte nicht angelegt werden — ${errText(err)}`);
    }
  }
  return failed;
}

/* ────────────────────────────────────────────────────────── Rich Text */

/** Notion-Rich-Text aus einfachem Text. Kürzt auf das 2000-Zeichen-Limit. */
export function rt(content, annotations = {}, link = null) {
  return [
    {
      type: "text",
      text: { content: String(content).slice(0, 2000), link: link ? { url: link } : null },
      annotations,
    },
  ];
}

/** Mehrere Rich-Text-Segmente in einem Block, z.B. fett + normal gemischt. */
export function rtParts(parts) {
  return parts.map(([content, annotations = {}, link = null]) => ({
    type: "text",
    text: { content: String(content).slice(0, 2000), link: link ? { url: link } : null },
    annotations,
  }));
}
