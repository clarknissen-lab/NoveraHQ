/**
 * NOVERA STUDIO OS — Datenmodell
 *
 * Der Aufbau passiert in drei Durchläufen, weil Notion Abhängigkeiten hat:
 *
 *   Pass 1  base          Datenbanken + einfache Properties (Text, Select, Datum, Zahl ...)
 *   Pass 2  relations     Relations — brauchen die data_source_id des Ziels, das erst nach Pass 1 existiert
 *   Pass 3  formulas      Formeln auf Basis-Properties (z.B. "Done?", "Amount Paid")
 *   Pass 4  rollups       Rollups — lesen die Formeln aus Pass 3 über die Relations aus Pass 2
 *   Pass 5  lateFormulas  Formeln, die ein Rollup lesen (z.B. der Fortschrittsbalken)
 *
 * Relations werden bewusst NUR auf der Kind-Seite deklariert (Task -> Client).
 * Notion legt die Gegenseite (Client -> Tasks) als dual_property automatisch an.
 * Würde man beide Seiten deklarieren, entstünden doppelte Properties.
 *
 * Jede Datenbank hat einen stabilen `key`. Der Key landet im State-File und macht
 * wiederholte Läufe idempotent.
 */

/** Akzentfarbe des Systems. Notion erlaubt nur die eigene Farbpalette. */
export const ACCENT = "orange";

/* ────────────────────────────────────────────────────────────── Helfer */

export const title = () => ({ title: {} });
export const text = () => ({ rich_text: {} });
export const number = (format = "number") => ({ number: { format } });
export const euro = () => number("euro");
export const percent = () => number("percent");
export const date = () => ({ date: {} });
export const checkbox = () => ({ checkbox: {} });
export const url = () => ({ url: {} });
export const email = () => ({ email: {} });
export const phone = () => ({ phone_number: {} });
export const createdTime = () => ({ created_time: {} });
export const lastEdited = () => ({ last_edited_time: {} });
export const files = () => ({ files: {} });
export const select = (options) => ({ select: { options } });
export const multi = (options) => ({ multi_select: { options } });
export const status = (options) => ({ status: { options } });
export const formula = (expression) => ({ formula: { expression } });

/** Dual-Relation: Notion legt die Gegenseite im Ziel automatisch mit an. */
export const relation = (targetKey, syncedPropertyName) => ({
  __relationTarget: targetKey,
  relation: {
    data_source_id: "__RESOLVED_AT_RUNTIME__",
    type: "dual_property",
    dual_property: { synced_property_name: syncedPropertyName },
  },
});

export const rollup = (relationPropertyName, rollupPropertyName, fn) => ({
  rollup: {
    relation_property_name: relationPropertyName,
    rollup_property_name: rollupPropertyName,
    function: fn,
  },
});

const opt = (name, color = "default") => ({ name, color });

/* ─────────────────────────────────────────────── Gemeinsame Optionslisten */

export const PRIORITY_OPTIONS = [
  opt("High", "red"),
  opt("Medium", "orange"),
  opt("Low", "gray"),
];

export const TASK_STATUS_OPTIONS = [
  opt("Inbox", "gray"),
  opt("To Do", "blue"),
  opt("In Progress", "orange"),
  opt("Waiting", "yellow"),
  opt("Done", "green"),
];

export const TASK_CATEGORY_OPTIONS = [
  opt("Client", "blue"),
  opt("Project", "purple"),
  opt("Admin", "gray"),
  opt("Finance", "green"),
  opt("Marketing", "pink"),
  opt("Content", "yellow"),
  opt("Website", "orange"),
  opt("Sales", "red"),
  opt("Other", "default"),
];

export const PROJECT_STATUS_OPTIONS = [
  opt("Idea", "gray"),
  opt("Planning", "blue"),
  opt("Active", "orange"),
  opt("Waiting", "yellow"),
  opt("Review", "purple"),
  opt("Completed", "green"),
  opt("Cancelled", "red"),
];

export const CLIENT_STATUS_OPTIONS = [
  opt("Lead", "gray"),
  opt("Contacted", "blue"),
  opt("Proposal", "yellow"),
  opt("Active", "green"),
  opt("Inactive", "brown"),
  opt("Lost", "red"),
];

export const INVOICE_STATUS_OPTIONS = [
  opt("Draft", "gray"),
  opt("Sent", "blue"),
  opt("Open", "yellow"),
  opt("Paid", "green"),
  opt("Overdue", "red"),
];

export const IDEA_STATUS_OPTIONS = [
  opt("Inbox", "gray"),
  opt("Thinking", "blue"),
  opt("Planned", "yellow"),
  opt("In Progress", "orange"),
  opt("Done", "green"),
  opt("Rejected", "red"),
];

/* ──────────────────────────────────────────────────── Formel-Ausdrücke
 *
 * Notion-Formeln 2.0. `format()` um jeden Select/Status, damit die Formeln
 * auch dann noch stimmen, wenn der Builder auf `select` zurückfallen musste
 * (siehe STATUS_FALLBACK in build-notion.mjs).
 */

const FX = {
  /** Checkbox: Task erledigt? Basis für den Projektfortschritt. */
  taskDone: 'format(prop("Status")) == "Done"',

  /** Checkbox: überfällig — Fälligkeit in der Vergangenheit und nicht erledigt. */
  taskOverdue:
    'and(not(empty(prop("Due Date"))), format(prop("Status")) != "Done", prop("Due Date") < now())',

  /** Nur die Uhrzeit der Fälligkeit, für "Today's Schedule". Leer wenn ohne Uhrzeit. */
  taskTime:
    'if(empty(prop("Due Date")), "", if(formatDate(prop("Due Date"), "HH:mm") == "00:00", "", formatDate(prop("Due Date"), "HH:mm")))',

  /** Rechnungsbeträge nach Status aufgeteilt — Rollups können nicht filtern. */
  invoicePaidAmount: 'if(format(prop("Status")) == "Paid", prop("Amount"), 0)',
  invoiceOpenAmount:
    'if(or(format(prop("Status")) == "Sent", format(prop("Status")) == "Open", format(prop("Status")) == "Overdue"), prop("Amount"), 0)',
  invoicePaid: 'format(prop("Status")) == "Paid"',

  /** Projektfortschritt als Balken — spiegelt den Rollup "Progress". */
  projectProgressBar:
    'if(empty(prop("Progress")), "—", ' +
    'slice("██████████", 0, round(prop("Progress") * 10)) + ' +
    'slice("──────────", 0, 10 - round(prop("Progress") * 10)) + ' +
    '"  " + format(round(prop("Progress") * 100)) + "%")',

  /** Konstante. Verhindert baulich, dass jemand hier ein Klartext-Passwort einträgt. */
  passwordNotice: '"🔐 Stored in 1Password"',

  /** Client: nächster Kontakt fällig? */
  clientFollowUpDue:
    'and(not(empty(prop("Next Contact"))), prop("Next Contact") <= now())',
};

/* ────────────────────────────────────────────────────────── Datenbanken */

export const DATABASES = [
  /* ═══════════════════════════════════════════════════════════ CLIENTS */
  {
    key: "clients",
    name: "Clients",
    icon: "👥",
    description: "CRM — jeder Kunde mit vollständiger digitaler Kundenakte.",
    base: {
      "Client Name": title(),
      Company: text(),
      "Contact Person": text(),
      Email: email(),
      Phone: phone(),
      Status: status(CLIENT_STATUS_OPTIONS),
      "Client Since": date(),
      "Last Contact": date(),
      "Next Contact": date(),
      Website: url(),
      "Google Drive": url(),
      Contract: url(),
      "1Password Vault": text(),
      Notes: text(),
    },
    // Keine eigenen Relations: Projects, Tasks, Invoices, Access, Client Notes,
    // Communication und Website Requirements entstehen automatisch als Gegenseite.
    relations: {},
    formulas: {
      "Follow Up Due": formula(FX.clientFollowUpDue),
    },
    rollups: {
      Revenue: rollup("Invoices", "Amount Paid", "sum"),
      "Open Invoices": rollup("Invoices", "Amount Open", "sum"),
      "Project Count": rollup("Projects", "Project Name", "count"),
      "Open Tasks": rollup("Tasks", "Done?", "unchecked"),
      "Access Entries": rollup("Access", "Service", "count"),
    },
  },

  /* ══════════════════════════════════════════════════════════ PROJECTS */
  {
    key: "projects",
    name: "Projects",
    icon: "🚀",
    description: "Alle Projekte von Novera Studio, verknüpft mit Kunde, Tasks und Umsatz.",
    base: {
      "Project Name": title(),
      Status: status(PROJECT_STATUS_OPTIONS),
      Priority: select(PRIORITY_OPTIONS),
      "Start Date": date(),
      Deadline: date(),
      "Google Drive": url(),
      "Live URL": url(),
      Notes: text(),
      Files: files(),
    },
    relations: {
      Client: relation("clients", "Projects"),
    },
    rollups: {
      Progress: rollup("Tasks", "Done?", "percent_checked"),
      "Tasks Total": rollup("Tasks", "Task Name", "count"),
      "Open Tasks": rollup("Tasks", "Done?", "unchecked"),
      Revenue: rollup("Invoices", "Amount Paid", "sum"),
      "Open Amount": rollup("Invoices", "Amount Open", "sum"),
    },
    // Liest das Rollup "Progress" — muss deshalb nach den Rollups laufen.
    lateFormulas: {
      "Progress Bar": formula(FX.projectProgressBar),
    },
  },

  /* ═════════════════════════════════════════════════════════════ TASKS */
  {
    key: "tasks",
    name: "Tasks",
    icon: "📋",
    description:
      "Zentrale Aufgabendatenbank. Eine Aufgabe wird genau einmal angelegt und erscheint über Relations überall dort, wo sie hingehört.",
    base: {
      "Task Name": title(),
      Status: status(TASK_STATUS_OPTIONS),
      Priority: select(PRIORITY_OPTIONS),
      // Datum MIT Uhrzeit — deshalb kein zweites Feld "Time" zum Pflegen.
      "Due Date": date(),
      Category: select(TASK_CATEGORY_OPTIONS),
      Notes: text(),
      "Completed Date": date(),
      "Created Date": createdTime(),
    },
    relations: {
      Client: relation("clients", "Tasks"),
      Project: relation("projects", "Tasks"),
    },
    formulas: {
      "Done?": formula(FX.taskDone),
      "Overdue?": formula(FX.taskOverdue),
      Time: formula(FX.taskTime),
    },
  },

  /* ══════════════════════════════════════════════════════════ INVOICES */
  {
    key: "invoices",
    name: "Invoices",
    icon: "🧾",
    description:
      "Übersicht der Rechnungen. Erstellt und verbucht wird weiterhin in Papierkram — hier steht nur der Status.",
    base: {
      "Invoice Number": title(),
      Amount: euro(),
      Date: date(),
      "Due Date": date(),
      Status: status(INVOICE_STATUS_OPTIONS),
      "Paperkram Link": url(),
      Notes: text(),
    },
    relations: {
      Client: relation("clients", "Invoices"),
      Project: relation("projects", "Invoices"),
    },
    formulas: {
      "Amount Paid": formula(FX.invoicePaidAmount),
      "Amount Open": formula(FX.invoiceOpenAmount),
      "Paid?": formula(FX.invoicePaid),
    },
  },

  /* ══════════════════════════════════════════════════════════ EXPENSES */
  {
    key: "expenses",
    name: "Expenses",
    icon: "💳",
    description:
      "Ausgabenübersicht. Belege und Steuerrelevantes bleiben in Papierkram.",
    base: {
      Expense: title(),
      Provider: text(),
      Category: select([
        opt("Software", "blue"),
        opt("Hosting", "purple"),
        opt("Hardware", "gray"),
        opt("Marketing", "pink"),
        opt("Subcontractor", "orange"),
        opt("Office", "brown"),
        opt("Travel", "yellow"),
        opt("Fees", "red"),
        opt("Other", "default"),
      ]),
      Amount: euro(),
      Date: date(),
      Recurring: select([
        opt("One-time", "gray"),
        opt("Monthly", "blue"),
        opt("Yearly", "purple"),
      ]),
      Receipt: url(),
      "Paperkram Link": url(),
      Notes: text(),
    },
    relations: {
      Project: relation("projects", "Expenses"),
    },
  },

  /* ════════════════════════════════════════════════════════════ ACCESS */
  {
    key: "access",
    name: "Client Access",
    icon: "🔐",
    description:
      "Dokumentiert WELCHE Zugänge existieren. Passwörter stehen ausschließlich in 1Password, niemals hier.",
    base: {
      "Access Entry": title(),
      Service: select([
        opt("Hostinger", "purple"),
        opt("Domain", "blue"),
        opt("WordPress", "gray"),
        opt("Hosting", "purple"),
        opt("Google Business", "green"),
        opt("Google Analytics", "orange"),
        opt("Search Console", "orange"),
        opt("Meta Business", "blue"),
        opt("Instagram", "pink"),
        opt("Facebook", "blue"),
        opt("E-Mail", "yellow"),
        opt("Social Media", "pink"),
        opt("Other", "default"),
      ]),
      "Username / Email": text(),
      "Login URL": url(),
      "Account Owner": select([
        opt("Novera Studio", "orange"),
        opt("Client", "blue"),
        opt("Shared", "gray"),
      ]),
      "2FA Enabled": checkbox(),
      "Recovery Email": email(),
      "Password Manager Reference": text(),
      Notes: text(),
    },
    relations: {
      Client: relation("clients", "Access"),
    },
    formulas: {
      // Konstante Formel — dieses Feld lässt sich nicht mit Klartext überschreiben.
      Password: formula(FX.passwordNotice),
    },
  },

  /* ══════════════════════════════════════════ WEBSITE REQUIREMENTS */
  {
    key: "requirements",
    name: "Website Requirements",
    icon: "🌐",
    description:
      "Strukturierte Anforderungsaufnahme pro Kunde/Projekt: was die Website können soll — und was ausdrücklich nicht.",
    base: {
      "Requirement Set": title(),
      Status: status([
        opt("Open Questions", "yellow"),
        opt("In Clarification", "orange"),
        opt("Confirmed", "green"),
        opt("Built", "blue"),
      ]),
      "Pages Wanted": multi([
        opt("Home", "blue"),
        opt("Services", "purple"),
        opt("About", "green"),
        opt("Contact", "orange"),
        opt("Portfolio", "pink"),
        opt("Blog", "yellow"),
        opt("Shop", "red"),
        opt("Team", "brown"),
        opt("FAQ", "gray"),
        opt("Legal / Impressum", "default"),
      ]),
      Style: multi([
        opt("Modern", "blue"),
        opt("Dark", "gray"),
        opt("Light", "default"),
        opt("Minimal", "brown"),
        opt("Bold", "red"),
        opt("Elegant", "purple"),
        opt("Playful", "pink"),
      ]),
      Features: multi([
        opt("Contact Form", "blue"),
        opt("WhatsApp Button", "green"),
        opt("Google Maps", "orange"),
        opt("Newsletter", "yellow"),
        opt("Booking / Termin", "purple"),
        opt("Social Media Links", "pink"),
        opt("Blog", "brown"),
        opt("Shop", "red"),
        opt("Multilingual", "gray"),
        opt("Live Chat", "default"),
      ]),
      Colors: text(),
      Logo: select([
        opt("Provided", "green"),
        opt("Needs Design", "orange"),
        opt("Needs Refresh", "yellow"),
        opt("None", "gray"),
      ]),
      Branding: text(),
      "Texts By": select([
        opt("Client", "blue"),
        opt("Novera Studio", "orange"),
        opt("AI-assisted", "purple"),
      ]),
      "Images By": select([
        opt("Client", "blue"),
        opt("Novera Studio", "orange"),
        opt("Stock", "gray"),
        opt("Photographer", "purple"),
      ]),
      "SEO Wishes": text(),
      "Mobile Requirements": text(),
      "Reference Websites": text(),
      "NOT Wanted": text(),
      "Special Requests": text(),
      Deadline: date(),
    },
    relations: {
      Client: relation("clients", "Website Requirements"),
      Project: relation("projects", "Website Requirements"),
    },
  },

  /* ═══════════════════════════════════════════════════ COMMUNICATION */
  {
    key: "communication",
    name: "Client Communication",
    icon: "💬",
    description:
      "Gesprächsprotokoll pro Kunde — damit später nachvollziehbar ist, was wann besprochen wurde.",
    base: {
      Entry: title(),
      Date: date(),
      Channel: select([
        opt("Call", "blue"),
        opt("E-Mail", "yellow"),
        opt("Meeting", "purple"),
        opt("WhatsApp", "green"),
        opt("On Site", "orange"),
        opt("Other", "gray"),
      ]),
      Summary: text(),
      "Follow Up": checkbox(),
      "Follow Up Date": date(),
    },
    relations: {
      Client: relation("clients", "Communication"),
      Project: relation("projects", "Client Communication"),
    },
  },

  /* ═════════════════════════════════════════════════════════════ IDEAS */
  {
    key: "ideas",
    name: "Ideas",
    icon: "💡",
    description: "Ideenspeicher für Novera Studio.",
    base: {
      Idea: title(),
      Category: select([
        opt("Business", "orange"),
        opt("Service", "blue"),
        opt("Product", "purple"),
        opt("Marketing", "pink"),
        opt("Website", "green"),
        opt("Social Media", "red"),
        opt("Content", "yellow"),
        opt("Automation", "brown"),
        opt("Other", "gray"),
      ]),
      Status: status(IDEA_STATUS_OPTIONS),
      Priority: select(PRIORITY_OPTIONS),
      Notes: text(),
      "Created Date": createdTime(),
    },
    relations: {
      Project: relation("projects", "Ideas"),
    },
  },

  /* ═════════════════════════════════════════════════════════════ NOTES */
  {
    key: "notes",
    name: "Notes",
    icon: "📝",
    description:
      "Schnelle Notizen. Lassen sich nachträglich einem Kunden, Projekt oder Task zuordnen.",
    base: {
      Note: title(),
      Type: select([
        opt("Quick Note", "gray"),
        opt("Meeting", "purple"),
        opt("Decision", "green"),
        opt("Research", "blue"),
        opt("Follow Up", "orange"),
      ]),
      Date: date(),
      "Created Date": createdTime(),
      Content: text(),
    },
    relations: {
      Client: relation("clients", "Client Notes"),
      Project: relation("projects", "Project Notes"),
      Task: relation("tasks", "Related Notes"),
    },
  },

  /* ═════════════════════════════════════════════════════════ KNOWLEDGE */
  {
    key: "knowledge",
    name: "Knowledge",
    icon: "🧠",
    description:
      "SOPs, Prozesse und Vorlagen von Novera Studio. Der eigentliche Inhalt steht im Seitenkörper.",
    base: {
      Title: title(),
      Category: select([
        opt("SOP", "orange"),
        opt("Process", "blue"),
        opt("Template", "purple"),
        opt("Guide", "green"),
        opt("Sales", "red"),
        opt("Marketing", "pink"),
        opt("Client Process", "yellow"),
        opt("Website Process", "brown"),
        opt("Automation", "gray"),
        opt("Useful Link", "default"),
      ]),
      Status: status([
        opt("Draft", "gray"),
        opt("Active", "green"),
        opt("Needs Review", "yellow"),
        opt("Archived", "brown"),
      ]),
      Tags: multi([
        opt("Onboarding", "blue"),
        opt("Offboarding", "brown"),
        opt("Design", "purple"),
        opt("Development", "orange"),
        opt("Finance", "green"),
        opt("Legal", "gray"),
        opt("Tools", "yellow"),
      ]),
      Link: url(),
      "Last Updated": lastEdited(),
    },
    relations: {},
  },
];

export const DB_BY_KEY = Object.fromEntries(DATABASES.map((d) => [d.key, d]));
