/**
 * Liest eine .env-Datei ein.
 *
 * Ohne das müsste man Umgebungsvariablen im Terminal setzen — und das geht auf
 * macOS, Windows PowerShell und Windows CMD jeweils anders. Eine Textdatei
 * funktioniert überall gleich.
 *
 * Bewusst ohne Abhängigkeit: das Format ist einfach genug.
 * Bereits gesetzte echte Umgebungsvariablen haben Vorrang.
 */

import { readFileSync, existsSync } from "node:fs";

const ENV_FILE = new URL("../../.env", import.meta.url).pathname;

export function loadEnv(file = ENV_FILE) {
  if (!existsSync(file)) return { loaded: false, keys: [] };

  const keys = [];
  const raw = readFileSync(file, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    // Anführungszeichen entfernen, falls jemand welche gesetzt hat.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!key) continue;

    // Eine echte Umgebungsvariable schlägt die Datei — praktisch beim Testen.
    if (process.env[key] === undefined) process.env[key] = value;
    keys.push(key);
  }

  return { loaded: true, keys, file };
}
