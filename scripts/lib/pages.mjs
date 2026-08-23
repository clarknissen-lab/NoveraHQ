/**
 * Seitenaufbau: HQ-Dashboard, Bereichsseiten, Kundenakte, Projektseite.
 *
 * Wichtig für das Verständnis der `manualSlot`-Blöcke:
 * Die Notion-API kann KEINE verknüpften Datenbankansichten ("Linked View") in eine
 * Seite einfügen — es gibt schlicht keinen Blocktyp dafür. Überall dort, wo eine
 * gefilterte Live-Liste hingehört, steht deshalb ein orange markierter Platzhalter
 * mit der exakten Klickanweisung. Siehe docs/MANUELL-EINZURICHTEN.md.
 */

import {
  h1, h2, h3, p, parts, divider, callout, toggle, bullet, numbered, todo,
  bookmark, embed, linkToPage, linkToDatabase, columns, linkItem, manualSlot, quote, code,
} from "./blocks.mjs";
import { rtParts } from "./notion.mjs";

/* ─────────────────────────────────────────────────── Google Workspace */

export const GOOGLE_LINKS = [
  ["Gmail", "https://mail.google.com", "📧"],
  ["Google Calendar", "https://calendar.google.com", "📅"],
  ["Google Drive", "https://drive.google.com", "📁"],
  ["Google Docs", "https://docs.google.com", "📝"],
  ["Google Sheets", "https://sheets.google.com", "📊"],
  ["Google Slides", "https://slides.google.com", "📽️"],
  ["Google Meet", "https://meet.google.com", "🎥"],
  ["Google Chat", "https://chat.google.com", "💬"],
  ["Workspace Admin", "https://admin.google.com", "⚙️"],
];

export const BUSINESS_TOOLS = [
  ["Papierkram", "https://www.papierkram.de", "🧾", "Buchhaltung, Rechnungen, Belege"],
  ["1Password", "https://my.1password.com", "🔐", "Passwörter, Passkeys, Recovery Codes"],
  ["Claude", "https://claude.ai", "🤖", "Systemaufbau, Dokumente, Struktur"],
  ["ChatGPT", "https://chat.openai.com", "🧠", "Strategie, Recherche, Analyse"],
];

/* ══════════════════════════════════════════════════════ HQ DASHBOARD */

export function hqBlocks({ db, pages, urls }) {
  const dbLink = (key) => (db[key] ? linkToDatabase(db[key].databaseId) : null);
  const pgLink = (key) => (pages[key] ? linkToPage(pages[key]) : null);

  const quickAction = (label, key) =>
    db[key]
      ? callout(rtParts([[label, { bold: true }]]), "＋", "gray_background", [
          linkToDatabase(db[key].databaseId),
        ])
      : callout(rtParts([[label, { bold: true }]]), "＋", "gray_background");

  const kpi = (label, hint) =>
    callout(
      rtParts([
        [label.toUpperCase() + "\n", { bold: true }],
        [hint, { color: "gray" }],
      ]),
      "▪",
      "gray_background"
    );

  return compact([
    /* ── HEADER ─────────────────────────────────────────────────────── */
    h1("NOVERA STUDIO"),
    parts([["Business Command Center", { color: "gray" }]]),

    urls.clock
      ? embed(urls.clock, "Wochentag · Datum · Uhrzeit — läuft live")
      : manualSlot(
          "Live-Uhr fehlt noch",
          "Widget-URL in NOVERA_CLOCK_URL setzen und den Builder erneut laufen lassen, " +
            "oder hier /embed einfügen. Details in docs/MANUELL-EINZURICHTEN.md, Schritt 1."
        ),

    divider(),

    /* ── QUICK ACTIONS ──────────────────────────────────────────────── */
    h2("Quick Actions"),
    parts([
      ["Klick öffnet die Datenbank — dort mit ", { color: "gray" }],
      ["New", { code: true }],
      [" den Eintrag anlegen.", { color: "gray" }],
    ]),
    columns([
      [quickAction("New Task", "tasks")],
      [quickAction("New Project", "projects")],
      [quickAction("New Client", "clients")],
      [quickAction("New Invoice", "invoices")],
    ]),
    columns([
      [quickAction("New Expense", "expenses")],
      [quickAction("New Idea", "ideas")],
      [quickAction("New Note", "notes")],
      [quickAction("New Access Entry", "access")],
    ]),

    divider(),

    /* ── TODAY ──────────────────────────────────────────────────────── */
    h2("Today"),
    columns([
      [
        h3("🔴 High Priority"),
        manualSlot(
          "Linked View: Tasks → High Priority",
          "/Linked view of database → Tasks → Ansicht „High Priority“ wählen."
        ),
      ],
      [
        h3("⏰ Today's Schedule"),
        manualSlot(
          "Linked View: Tasks → Today",
          "/Linked view of database → Tasks → Ansicht „Today“ wählen. " +
            "Sortiert nach Due Date, die Spalte „Time“ zeigt die Uhrzeit."
        ),
      ],
    ]),

    h3("🚨 Overdue"),
    manualSlot(
      "Linked View: Tasks → Overdue",
      "/Linked view of database → Tasks → Ansicht „Overdue“ wählen. Sollte im Alltag leer sein."
    ),

    h3("🎯 Next"),
    manualSlot(
      "Linked View: Tasks → Upcoming",
      "/Linked view of database → Tasks → Ansicht „Upcoming“ wählen, Limit auf 5–10 Einträge setzen."
    ),

    divider(),

    /* ── ACTIVE PROJECTS ────────────────────────────────────────────── */
    h2("Active Projects"),
    manualSlot(
      "Linked View: Projects → Active",
      "/Linked view of database → Projects → Ansicht „Active“ wählen. " +
        "Spalten einblenden: Client, Deadline, Progress Bar, Open Tasks."
    ),
    dbLink("projects"),

    divider(),

    /* ── CLIENTS ────────────────────────────────────────────────────── */
    h2("Clients"),
    columns([
      [
        h3("Active Clients"),
        manualSlot(
          "Linked View: Clients → Active Clients",
          "/Linked view of database → Clients → Ansicht „Active Clients“ wählen."
        ),
      ],
      [
        h3("Client Access"),
        manualSlot(
          "Linked View: Clients → Active Clients",
          "Zweite verknüpfte Ansicht derselben Datenbank. Nur die Spalten " +
            "„Client Name“ und „Access Entries“ sichtbar lassen — ein Klick auf den " +
            "Kunden öffnet die Kundenakte mit allen Zugängen."
        ),
      ],
    ]),
    columns([[dbLink("clients") ?? p("")], [dbLink("access") ?? p("")]]),

    divider(),

    /* ── BUSINESS KPIs ──────────────────────────────────────────────── */
    h2("Business"),
    parts([
      [
        "Die Zahlen entstehen aus den Datenbanken. Jede Kachel bekommt eine " +
          "verknüpfte Ansicht, deren Summenzeile den Wert liefert — Schritt 3 in ",
        { color: "gray" },
      ],
      ["docs/MANUELL-EINZURICHTEN.md", { code: true, color: "gray" }],
      [".", { color: "gray" }],
    ]),
    columns([
      [kpi("Revenue", "Invoices → Summe „Amount Paid“")],
      [kpi("Expenses", "Expenses → Summe „Amount“")],
      [kpi("Profit", "Revenue − Expenses")],
      [kpi("Open Invoices", "Invoices → Summe „Amount Open“")],
    ]),
    columns([
      [kpi("Active Clients", "Clients → Ansicht „Active Clients“, Count")],
      [kpi("Active Projects", "Projects → Ansicht „Active“, Count")],
      [kpi("Leads", "Clients → Ansicht „Leads“, Count")],
      [kpi("Open Tasks", "Tasks → Ansicht „Upcoming“, Count")],
    ]),
    pgLink("finance"),

    divider(),

    /* ── CALENDAR ───────────────────────────────────────────────────── */
    h2("Calendar"),
    urls.googleCalendarEmbed
      ? embed(urls.googleCalendarEmbed, "Google Calendar — zentrale Terminquelle")
      : manualSlot(
          "Google-Calendar-Embed fehlt noch",
          "Einbettungs-URL aus den Kalendereinstellungen holen und in NOVERA_GCAL_EMBED_URL " +
            "setzen, oder hier per /embed einfügen. Schritt 4 in docs/MANUELL-EINZURICHTEN.md."
        ),
    pgLink("calendar"),

    divider(),

    /* ── SPOTIFY ────────────────────────────────────────────────────── */
    h2("Now Playing"),
    urls.spotifyEmbed
      ? embed(urls.spotifyEmbed, "Arbeitsplaylist")
      : manualSlot(
          "Spotify-Playlist fehlt noch",
          "Playlist-Link kopieren, NOVERA_SPOTIFY_URL setzen und neu bauen — oder den Link " +
            "hier einfügen und „Embed“ wählen."
        ),

    divider(),

    /* ── NOTES & IDEAS ──────────────────────────────────────────────── */
    h2("Notes & Ideas"),
    columns([
      [
        h3("Recent Notes"),
        manualSlot(
          "Linked View: Notes → Recent",
          "/Linked view of database → Notes → Ansicht „Recent“, Limit 5."
        ),
        dbLink("notes") ?? p(""),
      ],
      [
        h3("Idea Inbox"),
        manualSlot(
          "Linked View: Ideas → Inbox",
          "/Linked view of database → Ideas → Ansicht „Inbox“, Limit 5."
        ),
        dbLink("ideas") ?? p(""),
      ],
    ]),

    divider(),

    /* ── NAVIGATION ─────────────────────────────────────────────────── */
    h2("Navigation"),
    columns([
      [
        h3("Workspace"),
        dbLink("tasks"), dbLink("projects"), dbLink("clients"),
        pgLink("clientRecords"), pgLink("calendar"), pgLink("finance"),
        dbLink("ideas"), dbLink("knowledge"), dbLink("notes"), pgLink("files"),
      ].filter(Boolean),
      [
        h3("Google Workspace"),
        ...GOOGLE_LINKS.map(([label, url, icon]) => linkItem(`${icon} ${label}`, url)),
      ],
      [
        h3("Business Tools"),
        ...BUSINESS_TOOLS.map(([label, url, icon, note]) => linkItem(`${icon} ${label}`, url, note)),
      ],
    ]),

    divider(),
    systemRulesToggle(),
  ]);
}

/** §28 — wer ist wofür zuständig. Als Toggle, damit das Dashboard ruhig bleibt. */
function systemRulesToggle() {
  return toggle("Systemregeln — welches Tool wofür", [
    p("Jede Information hat genau einen Ort. Das verhindert doppelte Pflege."),
    bullet(rtParts([["Notion", { bold: true }], [" — HQ, CRM, Projekte, Tasks, Anforderungen, Wissen, Notizen"]])),
    bullet(rtParts([["Google Workspace", { bold: true }], [" — Mail, Kalender, Dateien, Dokumente, Meetings"]])),
    bullet(rtParts([["Papierkram", { bold: true }], [" — Buchhaltung, Rechnungsstellung, Belege, Steuer"]])),
    bullet(rtParts([["1Password", { bold: true }], [" — Passwörter, Passkeys, Recovery Codes"]])),
    bullet(rtParts([["Claude", { bold: true }], [" — Systemaufbau, Dokumente, Struktur"]])),
    bullet(rtParts([["ChatGPT", { bold: true }], [" — Strategie, Recherche, Analyse, Entscheidungen"]])),
    p(""),
    quote("Notion dokumentiert, dass ein Zugang existiert. 1Password speichert ihn."),
  ]);
}

/* ═══════════════════════════════════════════════ KUNDENAKTE (Body) */

/**
 * Der Seitenkörper eines Kunden. Wird für den Musterkunden gesetzt und dient
 * als Vorlage für das Datenbank-Template (siehe MANUELL-EINZURICHTEN, Schritt 2).
 */
export function clientFileBlocks() {
  return [
    callout(
      rtParts([
        ["Kundenakte", { bold: true }],
        ["  ·  Alles zu diesem Kunden an einem Ort. Stammdaten stehen oben in den Properties.", { color: "gray" }],
      ]),
      "▪",
      "gray_background"
    ),

    h2("🚀 Projects"),
    manualSlot(
      "Linked View: Projects, gefiltert auf diesen Kunden",
      "/Linked view of database → Projects → Filter: Client → enthält → diesen Kunden. " +
        "Im Datenbank-Template genügt der Filter „Client enthält“ + Vorlagenvariable."
    ),

    h2("📋 Tasks"),
    manualSlot(
      "Linked View: Tasks, gefiltert auf diesen Kunden",
      "/Linked view of database → Tasks → Filter: Client → enthält → diesen Kunden, " +
        "Status ist nicht Done."
    ),

    h2("🌐 Website Requirements"),
    p("Was der Kunde für seine Website möchte — strukturiert in der Datenbank, Details hier."),
    manualSlot(
      "Linked View: Website Requirements, gefiltert auf diesen Kunden",
      "/Linked view of database → Website Requirements → Filter: Client → enthält → diesen Kunden."
    ),
    toggle("Fragenkatalog für das Erstgespräch", [
      bullet("Welche Seiten soll die Website haben?"),
      bullet("Welcher Stil? Hell oder dunkel, ruhig oder auffällig?"),
      bullet("Gibt es Farben, ein Logo, ein bestehendes Branding?"),
      bullet("Wer liefert Texte? Wer liefert Bilder?"),
      bullet("Welche Funktionen: Formular, WhatsApp, Maps, Newsletter, Terminbuchung?"),
      bullet("Welche Kontaktmöglichkeiten sollen sichtbar sein?"),
      bullet("Social Media verlinken? Welche Kanäle?"),
      bullet("SEO-Wünsche? Welche Suchbegriffe sind wichtig?"),
      bullet("Besondere Anforderungen mobil?"),
      bullet("Referenz-Websites, die gefallen?"),
      bullet("Was ist ausdrücklich NICHT gewünscht?"),
      bullet("Bis wann soll die Seite live sein?"),
    ]),

    h2("💬 Communication"),
    p("Jedes relevante Gespräch als Eintrag — damit später nachvollziehbar bleibt, was besprochen wurde."),
    manualSlot(
      "Linked View: Client Communication, gefiltert auf diesen Kunden",
      "/Linked view of database → Client Communication → Filter: Client → enthält → diesen Kunden, " +
        "sortiert nach Date absteigend."
    ),

    h2("🔐 Access"),
    callout(
      rtParts([
        ["Keine Klartext-Passwörter in Notion.", { bold: true }],
        ["  Hier steht nur, WELCHE Zugänge existieren. Die Passwörter liegen in 1Password.", { color: "gray" }],
      ]),
      "🔐",
      "red_background"
    ),
    manualSlot(
      "Linked View: Client Access, gefiltert auf diesen Kunden",
      "/Linked view of database → Client Access → Filter: Client → enthält → diesen Kunden."
    ),

    h2("💰 Finance"),
    manualSlot(
      "Linked View: Invoices, gefiltert auf diesen Kunden",
      "/Linked view of database → Invoices → Filter: Client → enthält → diesen Kunden. " +
        "In der Summenzeile „Amount“ auf Sum stellen."
    ),

    h2("📁 Files"),
    p("Dateien liegen in Google Drive, nicht in Notion. Der Drive-Link steht oben in den Properties."),

    h2("📝 Notes"),
    manualSlot(
      "Linked View: Notes, gefiltert auf diesen Kunden",
      "/Linked view of database → Notes → Filter: Client → enthält → diesen Kunden."
    ),
  ];
}

/* ═══════════════════════════════════════════════ PROJEKTSEITE (Body) */

export function projectPageBlocks() {
  return [
    callout(
      rtParts([
        ["Projektseite", { bold: true }],
        ["  ·  Ziel, Kunde, Deadline, Status und Fortschritt stehen oben in den Properties.", { color: "gray" }],
      ]),
      "▪",
      "gray_background"
    ),

    h2("Overview"),
    p("Was soll am Ende herauskommen? Zwei bis drei Sätze — knapp genug, dass man sie im Vorbeigehen liest."),

    h2("Tasks"),
    manualSlot(
      "Linked View: Tasks, gefiltert auf dieses Projekt",
      "/Linked view of database → Tasks → Filter: Project → enthält → dieses Projekt."
    ),

    h2("Client Requirements"),
    manualSlot(
      "Linked View: Website Requirements, gefiltert auf dieses Projekt",
      "/Linked view of database → Website Requirements → Filter: Project → enthält → dieses Projekt."
    ),

    h2("Files"),
    p("Google-Drive-Ordner dieses Projekts — Link steht oben in der Property „Google Drive“."),

    h2("Notes"),
    manualSlot(
      "Linked View: Notes, gefiltert auf dieses Projekt",
      "/Linked view of database → Notes → Filter: Project → enthält → dieses Projekt."
    ),

    h2("Finance"),
    manualSlot(
      "Linked View: Invoices, gefiltert auf dieses Projekt",
      "/Linked view of database → Invoices → Filter: Project → enthält → dieses Projekt."
    ),
  ];
}

/* ══════════════════════════════════════════════════ BEREICHSSEITEN */

export function googleWorkspaceBlocks() {
  return [
    h1("Google Workspace"),
    p("Kommunikation und Dateien laufen über Google. Notion verlinkt nur — es speichert nichts doppelt."),
    divider(),
    ...GOOGLE_LINKS.map(([label, url, icon]) => bookmark(url, `${icon} ${label}`)),
    divider(),
    callout(
      "Links öffnen im Browser-Tab. Damit sie immer im richtigen Konto landen, in Chrome ein " +
        "eigenes Profil für Novera Studio anlegen und Notion darin öffnen.",
      "💡",
      "gray_background"
    ),
  ];
}

export function businessToolsBlocks() {
  return [
    h1("Business Tools"),
    p("Die Werkzeuge außerhalb von Notion — jedes mit klarer Zuständigkeit."),
    divider(),
    ...BUSINESS_TOOLS.flatMap(([label, url, icon, note]) => [
      bookmark(url, `${icon} ${label}`),
      parts([[note, { color: "gray" }]]),
    ]),
    divider(),
    h2("Zuständigkeiten"),
    bullet(rtParts([["Papierkram", { bold: true }], [" — Buchhaltung. Rechnungen werden dort erstellt und verbucht. Notion zeigt nur den Status."]])),
    bullet(rtParts([["1Password", { bold: true }], [" — der einzige Ort für Passwörter, Passkeys und Recovery Codes."]])),
    bullet(rtParts([["Claude", { bold: true }], [" — Systemaufbau, Struktur, Dokumente."]])),
    bullet(rtParts([["ChatGPT", { bold: true }], [" — Strategie, Recherche, Analyse."]])),
  ];
}

export function calendarPageBlocks(urls) {
  return compact([
    h1("Calendar"),
    p("Google Calendar ist die zentrale Terminquelle. Notion führt bewusst keinen zweiten Kalender — " +
      "sonst müsste jeder Termin zweimal gepflegt werden."),
    divider(),
    urls.googleCalendarEmbed
      ? embed(urls.googleCalendarEmbed, "Google Calendar")
      : manualSlot(
          "Google-Calendar-Embed fehlt noch",
          "Google Calendar → Einstellungen → Kalender → „Kalender integrieren“ → die URL aus dem " +
            "iframe-Code kopieren. Dann hier /embed einfügen. Schritt 4 in docs/MANUELL-EINZURICHTEN.md."
        ),
    bookmark("https://calendar.google.com", "📅 Google Calendar öffnen"),
    divider(),
    h2("Deadlines aus Notion"),
    p("Termine stehen in Google. Deadlines stehen in Notion — hier zusammengeführt."),
    manualSlot(
      "Linked View: Projects → Deadlines",
      "/Linked view of database → Projects → Ansicht „Deadlines“ wählen."
    ),
    manualSlot(
      "Linked View: Tasks → Calendar",
      "/Linked view of database → Tasks → Ansicht „Calendar“ wählen."
    ),
  ]);
}

export function filesPageBlocks(urls) {
  return compact([
    h1("Files"),
    p("Google Drive ist der Dateispeicher. Notion verlinkt nur — so gibt es keine zweite Version einer Datei."),
    divider(),
    urls.driveRoot
      ? bookmark(urls.driveRoot, "📁 Novera Studio Drive")
      : bookmark("https://drive.google.com", "📁 Google Drive"),
    divider(),
    h2("Ordnerstruktur"),
    p("Bewährte Struktur — jeder Kunde bekommt denselben Aufbau:"),
    code(
`Novera Studio/
├── 01 Clients/
│   └── <Kundenname>/
│       ├── Branding/          Logo, Farben, Schriften
│       ├── Content/           Texte, Bilder, Videos
│       ├── Website/           Entwürfe, Exporte
│       ├── Contracts/         Verträge, Angebote
│       └── Invoices/          Rechnungs-PDFs
├── 02 Projects/
├── 03 Novera Internal/        Branding, Vorlagen, Präsentationen
├── 04 Finance/                Belege, Auswertungen
└── 05 Templates/`,
      "plain text"
    ),
    callout(
      "Der Drive-Link jedes Kunden gehört in die Property „Google Drive“ der Clients-Datenbank, " +
        "der Projektordner in die gleichnamige Property bei Projects.",
      "💡",
      "gray_background"
    ),
  ]);
}

export function financePageBlocks({ db }) {
  return compact([
    h1("Finance"),
    callout(
      rtParts([
        ["Papierkram bleibt die Buchhaltung.", { bold: true }],
        ["  Rechnungen werden dort erstellt und verbucht. Notion zeigt nur die Geschäftssicht: " +
          "was ist offen, was ist bezahlt, wie steht der Monat.", { color: "gray" }],
      ]),
      "🧾",
      "gray_background"
    ),
    bookmark("https://www.papierkram.de", "🧾 Papierkram öffnen"),
    divider(),

    h2("Open Invoices"),
    manualSlot(
      "Linked View: Invoices → Open",
      "/Linked view of database → Invoices → Ansicht „Open“. In der Summenzeile unter „Amount Open“ auf Sum stellen."
    ),

    h2("Overdue Invoices"),
    manualSlot(
      "Linked View: Invoices → Overdue",
      "/Linked view of database → Invoices → Ansicht „Overdue“."
    ),

    h2("Paid"),
    manualSlot(
      "Linked View: Invoices → Paid",
      "/Linked view of database → Invoices → Ansicht „Paid“. Summenzeile „Amount Paid“ → Sum."
    ),

    h2("Expenses"),
    manualSlot(
      "Linked View: Expenses → This Month",
      "/Linked view of database → Expenses → Ansicht „This Month“. Summenzeile „Amount“ → Sum."
    ),

    h2("Monthly Overview"),
    p("Umsatz minus Ausgaben je Monat. Notion rechnet das nicht von allein über Monate hinweg — " +
      "die belastbare Auswertung steht in Papierkram."),
    toggle("Wie der Monatsblick funktioniert", [
      numbered("In „Invoices → Paid“ nach Date gruppieren, Gruppierung auf Monat stellen."),
      numbered("Summenzeile je Gruppe auf „Amount Paid → Sum“ setzen."),
      numbered("Dasselbe in „Expenses“ mit „Amount → Sum“."),
      numbered("Für Steuer und Jahresabschluss zählt ausschließlich Papierkram."),
    ]),
    divider(),
    ...compact([
      db.invoices ? linkToDatabase(db.invoices.databaseId) : null,
      db.expenses ? linkToDatabase(db.expenses.databaseId) : null,
    ]),
  ]);
}

export function clientRecordsBlocks({ db }) {
  return compact([
    h1("Client Records"),
    p("Die drei Datenbanken, die zur Kundenakte gehören. Im Alltag öffnest du sie über den Kunden — " +
      "hier liegen sie als Ganzes."),
    divider(),
    h2("🔐 Client Access"),
    p("Welche Zugänge existieren. Ohne Passwörter."),
    db.access ? linkToDatabase(db.access.databaseId) : null,
    h2("🌐 Website Requirements"),
    p("Was der Kunde für seine Website möchte — und was ausdrücklich nicht."),
    db.requirements ? linkToDatabase(db.requirements.databaseId) : null,
    h2("💬 Client Communication"),
    p("Gesprächsprotokoll je Kunde."),
    db.communication ? linkToDatabase(db.communication.databaseId) : null,
  ]);
}

/* ═════════════════════════════════════════════ KNOWLEDGE-STARTSEITEN */

export const KNOWLEDGE_SEED = [
  {
    title: "Client Onboarding",
    category: "Client Process",
    status: "Active",
    tags: ["Onboarding"],
    body: [
      p("Ablauf vom Ja des Kunden bis zum Projektstart."),
      numbered("Kunde in Clients anlegen, Status auf Active, „Client Since“ setzen."),
      numbered("Drive-Ordner nach Standardstruktur anlegen, Link in die Property „Google Drive“."),
      numbered("1Password: Eintrag unter Clients → <Kundenname> anlegen."),
      numbered("Projekt in Projects anlegen und mit dem Kunden verknüpfen."),
      numbered("Website Requirements ausfüllen — Fragenkatalog steht in der Kundenakte."),
      numbered("Kickoff-Termin in Google Calendar, Notiz in Client Communication."),
      numbered("Angebot in Papierkram erstellen, Rechnung in Invoices spiegeln."),
    ],
  },
  {
    title: "Website Launch Checklist",
    category: "Website Process",
    status: "Active",
    tags: ["Development"],
    body: [
      p("Vor dem Livegang durchgehen. Kein Punkt wird überspringen."),
      todo("Alle Seiten aus „Pages Wanted“ vorhanden"),
      todo("Mobile geprüft: iPhone und Android, Hoch- und Querformat"),
      todo("Kontaktformular getestet — Mail kommt tatsächlich an"),
      todo("Impressum und Datenschutz vorhanden und aktuell"),
      todo("Favicon, Seitentitel und Meta-Beschreibungen gesetzt"),
      todo("Google Search Console verbunden, Sitemap eingereicht"),
      todo("Ladezeit geprüft, Bilder komprimiert"),
      todo("SSL aktiv, www und non-www leiten sauber weiter"),
      todo("Zugänge in Client Access dokumentiert, Passwörter in 1Password"),
      todo("Backup eingerichtet"),
      todo("Abnahme durch den Kunden schriftlich in Client Communication festgehalten"),
    ],
  },
  {
    title: "Zugänge sicher übernehmen",
    category: "SOP",
    status: "Active",
    tags: ["Tools", "Legal"],
    body: [
      callout(
        "Passwörter niemals per E-Mail, WhatsApp oder Notion annehmen. " +
          "Wenn ein Kunde das tut: Passwort danach ändern.",
        "🔐",
        "red_background"
      ),
      numbered("Kunden bitten, den Zugang über den 1Password-Freigabelink zu senden."),
      numbered("Eintrag in 1Password unter Clients → <Kundenname> → <Dienst> ablegen."),
      numbered("In Client Access dokumentieren: Service, Username, Login-URL, Account Owner, 2FA."),
      numbered("„Password Manager Reference“ auf den 1Password-Pfad setzen."),
      numbered("2FA aktivieren, Recovery Codes in 1Password sichern."),
      p("Das Feld „Password“ in Client Access ist eine feste Formel und lässt sich nicht " +
        "mit Klartext überschreiben — das ist Absicht."),
    ],
  },
  {
    title: "Wochenrhythmus",
    category: "Process",
    status: "Active",
    tags: [],
    body: [
      p("Damit das System gepflegt bleibt, ohne dass Pflege zum Projekt wird."),
      h3("Täglich · 5 Minuten"),
      bullet("HQ öffnen, „Today“ und „Overdue“ durchgehen"),
      bullet("Neue Aufgaben in den Task-Inbox werfen, nicht sofort sortieren"),
      h3("Wöchentlich · 20 Minuten"),
      bullet("Task-Inbox leeren: Status, Priority, Due Date, Client/Project setzen"),
      bullet("Clients → „Follow Up“ durchgehen und Next Contact neu setzen"),
      bullet("Invoices → „Overdue“ prüfen, gegebenenfalls in Papierkram mahnen"),
      bullet("Projects → Fortschritt und Deadlines prüfen"),
      h3("Monatlich · 30 Minuten"),
      bullet("Finance-Seite durchgehen, Zahlen gegen Papierkram abgleichen"),
      bullet("Expenses → „Recurring“ prüfen: läuft etwas mit, das keiner mehr braucht?"),
      bullet("Client Access → „No 2FA“ prüfen und nachziehen"),
      bullet("Ideen-Inbox sichten"),
    ],
  },
];

/* ────────────────────────────────────────────────────────────── Helfer */

/** Entfernt null/undefined aus Blocklisten — spart überall ein `.filter`. */
function compact(arr) {
  return arr.filter(Boolean);
}
