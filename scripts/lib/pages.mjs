/**
 * Seitenaufbau: Dashboard, Kundenakte, Projekt- und Blueprint-Vorlagen,
 * Werkzeugseiten.
 *
 * Zu den orange markierten Platzhaltern: Die Notion-API kann keine verknüpfte
 * Datenbankansicht in eine Seite einfügen — es gibt schlicht keinen Blocktyp
 * dafür. Überall dort, wo eine gefilterte Live-Liste hingehört, steht deshalb
 * ein Hinweis mit der exakten Klickanweisung. Die Ansichten selbst sind in den
 * Datenbanken bereits fertig angelegt; es muss nur noch gezeigt werden, wo sie
 * erscheinen sollen. Siehe docs/MANUELL-EINZURICHTEN.md.
 */

import {
  h1, h2, h3, section, p, parts, divider, callout, toggle, bullet, numbered, todo,
  bookmark, embed, linkToPage, linkToDatabase, columns, linkItem, manualSlot, quote, code,
} from "./blocks.mjs";
import { rtParts } from "./notion.mjs";

const compact = (arr) => arr.filter(Boolean);

/** Zeilenumbruch innerhalb eines Rich-Text-Segments. */
const NL = "\n";

/* ────────────────────────────────────────────────────────── Werkzeuge */

export const GOOGLE_WORKSPACE = [
  ["Gmail", "https://mail.google.com", "📧", "Kundenkommunikation"],
  ["Google Drive", "https://drive.google.com", "📁", "Dateiablage — der eigentliche Speicher"],
  ["Google Calendar", "https://calendar.google.com", "📅", "Termine"],
  ["Google Docs", "https://docs.google.com", "📝", "Angebote, Briefings"],
  ["Google Sheets", "https://sheets.google.com", "📊", "Listen, Kalkulationen"],
];

export const BUSINESS_TOOLS = [
  ["Hostinger", "https://hpanel.hostinger.com", "☁️", "Hosting und Domains"],
  ["1Password", "https://my.1password.com", "🔐", "Alle Passwörter und Zugangsdaten"],
  ["Papierkram", "https://www.papierkram.de", "🧾", "Buchhaltung, Rechnungen, Belege"],
];

/**
 * Claude-Projekte je Arbeitsbereich. Ein Projekt je Aufgabe hält den Kontext
 * sauber, statt alles in einer langen Unterhaltung zu vermischen.
 *
 * Die Adressen entstehen erst beim Anlegen in Claude — deshalb steht hier
 * bewusst kein erfundener Link, sondern ein Platzhalter.
 */
export const NOVERA_AI = [
  ["Claude · Master", "Systemaufbau, Struktur, übergreifende Fragen"],
  ["Claude · Sales", "Ansprache, Follow-ups, Einwandbehandlung"],
  ["Claude · Angebote", "Angebotstexte, Leistungsbeschreibungen, Preisgespräche"],
  ["Claude · Websites", "Blueprints, Texte, Code, SEO"],
];

/** Für die kompakte Navigationsspalte auf dem Dashboard. */
export const NOVERA_TOOLS = [...GOOGLE_WORKSPACE, ...BUSINESS_TOOLS];

/**
 * Quick Links auf dem Dashboard (§21). Bewusst kurz gehalten — das ist die
 * Liste, die man im Alltag anklickt, nicht die vollständige Werkzeugübersicht.
 *
 * Spotify und GitHub verweisen auf die Startseiten. Sobald du eine konkrete
 * Playlist oder ein Repo willst, trägst du die Adresse in .env ein
 * (NOVERA_SPOTIFY_URL, NOVERA_GITHUB_URL) — erfundene Links stehen hier keine.
 */
export const QUICK_LINKS = [
  ["Gmail", "https://mail.google.com", "📧"],
  ["Google Drive", "https://drive.google.com", "📁"],
  ["Google Calendar", "https://calendar.google.com", "📅"],
  ["Claude", "https://claude.ai", "🤖"],
  ["Hostinger", "https://hpanel.hostinger.com", "🌐"],
  ["1Password", "https://my.1password.com", "🔐"],
  ["Papierkram", "https://www.papierkram.de", "💰"],
  ["GitHub", "https://github.com", "💻"],
  ["Spotify", "https://open.spotify.com", "🎵"],
];

/* ═══════════════════════════════════════════════════════════ DASHBOARD */

export function hqBlocks({ db, pages, urls }) {
  const dbLink = (key) => (db[key] ? linkToDatabase(db[key].databaseId) : null);
  const pgLink = (key) => (pages[key] ? linkToPage(pages[key]) : null);

  /**
   * Platz für eine verknüpfte Ansicht.
   *
   * Bewusst leise: ein grauer Kasten mit dem Namen der Ansicht, mehr nicht.
   * Die Klickanweisung steht gesammelt im Toggle am Seitenende — stünde sie
   * hier, bestünde das Dashboard aus mehr Anleitung als Inhalt.
   */
  const platz = (datenbank, ansicht) =>
    callout(
      rtParts([
        [datenbank, { bold: true }],
        ["  ", {}],
        [ansicht, { color: "gray" }],
      ]),
      "\u25FD",
      "gray_background"
    );

  /** Karte, die in eine Datenbank springt. */
  const karte = (icon, titel, zeile, key) =>
    callout(
      rtParts([[titel, { bold: true }], [NL + zeile, { color: "gray" }]]),
      icon,
      "gray_background",
      db[key] ? [linkToDatabase(db[key].databaseId)] : undefined
    );

  return compact([
    /* ── Kopf ──────────────────────────────────────────────────────────── */
    ...(urls.clock
      ? [embed(urls.clock, "Novera Studio \u00B7 Wochentag, Datum und Uhrzeit")]
      : [h1("NOVERA STUDIO"), parts([["Business Command Center", { color: "gray" }]])]),

    /* ── Heute ─────────────────────────────────────────────────────────── */
    section("Heute"),
    columns([
      [
        h3("Überfällig"),
        platz("Aufgaben", "Überfällig"),
        h3("Heute fällig"),
        platz("Aufgaben", "Heute"),
      ],
      [
        h3("Follow-ups"),
        platz("Leads", "Heute kontaktieren"),
        h3("Dringende Projekte"),
        platz("Projekte", "Dringend"),
      ],
    ]),

    ...(urls.googleCalendarEmbed
      ? [h3("Termine heute"), embed(urls.googleCalendarEmbed, "Google Calendar")]
      : []),

    /* ── Arbeitsbereich ────────────────────────────────────────────────── */
    section("Arbeitsbereich"),
    columns([
      [karte("\u2705", "Aufgaben", "Alles, was zu tun ist", "aufgaben")],
      [karte("\uD83C\uDFAF", "Leads", "Vom Fund bis zum Kunden", "leads")],
      [karte("\uD83D\uDC65", "Kunden", "Die zentrale Akte", "kunden")],
    ]),
    columns([
      [karte("\uD83D\uDE80", "Projekte", "Was gerade läuft", "projekte")],
      [karte("\uD83C\uDF10", "Websites", "Technischer Stand", "websites")],
      [karte("\uD83D\uDCC4", "Angebote", "Verschickt und offen", "angebote")],
    ]),
    columns([
      [karte("\uD83E\uDDE0", "Blueprints", "Der Bauplan je Website", "blueprints")],
      [karte("\uD83D\uDCBE", "Hosting", "Domains und Verlängerungen", "hosting")],
      [karte("\uD83D\uDD10", "Zugänge", "Ohne Passwörter", "zugaenge")],
    ]),

    /* ── Projekte ──────────────────────────────────────────────────────── */
    section("Aktive Projekte"),
    platz("Projekte", "Aktiv"),

    /* ── Sales ─────────────────────────────────────────────────────────── */
    section("Sales"),
    columns([
      [h3("Neue Leads"), platz("Leads", "Neue Leads")],
      [h3("Offene Angebote"), platz("Angebote", "Offen")],
    ]),

    /* ── Technik ───────────────────────────────────────────────────────── */
    section("Technik"),
    columns([
      [h3("Domains"), platz("Hosting & Domains", "Domainverlängerungen")],
      [h3("Novera Care"), platz("Kunden", "Novera Care")],
    ]),

    /* ── Quick Links ───────────────────────────────────────────────────── */
    section("Quick Links"),
    ...(() => {
      const links = QUICK_LINKS.map(([label, url, icon]) => {
        if (label === "GitHub" && urls.github) return [label, urls.github, icon];
        if (label === "Spotify" && urls.spotify) return [label, urls.spotify, icon];
        return [label, url, icon];
      });
      const spalte = (von, bis) =>
        links.slice(von, bis).map(([label, url, icon]) => linkItem(`${icon} ${label}`, url));
      return [columns([spalte(0, 3), spalte(3, 6), spalte(6)])];
    })(),

    /* ── Fokus und Musik ───────────────────────────────────────────────── */
    section("Fokus"),
    columns([
      [
        urls.focus
          ? embed(urls.focus, "25 Minuten Arbeit, 5 Minuten Pause")
          : p("Fokus-Timer erscheint, sobald NOVERA_CLOCK_URL gesetzt ist."),
      ],
      [
        urls.spotifyEmbed
          ? embed(urls.spotifyEmbed, "Arbeitsplaylist")
          : p("Playlist erscheint, sobald NOVERA_SPOTIFY_URL gesetzt ist."),
      ],
    ]),

    divider(),

    /* ── Alles Weitere zusammengeklappt ────────────────────────────────── */
    einrichtungsToggle(pages),
    weitereSeiten(pages),
    systemregeln(),
  ]);
}

/**
 * Die Einrichtungsanleitung als Toggle statt als Kästen zwischen den Inhalten.
 * Sobald alle Ansichten sitzen, löscht man den Toggle.
 */
function einrichtungsToggle() {
  const zeile = (abschnitt, datenbank, ansicht, spalten) =>
    bullet(
      rtParts([
        [abschnitt, { bold: true }],
        ["  \u2192  ", { color: "gray" }],
        [datenbank + " / " + ansicht, { code: true }],
        [spalten ? "  \u00B7  " + spalten : "", { color: "gray" }],
      ])
    );

  return toggle("Verknüpfte Ansichten einsetzen \u2014 einmalig, ca. 10 Minuten", [
    p("Die grauen Kästen oben sind Platzhalter. Die Ansichten selbst liegen fertig " +
      "gefiltert in den Datenbanken — du zeigst nur, wo sie erscheinen sollen."),
    p(""),
    numbered("In den grauen Kasten klicken, Inhalt markieren, löschen"),
    numbered("/verknüpfte tippen \u2192 „Verknüpfte Ansicht einer Datenbank“"),
    numbered("Datenbank auswählen, dann oben die genannte Ansicht"),
    numbered("Bei den Listen: ••• \u2192 Limit \u2192 5"),
    p(""),
    quote("Immer eine vorhandene Ansicht wählen statt neu zu filtern. Änderst du " +
          "später den Filter in der Datenbank, ziehen alle Einbettungen mit."),
    p(""),
    zeile("Heute \u00B7 Überfällig", "Aufgaben", "Überfällig", "Aufgabe, Frist, Kunde"),
    zeile("Heute \u00B7 Heute fällig", "Aufgaben", "Heute", "Aufgabe, Uhrzeit, Kunde"),
    zeile("Heute \u00B7 Follow-ups", "Leads", "Heute kontaktieren", "Unternehmen, Priorität"),
    zeile("Heute \u00B7 Dringende Projekte", "Projekte", "Dringend", "Projektname, Kunde, Frist"),
    zeile("Aktive Projekte", "Projekte", "Aktiv", "Kunde, Frist, Fortschrittsbalken"),
    zeile("Sales \u00B7 Neue Leads", "Leads", "Neue Leads", "Unternehmen, Lead Score"),
    zeile("Sales \u00B7 Offene Angebote", "Angebote", "Offen", "Kunde, Gesamtpreis, Gültigkeit"),
    zeile("Technik \u00B7 Domains", "Hosting & Domains", "Domainverlängerungen", "Domain, Ablauf"),
    zeile("Technik \u00B7 Novera Care", "Kunden", "Novera Care", "Firmenname, Monatsbetrag"),
    p(""),
    p("Die Kundenakte und die Projektvorlage brauchen dieselbe Behandlung — das " +
      "steht in docs/MANUELL-EINZURICHTEN.md."),
  ]);
}

/** Kalender, Werkzeuge, Dokumente, System — selten gebraucht, deshalb unten. */
function weitereSeiten(pages) {
  const pgLink = (key) => (pages[key] ? linkToPage(pages[key]) : null);
  const ziele = compact([pgLink("kalender"), pgLink("tools"), pgLink("dokumente"), pgLink("system")]);
  if (ziele.length === 0) return null;
  return toggle("Weitere Seiten", ziele);
}

/** Wer ist wofür zuständig. Als Toggle, damit das Dashboard ruhig bleibt. */
function systemregeln() {
  return toggle("Was gehört wohin", [
    p("Jede Information hat genau einen Ort. Das ist der Grund, warum es in Notion keine Rechnungen und keine Passwörter gibt."),
    bullet(rtParts([["Notion", { bold: true }], [" — Leads, Kunden, Projekte, Websites, Blueprints, Angebote, Aufgaben, Hosting"]])),
    bullet(rtParts([["Google Drive", { bold: true }], [" — alle Dateien. Notion hält nur den Ordnerlink."]])),
    bullet(rtParts([["Papierkram", { bold: true }], [" — Buchhaltung, Rechnungen, Belege, Steuer."]])),
    bullet(rtParts([["1Password", { bold: true }], [" — Passwörter, Passkeys, Recovery Codes."]])),
    p(""),
    quote("Notion dokumentiert, dass ein Zugang existiert. 1Password speichert ihn."),
  ]);
}

/* ═════════════════════════════════════════════════════════ KUNDENAKTE */

/**
 * Seitenkörper eines Kunden. Wird beim Musterkunden gesetzt und dient als
 * Vorlage für das Datenbank-Template.
 */
export function kundenakteBlocks() {
  return [
    callout(
      rtParts([
        ["Kundenakte", { bold: true }],
        ["  ·  Stammdaten stehen oben in den Eigenschaften. Alles Weitere hängt über Relations daran.", { color: "gray" }],
      ]),
      "◾",
      "gray_background"
    ),

    section("🎯 Herkunft"),
    p("Aus welchem Lead dieser Kunde entstanden ist — steht oben in der " +
      "Eigenschaft „Lead“. Von dort aus sind Sales Angle und Gesprächsverlauf " +
      "einen Klick entfernt."),

    section("🚀 Projekte"),
    manualSlot(
      "Verknüpfte Ansicht: Projekte, gefiltert auf diesen Kunden",
      "/verknüpfte → Projekte → Filter: Kunde enthält → „Diese Seite“."
    ),

    section("📄 Angebote"),
    manualSlot(
      "Verknüpfte Ansicht: Angebote, gefiltert auf diesen Kunden",
      "/verknüpfte → Angebote → Filter: Kunde enthält → „Diese Seite“. " +
        "Summenzeile bei Gesamtpreis auf Summe stellen."
    ),

    section("🌐 Websites"),
    manualSlot(
      "Verknüpfte Ansicht: Websites, gefiltert auf diesen Kunden",
      "/verknüpfte → Websites → Filter: Kunde enthält → „Diese Seite“. " +
        "Spalten: Website, Status, Domain, Live-URL, Branding."
    ),

    section("🧠 Blueprints"),
    manualSlot(
      "Verknüpfte Ansicht: Website Blueprints, gefiltert auf diesen Kunden",
      "/verknüpfte → Website Blueprints → Filter: Kunde enthält → „Diese Seite“. " +
        "Spalten: Blueprint, Version, Status, Kundenfreigabe."
    ),

    section("🎨 Branding"),
    p("Der Link zum Markenordner steht bei der Website in der Eigenschaft " +
      "„Branding“. Die Vorgaben selbst — Logo, Farben, Typografie, Bildsprache — " +
      "stehen im Blueprint, wo sie beim Bauen gebraucht werden."),

    section("✅ Aufgaben"),
    manualSlot(
      "Verknüpfte Ansicht: Aufgaben, gefiltert auf diesen Kunden",
      "/verknüpfte → Aufgaben → Filter: Kunde enthält → „Diese Seite“, Status ist nicht Erledigt."
    ),

    section("☁️ Hosting & Domain"),
    manualSlot(
      "Verknüpfte Ansicht: Hosting & Domains, gefiltert auf diesen Kunden",
      "/verknüpfte → Hosting & Domains → Filter: Kunde enthält → „Diese Seite“."
    ),

    section("🔐 Zugänge"),
    callout(
      rtParts([
        ["Keine Passwörter in Notion.", { bold: true }],
        ["  Hier steht nur, welche Zugänge existieren. Die Passwörter liegen in 1Password.", { color: "gray" }],
      ]),
      "🔐",
      "red_background"
    ),
    manualSlot(
      "Verknüpfte Ansicht: Zugänge, gefiltert auf diesen Kunden",
      "/verknüpfte → Zugänge → Filter: Kunde enthält → „Diese Seite“."
    ),

    section("📁 Dateien"),
    p("Alle Dateien liegen in Google Drive. Der Ordnerlink steht oben in der Eigenschaft „Google Drive“."),

    section("📝 Notizen"),
    p("Freier Bereich. Gesprächsnotizen, Besonderheiten, Absprachen — was später nachvollziehbar sein soll."),
    bullet("Beispiel: 23.08. Telefonat — zusätzliche Leistungsseite gewünscht, Bilder folgen."),
  ];
}

/* ═══════════════════════════════════════════════════ PROJEKTSEITE */

/** Seitenkörper eines Projekts, mit der vollständigen Website-Checkliste. */
export function projektBlocks() {
  return [
    callout(
      rtParts([
        ["Website-Projekt", { bold: true }],
        ["  ·  Kunde, Deadline, Preis und Fortschritt stehen oben in den Eigenschaften.", { color: "gray" }],
      ]),
      "◾",
      "gray_background"
    ),

    section("Ziel"),
    p("Was soll die Website erreichen? Zwei, drei Sätze — kurz genug, dass man sie im Vorbeigehen liest."),

    section("Aufgaben"),
    manualSlot(
      "Verknüpfte Ansicht: Aufgaben, gefiltert auf dieses Projekt",
      "/verknüpfte → Aufgaben → Filter: Projekt enthält → „Diese Seite“."
    ),

    section("Checkliste"),
    p("Der komplette Weg von der Konzeption bis zum Launch."),

    h3("Konzept"),
    todo("Kundenanalyse"),
    todo("Zielgruppe"),
    todo("Ziel der Website"),
    todo("Seitenstruktur"),
    todo("Handlungsaufforderung festgelegt"),
    todo("SEO-Konzept"),

    h3("Branding"),
    todo("Logo"),
    todo("Farben"),
    todo("Typografie"),
    todo("Bildsprache"),

    h3("Mockups"),
    todo("Desktop"),
    todo("Mobile"),
    todo("Mockups sauber ausgerichtet, keine Überlappungen"),
    todo("Blueprint vom Kunden freigegeben"),

    h3("Entwicklung"),
    todo("Desktop"),
    todo("Tablet"),
    todo("Mobile"),
    todo("Navigation"),
    todo("Formulare"),
    todo("Buttons"),
    todo("Animationen"),

    h3("SEO"),
    todo("Meta Titles"),
    todo("Meta Descriptions"),
    todo("Überschriftenstruktur"),
    todo("Alt-Texte"),
    todo("Sprechende URLs"),
    todo("Lokale SEO"),
    todo("Google-Unternehmensprofil verknüpft"),

    h3("Qualität"),
    todo("Ladezeit geprüft, Bilder komprimiert"),
    todo("Barrierefreiheit: Kontraste, Tastaturbedienung"),
    todo("Alle Links funktionieren"),
    todo("Formular getestet — Mail kommt tatsächlich an"),
    todo("In mehreren Browsern geprüft"),

    h3("Abnahme"),
    todo("Interne Prüfung"),
    todo("Kunde erhält Vorschau"),
    todo("Feedback eingeholt"),
    todo("Änderungen umgesetzt"),
    todo("Finale Freigabe schriftlich"),

    h3("Launch"),
    todo("Domain verbunden"),
    todo("Hosting eingerichtet"),
    todo("SSL aktiv"),
    todo("Backup eingerichtet"),
    todo("Live geschaltet"),
    todo("Finale Prüfung nach dem Livegang"),
    todo("Zugänge in der Zugänge-Datenbank dokumentiert"),
    todo("Novera Care besprochen"),

    section("Notizen"),
    p("Projektbezogene Informationen, Absprachen, offene Punkte."),
  ];
}

/* ═══════════════════════════════════════════════════════ BLUEPRINT */

/** Seitenkörper eines Blueprints — der eigentliche Bauplan. */
export function blueprintBlocks() {
  return [
    callout(
      rtParts([
        ["Website Blueprint", { bold: true }],
        ["  ·  Version und Freigabestatus stehen oben. Ist der Kunde freigegeben, wird danach gebaut.", { color: "gray" }],
      ]),
      "🧠",
      "gray_background"
    ),

    section("Branding"),
    bullet(rtParts([["Logo", { bold: true }], [" — Datei, Varianten, Mindestabstände"]])),
    bullet(rtParts([["Farben", { bold: true }], [" — Primär, Sekundär, Hintergrund, Text (mit Hex-Werten)"]])),
    bullet(rtParts([["Typografie", { bold: true }], [" — Überschrift, Fließtext, Größen"]])),
    bullet(rtParts([["Bildsprache", { bold: true }], [" — Stimmung, Motive, was vermieden wird"]])),

    section("Seitenstruktur"),
    p("Welche Seiten entstehen, und was steht auf jeder."),
    bullet("Startseite"),
    bullet("Leistungen"),
    bullet("Über uns"),
    bullet("Kontakt"),
    bullet("Impressum, Datenschutz"),

    section("Startseite im Detail"),
    numbered("Hero — Aussage, Bild, Handlungsaufforderung"),
    numbered("Alleinstellungsmerkmale — drei bis vier Punkte"),
    numbered("Leistungen"),
    numbered("Über uns"),
    numbered("Referenzen"),
    numbered("Bewertungen"),
    numbered("Abschließende Handlungsaufforderung"),

    section("Navigation"),
    columns([
      [h3("Desktop"), p("Aufbau, Reihenfolge, Verhalten beim Scrollen.")],
      [h3("Mobile"), p("Menüart, Reihenfolge, was sichtbar bleibt.")],
    ]),

    section("Komponenten"),
    bullet("Buttons — Zustände: normal, Hover, aktiv"),
    bullet("Cards"),
    bullet("Formulare — Felder, Pflichtangaben, Bestätigung"),
    bullet("Galerie"),
    bullet("Testimonials"),
    bullet("Handlungsaufforderung"),

    section("Animationen"),
    p("Je Animation: was, wodurch ausgelöst, wie schnell, und wie es sich mobil verhält."),
    bullet("Beispiel: Abschnitte blenden beim Scrollen ein · Auslöser 20 % sichtbar · 400 ms · mobil aus"),

    section("Responsive"),
    bullet("Desktop ab 1200 px"),
    bullet("Tablet 768–1199 px"),
    bullet("Mobile bis 767 px"),

    section("SEO"),
    bullet("Keywords"),
    bullet("Zielregion"),
    bullet("Meta Titles je Seite"),
    bullet("Meta Descriptions je Seite"),
    bullet("Überschriftenstruktur"),

    section("Mockups"),
    p("Die Links stehen oben in den Eigenschaften. Die Dateien selbst liegen in Google Drive."),

    section("Freigabe"),
    callout(
      rtParts([
        ["Erst freigeben, dann bauen.", { bold: true }],
        ["  Version hochzählen statt überschreiben — so bleibt nachvollziehbar, was der Kunde " +
         "wann freigegeben hat.", { color: "gray" }],
      ]),
      "✅",
      "gray_background"
    ),
    toggle("Wie die Versionierung gedacht ist", [
      bullet("v1 · Konzept — erster Entwurf, geht zum Kunden"),
      bullet("v2 · Kundenänderungen — Rückmeldung eingearbeitet"),
      bullet("v3 · final — Kundenfreigabe gesetzt, Freigabedatum eingetragen"),
      p(""),
      p("Ältere Stände bekommen den Status „Überholt“ und verschwinden damit aus der " +
        "Ansicht „Aktuelle Version“ — bleiben aber als Nachweis erhalten."),
    ]),
  ];
}

/* ═══════════════════════════════════════════════════════ ANGEBOTSSEITE */

export function angebotBlocks() {
  return [
    callout(
      rtParts([
        ["Angebot", { bold: true }],
        ["  ·  Die Posten stehen oben in den Eigenschaften, der Gesamtpreis rechnet sich daraus.", { color: "gray" }],
      ]),
      "📄",
      "gray_background"
    ),
    section("Leistungsumfang"),
    p("Was genau enthalten ist — in der Sprache des Kunden, nicht in Fachbegriffen."),
    bullet("Website mit den vereinbarten Seiten"),
    bullet("Mobile Optimierung"),
    bullet("Grundlegende Suchmaschinenoptimierung"),
    bullet("Kontaktformular"),
    bullet("Einrichtung von Domain und Hosting"),

    section("Nicht enthalten"),
    p("Ebenso wichtig: was ausdrücklich nicht Teil des Angebots ist."),

    section("Ablauf"),
    numbered("Blueprint erstellen und abstimmen"),
    numbered("Freigabe durch den Kunden"),
    numbered("Umsetzung"),
    numbered("Vorschau und Feedback"),
    numbered("Finale Freigabe"),
    numbered("Livegang"),

    section("Nächster Schritt"),
    p("Was passiert, wenn der Kunde zusagt — und bis wann das Angebot gilt."),
    divider(),
    callout(
      "Das PDF entsteht in Google Docs, die Rechnung später in Papierkram. " +
        "Notion hält nur Status und Link.",
      "💡",
      "gray_background"
    ),
  ];
}

/* ═══════════════════════════════════════════════════════ LEAD-SEITE */

export function leadBlocks() {
  return [
    callout(
      rtParts([
        ["Lead", { bold: true }],
        ["  ·  Kontaktdaten und Bewertung stehen oben. Hier steht, was besprochen wurde.", { color: "gray" }],
      ]),
      "🎯",
      "gray_background"
    ),
    section("Warum dieser Lead"),
    p("Was an der aktuellen Website oder dem Auftritt auffällt — der Aufhänger für das Gespräch."),
    bullet("Beispiel: keine mobile Ansicht, Ladezeit über fünf Sekunden, kein Impressum"),

    section("Gesprächsverlauf"),
    p("Datum und Ergebnis je Kontakt. Kurz halten."),
    bullet("23.08. — Erstkontakt per Mail, keine Antwort"),
    bullet("27.08. — Nachfass per Telefon, Interesse, Angebot gewünscht"),

    section("Nächster Schritt"),
    p("Genau eine Sache. Das Datum dafür steht oben in „Nächstes Follow-up“."),
  ];
}

/* ══════════════════════════════════════════════════════ BEREICHSSEITEN */

export function toolsBlocks() {
  return [
    h1("Novera Tools"),
    p("Alles, was außerhalb von Notion läuft — in drei Gruppen nach Zuständigkeit."),
    divider(),

    section("Google Workspace"),
    p("E-Mail, Dateien, Kalender und Dokumente. Notion verwaltet davon nichts, es verlinkt nur."),
    ...GOOGLE_WORKSPACE.flatMap(([label, url, icon, note]) => [
      bookmark(url, `${icon} ${label}`),
      parts([[note, { color: "gray" }]]),
    ]),

    section("Novera AI"),
    p("Ein Claude-Projekt je Arbeitsbereich. Das hält den Kontext sauber, statt " +
      "alles in einer langen Unterhaltung zu vermischen."),
    ...NOVERA_AI.map(([name, zweck]) =>
      callout(
        rtParts([
          [name, { bold: true }],
          [NL + zweck, { color: "gray" }],
          [NL + "Link eintragen, sobald das Projekt in Claude angelegt ist.", { color: "gray", italic: true }],
        ]),
        "\u{1F916}",
        "gray_background"
      )
    ),
    bookmark("https://claude.ai", "\u{1F916} Claude öffnen"),

    section("Business"),
    p("Die drei Systeme, die Notion bewusst nicht ersetzt."),
    ...BUSINESS_TOOLS.flatMap(([label, url, icon, note]) => [
      bookmark(url, `${icon} ${label}`),
      parts([[note, { color: "gray" }]]),
    ]),

    divider(),
    callout(
      "Damit die Links immer im richtigen Konto landen: in Chrome ein eigenes Profil " +
        "für Novera Studio anlegen und Notion darin öffnen.",
      "\u{1F4A1}",
      "gray_background"
    ),
  ];
}

export function kalenderBlocks(urls) {
  return compact([
    h1("Kalender"),
    p("Google Calendar ist die Terminquelle. Notion führt bewusst keinen zweiten " +
      "Kalender — sonst müsste jeder Termin zweimal gepflegt werden. Was Notion " +
      "beisteuert, sind die Fristen, die nur hier stehen."),
    divider(),

    section("Termine"),
    urls.googleCalendarEmbed
      ? embed(urls.googleCalendarEmbed, "Google Calendar")
      : manualSlot(
          "Google-Calendar-Einbettung fehlt noch",
          "Google Calendar → Einstellungen → den Kalender wählen → „Kalender integrieren“ → " +
            "die Adresse aus dem src des iframes kopieren. In .env bei NOVERA_GCAL_EMBED_URL " +
            "eintragen und neu bauen, oder hier mit /embed einfügen."
        ),
    bookmark("https://calendar.google.com", "📅 Google Calendar öffnen"),

    section("Aufgaben mit Termin"),
    manualSlot(
      "Verknüpfte Ansicht: Aufgaben → Kalender",
      "/verknüpfte → Aufgaben → Ansicht „Kalender“."
    ),

    section("Projekt-Deadlines"),
    manualSlot(
      "Verknüpfte Ansicht: Projekte → Deadlines",
      "/verknüpfte → Projekte → Ansicht „Deadlines“."
    ),

    section("Domainverlängerungen"),
    manualSlot(
      "Verknüpfte Ansicht: Hosting & Domains → Domainverlängerungen",
      "/verknüpfte → Hosting & Domains → Ansicht „Domainverlängerungen“."
    ),

    divider(),
    callout(
      "Für die Einbettung eignet sich die Agenda-Ansicht besser als das Monatsraster: " +
        "an die Adresse &mode=AGENDA&showTitle=0&showPrint=0&showTabs=0 anhängen.",
      "💡",
      "gray_background"
    ),
    callout(
      "Ein Geschäftskalender muss nicht öffentlich gestellt werden, damit du ihn siehst — " +
        "solange du im selben Browser bei Google angemeldet bist, reicht das.",
      "🔐",
      "gray_background"
    ),
  ]);
}

export function dokumenteBlocks(urls) {
  return compact([
    h1("Dokumente"),
    callout(
      rtParts([
        ["Google Drive ist die Ablage.", { bold: true }],
        ["  Notion verwaltet keine Dateien — es hält nur die Ordnerlinks. So gibt es nie " +
         "zwei Versionen derselben Datei.", { color: "gray" }],
      ]),
      "📁",
      "gray_background"
    ),
    urls.driveRoot
      ? bookmark(urls.driveRoot, "📁 Novera Studio Drive")
      : bookmark("https://drive.google.com", "📁 Google Drive"),
    divider(),

    section("Ordnerstruktur"),
    p("Jeder Kunde bekommt denselben Aufbau. Der Link zum Kundenordner gehört in die " +
      "Eigenschaft „Google Drive“ beim Kunden, der Projektordner in dieselbe Eigenschaft beim Projekt."),
    code(
`Novera Studio/
├── 01 Kunden/
│   └── <Firmenname>/
│       ├── Angebote/
│       ├── Verträge/
│       ├── Briefings/
│       ├── Branding/        Logo, Farben, Schriften
│       ├── Content/         Texte, Bilder
│       └── Website/         Mockups, Exporte
├── 02 Novera intern/        eigenes Branding, Vorlagen
└── 03 Vorlagen/`,
      "plain text"
    ),

    section("Was wo liegt"),
    bullet(rtParts([["Angebote", { bold: true }], [" — als Google Doc, PDF-Link im Angebot hinterlegt"]])),
    bullet(rtParts([["Verträge", { bold: true }], [" — unterschrieben als PDF im Kundenordner"]])),
    bullet(rtParts([["Mockups", { bold: true }], [" — im Website-Ordner, Link im Blueprint"]])),
    bullet(rtParts([["Rechnungen", { bold: true }], [" — ausschließlich in Papierkram"]])),
  ]);
}

export function systemBlocks({ db }) {
  return compact([
    h1("System"),
    p("Wie Novera Studio arbeitet — der Ablauf und die Regeln dahinter."),
    divider(),

    section("Der Weg vom Lead zum Kunden"),
    code(
`Lead gefunden        →  Leads, Status „Neuer Lead“
Qualifiziert         →  Lead Score und Sales Angle setzen
Erstkontakt          →  Status „Erstkontakt“, Follow-up-Datum setzen
Antwort erhalten     →  Status „Antwort erhalten“
Angebot              →  Angebot anlegen, mit dem Lead verknüpfen
Gespräch             →  Status „Verhandlung“
Gewonnen             →  Kunde anlegen, Lead verknüpfen, Status „Gewonnen“
                        ↓
Projekt              →  Projekt anlegen, Kunde verknüpfen
Blueprint            →  Website anlegen, Blueprint erstellen
Freigabe             →  Kundenfreigabe setzen, Version festhalten
Entwicklung          →  Checkliste im Projekt abarbeiten
Feedback             →  Status „Kundenfeedback“
Abnahme              →  Status „Freigegeben“
Live                 →  Website auf „Live“, Launchdatum setzen
Hosting              →  Eintrag in Hosting & Domains
Novera Care          →  Haken beim Kunden, Monatsbetrag eintragen`,
      "plain text"
    ),

    section("Regeln"),
    numbered("Eine Aufgabe wird einmal angelegt und über Relations verknüpft — nie doppelt."),
    numbered("Dateien liegen in Google Drive, Notion hält den Link."),
    numbered("Rechnungen entstehen in Papierkram, nicht in Notion."),
    numbered("Passwörter stehen in 1Password. In Notion steht nur, dass ein Zugang existiert."),
    numbered("Ein Blueprint wird freigegeben, bevor gebaut wird. Änderungen danach = neue Version."),

    section("Wochenrhythmus"),
    h3("Täglich · 5 Minuten"),
    bullet("Dashboard öffnen, „Überfällig“ und „Heute“ durchgehen"),
    bullet("Fällige Follow-ups aus „Heute kontaktieren“ abarbeiten"),
    h3("Wöchentlich · 20 Minuten"),
    bullet("Leads durchgehen: Status und Follow-up-Daten aktualisieren"),
    bullet("Angebote → „Offen“ prüfen, nachfassen wo nötig"),
    bullet("Projekte → Fortschritt und Deadlines prüfen"),
    h3("Monatlich · 20 Minuten"),
    bullet("Hosting & Domains → „Domainverlängerungen“ prüfen"),
    bullet("Zugänge → „Ohne 2FA“ nachziehen"),
    bullet("Novera-Care-Kunden gegen Papierkram abgleichen"),

    divider(),
    section("Datenbanken"),
    ...compact([
      db.leads ? linkToDatabase(db.leads.databaseId) : null,
      db.kunden ? linkToDatabase(db.kunden.databaseId) : null,
      db.projekte ? linkToDatabase(db.projekte.databaseId) : null,
      db.websites ? linkToDatabase(db.websites.databaseId) : null,
      db.blueprints ? linkToDatabase(db.blueprints.databaseId) : null,
      db.angebote ? linkToDatabase(db.angebote.databaseId) : null,
      db.aufgaben ? linkToDatabase(db.aufgaben.databaseId) : null,
      db.hosting ? linkToDatabase(db.hosting.databaseId) : null,
      db.zugaenge ? linkToDatabase(db.zugaenge.databaseId) : null,
    ]),
  ]);
}
