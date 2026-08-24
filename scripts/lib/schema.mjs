/**
 * NOVERA HQ — Datenmodell
 *
 * Neun Datenbanken. Der Grundsatz dahinter: so einfach wie möglich, so
 * umfangreich wie nötig. Was sich über eine Relation abbilden lässt, bekommt
 * keine eigene Datenbank.
 *
 * Bewusst NICHT enthalten:
 *   Finanzen      Papierkram ist die Buchhaltung. Im HQ steht nur der Link
 *                 und der monatliche Novera-Care-Betrag beim Kunden.
 *   Branding      Steckt im Website-Blueprint, wo es ohnehin hingehört —
 *                 Logo, Farben, Typografie und Bildsprache entstehen dort.
 *   Dokumente     Google Drive ist die Ablage. Notion hält nur den Ordnerlink
 *                 beim Kunden und beim Projekt.
 *   Notizen       Freitextfeld plus Seitenkörper, keine eigene Datenbank.
 *
 * Der Aufbau passiert in fünf Durchläufen, weil Notion-Properties voneinander
 * abhängen:
 *
 *   Pass 1  base          Datenbanken + einfache Properties
 *   Pass 2  relations     brauchen die data_source_id des Ziels aus Pass 1
 *   Pass 3  formulas      Formeln auf Basis-Properties
 *   Pass 4  rollups       lesen die Formeln aus Pass 3 über die Relations
 *   Pass 5  lateFormulas  Formeln, die ein Rollup oder eine Formel lesen
 *
 * Relations werden nur auf der Kind-Seite deklariert (Aufgabe → Kunde).
 * Notion legt die Gegenseite (Kunde → Aufgaben) automatisch an.
 */

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
export const people = () => ({ people: {} });
export const createdTime = () => ({ created_time: {} });
export const lastEdited = () => ({ last_edited_time: {} });
export const select = (options) => ({ select: { options } });
export const multi = (options) => ({ multi_select: { options } });
export const status = (options) => ({ status: { options } });
export const formula = (expression) => ({ formula: { expression } });

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

/* ───────────────────────────────────────────────── Gemeinsame Optionen
 *
 * Die Status-Namen stehen ohne Emoji. Die farbigen Punkte aus der Vorgabe
 * (🔵 🟣 🟡 …) sind Farbangaben, keine Symbole — und Notion-Status haben
 * echte Farben. Die Farbe steht deshalb dort, wo sie hingehört: als
 * Eigenschaft der Option. Das hält Filter und Formeln lesbar.
 */

export const PRIORITAET = [
  opt("Hoch", "red"),
  opt("Mittel", "yellow"),
  opt("Niedrig", "green"),
];

/** Der Vertriebstrichter, in der Reihenfolge des tatsächlichen Ablaufs. */
export const LEAD_STATUS = [
  opt("Neuer Lead", "blue"),
  opt("Qualifiziert", "purple"),
  opt("Erstkontakt", "yellow"),
  opt("Antwort erhalten", "orange"),
  opt("Follow-up", "brown"),
  opt("Angebot", "green"),
  opt("Verhandlung", "green"),
  opt("Gewonnen", "green"),
  opt("Verloren", "red"),
];

export const KUNDEN_STATUS = [
  opt("Interessent", "gray"),
  opt("Aktiver Kunde", "green"),
  opt("Projekt läuft", "orange"),
  opt("Wartung", "blue"),
  opt("Inaktiv", "brown"),
  opt("Beendet", "red"),
];

export const PROJEKT_STATUS = [
  opt("Konzeption", "gray"),
  opt("Design", "purple"),
  opt("Entwicklung", "blue"),
  opt("Kundenfeedback", "yellow"),
  opt("Änderungen", "orange"),
  opt("Freigegeben", "green"),
  opt("Live", "green"),
  opt("Wartung", "blue"),
  opt("Pausiert", "brown"),
  opt("Abgeschlossen", "default"),
];

export const WEBSITE_STATUS = [
  opt("Konzept", "gray"),
  opt("Blueprint", "purple"),
  opt("Design", "purple"),
  opt("Entwicklung", "blue"),
  opt("Feedback", "yellow"),
  opt("Abnahme", "orange"),
  opt("Live", "green"),
  opt("Wartung", "brown"),
];

export const ANGEBOT_STATUS = [
  opt("Entwurf", "gray"),
  opt("Fertig", "blue"),
  opt("Versendet", "yellow"),
  opt("Gespräch", "orange"),
  opt("Angenommen", "green"),
  opt("Abgelehnt", "red"),
  opt("Abgelaufen", "brown"),
];

export const AUFGABEN_STATUS = [
  opt("Offen", "gray"),
  opt("In Arbeit", "blue"),
  opt("Wartet auf Kunde", "yellow"),
  opt("Erledigt", "green"),
];

export const BLUEPRINT_STATUS = [
  opt("Konzept", "gray"),
  opt("In Arbeit", "blue"),
  opt("Beim Kunden", "yellow"),
  opt("Freigegeben", "green"),
  opt("Überholt", "brown"),
];

export const BRANCHE = [
  opt("Handwerk", "orange"),
  opt("Gastronomie", "red"),
  opt("Gesundheit", "green"),
  opt("Beratung", "blue"),
  opt("Handel", "purple"),
  opt("Dienstleistung", "gray"),
  opt("Immobilien", "brown"),
  opt("Fitness", "yellow"),
  opt("Kosmetik & Beauty", "pink"),
  opt("Sonstige", "default"),
];

/* ────────────────────────────────────────────────────── Formelausdrücke */

const FX = {
  /** Countdown, zweistufig: erst die Zahl, dann der Text. */
  tage: (dateProp) =>
    `if(empty(prop("${dateProp}")), 0, dateBetween(` +
    `parseDate(formatDate(prop("${dateProp}"), "YYYY-MM-DD")), ` +
    `parseDate(formatDate(now(), "YYYY-MM-DD")), "days"))`,

  /**
   * Lesbare Frist. `zahlProp` ist die Tage-Formel, `fertig` die Status,
   * bei denen nichts mehr drängt. `statusProp` weicht ab, wo die Status-Property
   * anders heißt — bei Hosting & Domains etwa "Domainstatus".
   *
   * Beide Daten werden über formatDate/parseDate auf den reinen Tag gekürzt.
   * Sonst rechnet dateBetween mit Uhrzeiten: "morgen 09:00" wäre von
   * "heute 14:00" nur 19 Stunden entfernt und damit 0 Tage — also "Heute".
   */
  frist: (dateProp, zahlProp, fertig, fertigText, statusProp = "Status") => {
    const tests = fertig.map((st) => `format(prop("${statusProp}")) == "${st}"`);
    // Notion verlangt bei or() mindestens zwei Argumente.
    const istFertig = tests.length === 0 ? null
      : tests.length === 1 ? tests[0]
      : `or(${tests.join(", ")})`;

    const kern =
      `if(prop("${zahlProp}") < 0, "Überfällig · " + format(abs(prop("${zahlProp}"))) + ` +
      `if(abs(prop("${zahlProp}")) == 1, " Tag", " Tage"), ` +
      `if(prop("${zahlProp}") == 0, "Heute", ` +
      `if(prop("${zahlProp}") == 1, "Morgen", ` +
      `"in " + format(prop("${zahlProp}")) + " Tagen")))`;

    return istFertig
      ? `if(empty(prop("${dateProp}")), "", if(${istFertig}, "${fertigText}", ${kern}))`
      : `if(empty(prop("${dateProp}")), "", ${kern})`;
  },

  aufgabeErledigt: 'format(prop("Status")) == "Erledigt"',
  aufgabeUeberfaellig:
    'and(not(empty(prop("Deadline"))), format(prop("Status")) != "Erledigt", prop("Deadline") < now())',
  aufgabeUhrzeit:
    'if(empty(prop("Deadline")), "", if(formatDate(prop("Deadline"), "HH:mm") == "00:00", "", formatDate(prop("Deadline"), "HH:mm")))',

  /** Angebotssumme. Leere Posten zählen als 0. */
  angebotSumme:
    'sum(prop("Websitepreis"), prop("Markenpaket"), prop("Domain"), prop("Weitere Leistungen"))',

  /** Fortschritt als Punktreihe — ruhiger im Dunkelmodus als ein Blockbalken. */
  fortschritt:
    'if(empty(prop("Fortschritt")), "—", ' +
    'slice("●●●●●●●●●●", 0, round(prop("Fortschritt") * 10)) + ' +
    'slice("○○○○○○○○○○", 0, 10 - round(prop("Fortschritt") * 10)) + ' +
    '"  " + format(round(prop("Fortschritt") * 100)) + "%")',

  /** Was Novera an einem Hosting monatlich verdient. */
  hostingMarge:
    'if(or(empty(prop("Monatlicher Kundenpreis")), empty(prop("Monatliche Kosten"))), 0, ' +
    'prop("Monatlicher Kundenpreis") - prop("Monatliche Kosten"))',

  /** Konstante. Verhindert baulich, dass hier ein Klartext-Passwort landet. */
  passwortHinweis: '"🔐 In 1Password"',

  /** Follow-up fällig? */
  followUpFaellig:
    'and(not(empty(prop("Nächstes Follow-up"))), prop("Nächstes Follow-up") <= now())',
};

/* ────────────────────────────────────────────────────────── Datenbanken */

export const DATABASES = [
  /* ═════════════════════════════════════════════════════════════ LEADS */
  {
    key: "leads",
    name: "Leads",
    icon: "🎯",
    description: "Der Vertriebstrichter — vom gefundenen Unternehmen bis zum gewonnenen Kunden.",
    base: {
      Unternehmen: title(),
      Ansprechpartner: text(),
      "E-Mail": email(),
      Telefon: phone(),
      Website: url(),
      Instagram: url(),
      Facebook: url(),
      "Google-Unternehmensprofil": url(),
      Branche: select(BRANCHE),
      Standort: text(),
      "Lead Score": number(),
      Priorität: select(PRIORITAET),
      Status: status(LEAD_STATUS),
      Quelle: select([
        opt("Google Maps", "blue"),
        opt("Instagram", "pink"),
        opt("Empfehlung", "green"),
        opt("Website-Anfrage", "purple"),
        opt("Kaltakquise", "orange"),
        opt("Netzwerk", "brown"),
        opt("Sonstige", "gray"),
      ]),
      "Sales Angle": text(),
      "Letzter Kontakt": date(),
      "Nächstes Follow-up": date(),
      Notizen: text(),
    },
    relations: {},
    formulas: {
      "Follow-up fällig": formula(FX.followUpFaellig),
    },
  },

  /* ════════════════════════════════════════════════════════════ KUNDEN */
  {
    key: "kunden",
    name: "Kunden",
    icon: "👥",
    description: "Die zentrale Kundenakte. Von hier aus ist alles zum Kunden erreichbar.",
    base: {
      Firmenname: title(),
      Ansprechpartner: text(),
      "E-Mail": email(),
      Telefon: phone(),
      Adresse: text(),
      Website: url(),
      Instagram: url(),
      Branche: select(BRANCHE),
      Standort: text(),
      "Kunde seit": date(),
      Status: status(KUNDEN_STATUS),
      "Novera Care": checkbox(),
      "Novera Care · Monatlich": euro(),
      "Google Drive": url(),
      Papierkram: url(),
      "1Password Vault": text(),
      Notizen: text(),
    },
    relations: {
      Lead: relation("leads", "Kunde"),
    },
    rollups: {
      "Offene Aufgaben": rollup("Aufgaben", "Erledigt?", "unchecked"),
      "Angebotswert": rollup("Angebote", "Gesamtpreis", "sum"),
    },
  },

  /* ══════════════════════════════════════════════════════════ PROJEKTE */
  {
    key: "projekte",
    name: "Projekte",
    icon: "🚀",
    description: "Jeder Auftrag als Projekt — mit Kunde, Deadline, Preis und Fortschritt.",
    base: {
      Projektname: title(),
      Projekttyp: select([
        opt("Website", "blue"),
        opt("Relaunch", "purple"),
        opt("Landingpage", "green"),
        opt("Markenpaket", "pink"),
        opt("Wartung", "brown"),
        opt("Sonstiges", "gray"),
      ]),
      Status: status(PROJEKT_STATUS),
      Startdatum: date(),
      Deadline: date(),
      Preis: euro(),
      "Live-URL": url(),
      "Google Drive": url(),
      Notizen: text(),
    },
    relations: {
      Kunde: relation("kunden", "Projekte"),
    },
    formulas: {
      "Tage bis Deadline": formula(FX.tage("Deadline")),
    },
    rollups: {
      Fortschritt: rollup("Aufgaben", "Erledigt?", "percent_checked"),
      "Offene Aufgaben": rollup("Aufgaben", "Erledigt?", "unchecked"),
    },
    lateFormulas: {
      Frist: formula(
        FX.frist("Deadline", "Tage bis Deadline", ["Live", "Abgeschlossen", "Pausiert"], "—")
      ),
      Fortschrittsbalken: formula(FX.fortschritt),
    },
  },

  /* ══════════════════════════════════════════════════════════ WEBSITES */
  {
    key: "websites",
    name: "Websites",
    icon: "🌐",
    description: "Die technische Sicht auf jede Website — Status, Domain, Mockups, Launch.",
    base: {
      Website: title(),
      Status: status(WEBSITE_STATUS),
      Domain: text(),
      "Live-URL": url(),
      "Preview-URL": url(),
      "Desktop Mockup": url(),
      "Mobile Mockup": url(),
      // Link zum Markenordner in Google Drive. Die Vorgaben selbst
      // (Farben, Typografie, Bildsprache) stehen im Blueprint.
      Branding: url(),
      "SEO erledigt": checkbox(),
      Launchdatum: date(),
      "Letzte Aktualisierung": lastEdited(),
    },
    relations: {
      Kunde: relation("kunden", "Websites"),
      Projekt: relation("projekte", "Websites"),
    },
    rollups: {
      // Keine doppelte Pflege: Novera Care steht beim Kunden und wird hier
      // nur gespiegelt. show_original zeigt den Haken selbst statt einer Zahl.
      "Novera Care": rollup("Kunde", "Novera Care", "show_original"),
    },
  },

  /* ═════════════════════════════════════════════════════════ BLUEPRINTS */
  {
    key: "blueprints",
    name: "Website Blueprints",
    icon: "🧠",
    description:
      "Der Bauplan je Website: Seitenstruktur, Design, Komponenten, SEO, Mockups, Freigabe. Inhalt steht im Seitenkörper.",
    base: {
      Blueprint: title(),
      Version: select([
        opt("v1 · Konzept", "gray"),
        opt("v2 · Kundenänderungen", "yellow"),
        opt("v3 · final", "green"),
        opt("v4", "green"),
        opt("v5", "green"),
      ]),
      Status: status(BLUEPRINT_STATUS),
      Kundenfreigabe: checkbox(),
      Freigabedatum: date(),
      "Desktop Mockup": url(),
      "Mobile Mockup": url(),
      "Google Drive": url(),
      Notizen: text(),
    },
    relations: {
      Website: relation("websites", "Blueprint"),
      // Der Kunde steckt bereits über die Website drin. Die direkte Relation
      // kostet beim Anlegen einen Klick und macht dafür den Blueprint in der
      // Kundenakte unmittelbar filterbar — über die Website ginge das nicht.
      Kunde: relation("kunden", "Blueprints"),
    },
  },

  /* ══════════════════════════════════════════════════════════ ANGEBOTE */
  {
    key: "angebote",
    name: "Angebote",
    icon: "📄",
    description: "Angebote mit Einzelposten. Die Rechnung selbst entsteht später in Papierkram.",
    base: {
      Angebotsname: title(),
      Websitepreis: euro(),
      Markenpaket: euro(),
      "Novera Care · Monatlich": euro(),
      Domain: euro(),
      "Weitere Leistungen": euro(),
      "PDF / Google Drive": url(),
      "Erstellt am": date(),
      "Versendet am": date(),
      "Gültig bis": date(),
      Status: status(ANGEBOT_STATUS),
      Notizen: text(),
    },
    relations: {
      Kunde: relation("kunden", "Angebote"),
      Projekt: relation("projekte", "Angebote"),
      // Ein Angebot geht oft an einen Lead, bevor daraus ein Kunde wird.
      Lead: relation("leads", "Angebot"),
    },
    formulas: {
      // Einmalige Posten. Novera Care läuft monatlich und zählt nicht hinein.
      Gesamtpreis: formula(FX.angebotSumme),
      "Tage bis Ablauf": formula(FX.tage("Gültig bis")),
    },
    lateFormulas: {
      Gültigkeit: formula(
        FX.frist("Gültig bis", "Tage bis Ablauf", ["Angenommen", "Abgelehnt", "Entwurf"], "—")
      ),
    },
  },

  /* ══════════════════════════════════════════════════════════ AUFGABEN */
  {
    key: "aufgaben",
    name: "Aufgaben",
    icon: "✅",
    description:
      "Alles, was zu tun ist. Eine Aufgabe wird einmal angelegt und erscheint über Relations beim Kunden und beim Projekt.",
    base: {
      Aufgabe: title(),
      Kategorie: select([
        opt("Sales", "red"),
        opt("Kunde", "blue"),
        opt("Design", "purple"),
        opt("Entwicklung", "orange"),
        opt("SEO", "green"),
        opt("Technik", "brown"),
        opt("Admin", "gray"),
        opt("Sonstiges", "default"),
      ]),
      Priorität: select(PRIORITAET),
      Status: status(AUFGABEN_STATUS),
      // Datum MIT Uhrzeit — deshalb kein zweites Feld für die Zeit.
      Deadline: date(),
      Zuständig: people(),
      Wiederkehrend: select([
        opt("Einmalig", "gray"),
        opt("Wöchentlich", "blue"),
        opt("Monatlich", "purple"),
        opt("Jährlich", "brown"),
      ]),
      Notiz: text(),
      Erstellt: createdTime(),
    },
    relations: {
      Kunde: relation("kunden", "Aufgaben"),
      Projekt: relation("projekte", "Aufgaben"),
    },
    formulas: {
      "Erledigt?": formula(FX.aufgabeErledigt),
      "Überfällig?": formula(FX.aufgabeUeberfaellig),
      Uhrzeit: formula(FX.aufgabeUhrzeit),
      "Tage bis Deadline": formula(FX.tage("Deadline")),
    },
    lateFormulas: {
      Frist: formula(FX.frist("Deadline", "Tage bis Deadline", ["Erledigt"], "Erledigt")),
    },
  },

  /* ═══════════════════════════════════════════════ HOSTING & DOMAINS */
  {
    key: "hosting",
    name: "Hosting & Domains",
    icon: "☁️",
    description:
      "Was wo läuft und wann es verlängert werden muss. Domains dürfen bei ihrem " +
      "bisherigen Anbieter bleiben — hier wird dokumentiert, nicht transferiert.",
    base: {
      Eintrag: title(),
      Hostinganbieter: select([
        opt("Hostinger", "purple"),
        opt("IONOS", "blue"),
        opt("All-Inkl", "green"),
        opt("Netlify", "gray"),
        opt("Vercel", "default"),
        opt("Sonstiger", "brown"),
      ]),
      Tarif: text(),
      "Monatliche Kosten": euro(),
      Domain: text(),
      Registrar: select([
        opt("Hostinger", "purple"),
        opt("IONOS", "blue"),
        opt("United Domains", "green"),
        opt("Namecheap", "orange"),
        opt("Sonstiger", "brown"),
      ]),
      Domainstatus: status([
        opt("Aktiv", "green"),
        opt("Verlängerung fällig", "orange"),
        opt("Übertragung läuft", "yellow"),
        opt("Gekündigt", "red"),
      ]),
      Ablaufdatum: date(),
      SSL: checkbox(),
      Backup: checkbox(),
      "Monatlicher Kundenpreis": euro(),
      Notiz: text(),
    },
    relations: {
      Kunde: relation("kunden", "Hosting & Domains"),
      Website: relation("websites", "Hosting"),
    },
    rollups: {
      // Wie bei Websites nur gespiegelt — gepflegt wird der Haken beim Kunden.
      "Novera Care": rollup("Kunde", "Novera Care", "show_original"),
    },
    formulas: {
      "Tage bis Ablauf": formula(FX.tage("Ablaufdatum")),
      Marge: formula(FX.hostingMarge),
    },
    lateFormulas: {
      Ablauf: formula(
        FX.frist("Ablaufdatum", "Tage bis Ablauf", ["Gekündigt"], "—", "Domainstatus")
      ),
    },
  },

  /* ══════════════════════════════════════════════════════════ ZUGÄNGE */
  {
    key: "zugaenge",
    name: "Zugänge",
    icon: "🔐",
    description:
      "Dokumentiert, WELCHE Zugänge existieren. Die Passwörter liegen ausschließlich in 1Password.",
    base: {
      Eintrag: title(),
      Service: select([
        opt("Hostinger", "purple"),
        opt("Domain", "blue"),
        opt("WordPress", "gray"),
        opt("Google Business", "green"),
        opt("Google Analytics", "orange"),
        opt("Search Console", "orange"),
        opt("Meta Business", "blue"),
        opt("Instagram", "pink"),
        opt("Facebook", "blue"),
        opt("E-Mail-Postfach", "yellow"),
        opt("Sonstiger", "default"),
      ]),
      "Benutzername / E-Mail": text(),
      "1Password-Eintrag": text(),
      URL: url(),
      Zweck: text(),
      Status: select([
        opt("Aktiv", "green"),
        opt("Inaktiv", "gray"),
      ]),
      "2FA aktiv": checkbox(),
      Notiz: text(),
    },
    relations: {
      Kunde: relation("kunden", "Zugänge"),
    },
    formulas: {
      // Feste Formel: lässt sich nicht mit einem Klartext-Passwort überschreiben.
      Passwort: formula(FX.passwortHinweis),
    },
  },
];

export const DB_BY_KEY = Object.fromEntries(DATABASES.map((d) => [d.key, d]));
