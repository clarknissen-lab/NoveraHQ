/**
 * Bausteine für Notion-Seiten.
 *
 * Designregeln, die hier eingebaut sind:
 *   - Überschriften tragen die Struktur, nicht Emojis
 *   - Callouts sind die "Cards" aus den Referenz-Screenshots
 *   - Divider statt Farbflächen für Sektionsgrenzen
 *   - Akzentfarbe nur dort, wo sie Bedeutung hat (Status, aktive Sektion)
 */

import { rt, rtParts } from "./notion.mjs";

export const h1 = (t, color = "default") => ({
  heading_1: { rich_text: rt(t), color, is_toggleable: false },
});

export const h2 = (t, color = "default") => ({
  heading_2: { rich_text: rt(t), color, is_toggleable: false },
});

export const h3 = (t, color = "default") => ({
  heading_3: { rich_text: rt(t), color, is_toggleable: false },
});

export const p = (t, color = "default") => ({
  paragraph: { rich_text: typeof t === "string" ? rt(t) : t, color },
});

export const parts = (segments, color = "default") => ({
  paragraph: { rich_text: rtParts(segments), color },
});

/**
 * Sektionskopf mit getöntem Band — die durchgehenden Balken aus der
 * Designvorlage. Bleibt eine echte Überschrift (statt eines Callouts),
 * damit Inhaltsverzeichnis, Suche und die Mobilansicht sie als Gliederung
 * erkennen.
 *
 * Die Tönung hängt am Ambiente-Schalter: mit Ambiente ein gedämpftes
 * Violett, ohne das neutrale Grau. Notion lässt nur die eigene Palette zu,
 * feinere Abstufungen sind nicht möglich.
 */
let sectionColor = "gray_background";

/** Wird vom Builder vor dem Seitenaufbau gesetzt. */
export const setSectionColor = (color) => { sectionColor = color; };

export const section = (t) => h2(t, sectionColor);

export const divider = () => ({ divider: {} });

export const quote = (t, color = "default") => ({
  quote: { rich_text: rt(t), color },
});

export const bullet = (t, color = "default") => ({
  bulleted_list_item: { rich_text: typeof t === "string" ? rt(t) : t, color },
});

export const numbered = (t) => ({
  numbered_list_item: { rich_text: typeof t === "string" ? rt(t) : t },
});

export const todo = (t, checked = false) => ({
  to_do: { rich_text: rt(t), checked },
});

export const code = (t, language = "plain text") => ({
  code: { rich_text: rt(t), language },
});

/** Card. `color` erwartet Notion-Background-Farben wie "gray_background". */
export const callout = (text, icon = "▪", color = "default", children = null) => ({
  callout: {
    rich_text: typeof text === "string" ? rt(text) : text,
    icon: { type: "emoji", emoji: icon },
    color,
    ...(children ? { children } : {}),
  },
});

export const toggle = (t, children = [], color = "default") => ({
  toggle: { rich_text: rt(t), color, children },
});

/** Externe Verlinkung als Karte — öffnet in einem neuen Tab. */
export const bookmark = (url, caption = null) => ({
  bookmark: { url, ...(caption ? { caption: rt(caption) } : {}) },
});

export const embed = (url, caption = null) => ({
  embed: { url, ...(caption ? { caption: rt(caption) } : {}) },
});

/** Verweis auf eine andere Notion-Seite (Navigation). */
export const linkToPage = (pageId) => ({
  link_to_page: { type: "page_id", page_id: pageId },
});

/** Verweis auf eine Datenbank. */
export const linkToDatabase = (databaseId) => ({
  link_to_page: { type: "database_id", database_id: databaseId },
});

export const tableOfContents = (color = "gray") => ({
  table_of_contents: { color },
});

/**
 * Spaltenlayout. Notion verlangt mindestens zwei Spalten.
 * `columns` ist ein Array von Block-Arrays.
 */
export const columns = (cols) => ({
  column_list: {
    children: cols.map((children) => ({ column: { children } })),
  },
});

/**
 * Ein Link in einer Liste, dargestellt als Bullet mit Linktext.
 * Bewusst kein Bookmark — bei zehn Links hintereinander wären Karten zu laut.
 */
export const linkItem = (label, url, note = null) =>
  bullet(
    rtParts([
      [label, { bold: true }, url],
      ...(note ? [["  " + note, { italic: true, color: "gray" }]] : []),
    ])
  );

/**
 * Platzhalter für alles, was die Notion-API nicht anlegen kann
 * (Linked Views, Datenbank-Templates). Fällt optisch auf, damit klar ist,
 * wo noch ein Handgriff fehlt.
 */
export const manualSlot = (title, instruction) =>
  callout(
    rtParts([
      [title, { bold: true }],
      ["\n" + instruction, { color: "gray" }],
    ]),
    "🔧",
    "orange_background"
  );
