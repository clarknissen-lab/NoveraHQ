/**
 * Ansichten je Datenbank.
 *
 * Relative Datumsoperatoren (`past_week`, `this_week`, `next_week`) rechnet
 * Notion selbst aus. Dadurch bleiben "Heute" und "Überfällig" dauerhaft
 * korrekt, ohne dass irgendetwas nachgeführt werden muss.
 */

const HEUTE = {
  and: [
    { property: "Deadline", date: { on_or_after: "today" } },
    { property: "Deadline", date: { before: "tomorrow" } },
  ],
};

const OFFEN = { property: "Status", status: { does_not_equal: "Erledigt" } };

export const VIEWS = {
  /* ═════════════════════════════════════════════════════════════ LEADS */
  leads: [
    {
      name: "Neue Leads",
      type: "table",
      filter: { property: "Status", status: { equals: "Neuer Lead" } },
      sorts: [{ property: "Lead Score", direction: "descending" }],
      description: "Frisch gefunden, noch nicht bewertet.",
    },
    {
      name: "Heute kontaktieren",
      type: "table",
      filter: {
        and: [
          { property: "Status", status: { does_not_equal: "Gewonnen" } },
          { property: "Status", status: { does_not_equal: "Verloren" } },
          { property: "Nächstes Follow-up", date: { on_or_before: "today" } },
        ],
      },
      sorts: [{ property: "Priorität", direction: "ascending" }],
      description: "Follow-up ist fällig oder überfällig.",
    },
    {
      name: "Follow-ups",
      type: "table",
      filter: { property: "Status", status: { equals: "Follow-up" } },
      sorts: [{ property: "Nächstes Follow-up", direction: "ascending" }],
    },
    {
      name: "Angebote offen",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Angebot" } },
          { property: "Status", status: { equals: "Verhandlung" } },
        ],
      },
      sorts: [{ property: "Nächstes Follow-up", direction: "ascending" }],
    },
    {
      name: "Trichter",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
      description: "Der gesamte Vertriebsweg auf einen Blick.",
    },
    {
      name: "Gewonnen",
      type: "table",
      filter: { property: "Status", status: { equals: "Gewonnen" } },
      sorts: [{ property: "Letzter Kontakt", direction: "descending" }],
    },
    {
      name: "Verloren",
      type: "table",
      filter: { property: "Status", status: { equals: "Verloren" } },
    },
    { name: "Alle Leads", type: "table", sorts: [{ property: "Lead Score", direction: "descending" }] },
  ],

  /* ════════════════════════════════════════════════════════════ KUNDEN */
  kunden: [
    {
      name: "Aktive Kunden",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Aktiver Kunde" } },
          { property: "Status", status: { equals: "Projekt läuft" } },
          { property: "Status", status: { equals: "Wartung" } },
        ],
      },
      sorts: [{ property: "Firmenname", direction: "ascending" }],
    },
    {
      name: "Novera Care",
      type: "table",
      filter: { property: "Novera Care", checkbox: { equals: true } },
      sorts: [{ property: "Firmenname", direction: "ascending" }],
      description: "Laufende Betreuung. Summenzeile zeigt den Monatsumsatz.",
    },
    {
      name: "Nach Status",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
    },
    { name: "Alle Kunden", type: "table", sorts: [{ property: "Firmenname", direction: "ascending" }] },
  ],

  /* ══════════════════════════════════════════════════════════ PROJEKTE */
  projekte: [
    {
      name: "Aktiv",
      type: "table",
      filter: {
        and: [
          { property: "Status", status: { does_not_equal: "Abgeschlossen" } },
          { property: "Status", status: { does_not_equal: "Pausiert" } },
          { property: "Status", status: { does_not_equal: "Live" } },
        ],
      },
      sorts: [{ property: "Deadline", direction: "ascending" }],
    },
    {
      name: "Nach Status",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
      sorts: [{ property: "Deadline", direction: "ascending" }],
      description: "Konzeption → Design → Entwicklung → Feedback → Live.",
    },
    {
      name: "Dringend",
      type: "table",
      filter: {
        and: [
          { property: "Status", status: { does_not_equal: "Abgeschlossen" } },
          { property: "Status", status: { does_not_equal: "Live" } },
          { property: "Status", status: { does_not_equal: "Pausiert" } },
          // "next_week" ist ein eigener Operator (date: { next_week: {} }) und
          // kein gültiger Wert für "before". Notion nimmt dort nur today,
          // tomorrow, yesterday, one_week_ago, one_week_from_now,
          // one_month_ago, one_month_from_now oder ein ISO-Datum.
          { property: "Deadline", date: { before: "one_week_from_now" } },
        ],
      },
      sorts: [{ property: "Deadline", direction: "ascending" }],
      description: "Deadline innerhalb der nächsten Woche — oder schon vorbei.",
    },
    {
      name: "Kundenfeedback",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Kundenfeedback" } },
          { property: "Status", status: { equals: "Änderungen" } },
        ],
      },
      description: "Liegt beim Kunden oder wartet auf Umsetzung.",
    },
    {
      name: "Deadlines",
      type: "table",
      filter: {
        and: [
          { property: "Status", status: { does_not_equal: "Abgeschlossen" } },
          { property: "Deadline", date: { is_not_empty: true } },
        ],
      },
      sorts: [{ property: "Deadline", direction: "ascending" }],
    },
    { name: "Zeitachse", type: "timeline", dateProperty: "Startdatum", endDateProperty: "Deadline" },
    { name: "Alle Projekte", type: "table" },
  ],

  /* ══════════════════════════════════════════════════════════ WEBSITES */
  websites: [
    {
      name: "In Arbeit",
      type: "table",
      filter: {
        and: [
          { property: "Status", status: { does_not_equal: "Live" } },
          { property: "Status", status: { does_not_equal: "Wartung" } },
        ],
      },
    },
    {
      name: "Vor dem Launch",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Abnahme" } },
          { property: "Status", status: { equals: "Feedback" } },
        ],
      },
      description: "Steht kurz vor dem Livegang.",
    },
    {
      name: "Live",
      type: "table",
      filter: { property: "Status", status: { equals: "Live" } },
      sorts: [{ property: "Launchdatum", direction: "descending" }],
    },
    {
      name: "Nach Status",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
    },
    { name: "Alle Websites", type: "table" },
  ],

  /* ═══════════════════════════════════════════════════════ BLUEPRINTS */
  blueprints: [
    {
      name: "Aktuelle Version",
      type: "table",
      filter: { property: "Status", status: { does_not_equal: "Überholt" } },
      sorts: [{ property: "Blueprint", direction: "ascending" }],
      description: "Ohne die überholten Stände.",
    },
    {
      name: "Freigegeben",
      type: "table",
      filter: { property: "Kundenfreigabe", checkbox: { equals: true } },
      sorts: [{ property: "Freigabedatum", direction: "descending" }],
      description: "Der verbindliche Stand — danach wird gebaut.",
    },
    {
      name: "Beim Kunden",
      type: "table",
      filter: { property: "Status", status: { equals: "Beim Kunden" } },
    },
    { name: "Alle Blueprints", type: "table" },
  ],

  /* ══════════════════════════════════════════════════════════ ANGEBOTE */
  angebote: [
    {
      name: "Offen",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Versendet" } },
          { property: "Status", status: { equals: "Gespräch" } },
        ],
      },
      sorts: [{ property: "Gültig bis", direction: "ascending" }],
      description: "Verschickt, noch keine Entscheidung.",
    },
    {
      name: "Zu erstellen",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Entwurf" } },
          { property: "Status", status: { equals: "Fertig" } },
        ],
      },
    },
    {
      name: "Angenommen",
      type: "table",
      filter: { property: "Status", status: { equals: "Angenommen" } },
      sorts: [{ property: "Versendet am", direction: "descending" }],
    },
    {
      name: "Nach Status",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
    },
    { name: "Alle Angebote", type: "table" },
  ],

  /* ══════════════════════════════════════════════════════════ AUFGABEN */
  aufgaben: [
    {
      name: "Heute",
      type: "table",
      filter: { and: [OFFEN, HEUTE] },
      sorts: [
        { property: "Deadline", direction: "ascending" },
        { property: "Priorität", direction: "ascending" },
      ],
    },
    {
      name: "Überfällig",
      type: "table",
      filter: { and: [OFFEN, { property: "Deadline", date: { before: "today" } }] },
      sorts: [{ property: "Deadline", direction: "ascending" }],
      description: "Sollte im Alltag leer sein.",
    },
    {
      name: "Diese Woche",
      type: "table",
      filter: { and: [OFFEN, { property: "Deadline", date: { this_week: {} } }] },
      sorts: [{ property: "Deadline", direction: "ascending" }],
    },
    {
      name: "Wartet auf Kunde",
      type: "table",
      filter: { property: "Status", status: { equals: "Wartet auf Kunde" } },
      sorts: [{ property: "Deadline", direction: "ascending" }],
      description: "Liegt nicht bei mir — trotzdem im Blick behalten.",
    },
    {
      name: "Nach Kunde",
      type: "board",
      groupByProperty: "Kunde",
      groupByType: "relation",
      filter: OFFEN,
      description: "Eine Spalte je Kunde — offene Aufgaben auf einen Blick.",
    },
    {
      name: "Nach Projekt",
      type: "board",
      groupByProperty: "Projekt",
      groupByType: "relation",
      filter: OFFEN,
      description: "Eine Spalte je Projekt.",
    },
    {
      name: "Nach Status",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
      filter: OFFEN,
    },
    { name: "Kalender", type: "calendar", dateProperty: "Deadline", filter: OFFEN },
    {
      name: "Erledigt",
      type: "table",
      filter: { property: "Status", status: { equals: "Erledigt" } },
      sorts: [{ property: "Deadline", direction: "descending" }],
    },
    { name: "Alle Aufgaben", type: "table", sorts: [{ property: "Deadline", direction: "ascending" }] },
  ],

  /* ══════════════════════════════════════════════ HOSTING & DOMAINS */
  hosting: [
    {
      name: "Domainverlängerungen",
      type: "table",
      filter: {
        and: [
          { property: "Domainstatus", status: { does_not_equal: "Gekündigt" } },
          { property: "Ablaufdatum", date: { before: "one_month_from_now" } },
        ],
      },
      sorts: [{ property: "Ablaufdatum", direction: "ascending" }],
      description: "Läuft im nächsten Monat ab — rechtzeitig verlängern.",
    },
    {
      name: "Aktive Hostings",
      type: "table",
      filter: { property: "Domainstatus", status: { equals: "Aktiv" } },
      sorts: [{ property: "Ablaufdatum", direction: "ascending" }],
      description: "Summenzeile zeigt Kosten, Kundenpreis und Marge.",
    },
    {
      name: "Ohne SSL",
      type: "table",
      filter: { property: "SSL", checkbox: { equals: false } },
      description: "Muss vor dem Launch erledigt sein.",
    },
    {
      name: "Nach Anbieter",
      type: "board",
      groupByProperty: "Hostinganbieter",
      groupByType: "select",
      description: "Zeigt, was wo liegt — Domains dürfen bei ihrem Anbieter bleiben.",
    },
    { name: "Alle Einträge", type: "table", sorts: [{ property: "Ablaufdatum", direction: "ascending" }] },
  ],

  /* ═══════════════════════════════════════════════════════════ ZUGÄNGE */
  zugaenge: [
    {
      name: "Nach Kunde",
      type: "table",
      filter: { property: "Status", select: { equals: "Aktiv" } },
      sorts: [{ property: "Eintrag", direction: "ascending" }],
      description: "Alle aktiven Zugänge. Passwörter stehen in 1Password.",
    },
    {
      name: "Ohne 2FA",
      type: "table",
      filter: {
        and: [
          { property: "Status", select: { equals: "Aktiv" } },
          { property: "2FA aktiv", checkbox: { equals: false } },
        ],
      },
      description: "Sicherheitslücken — hier 2FA nachziehen.",
    },
    {
      name: "Nach Service",
      type: "board",
      groupByProperty: "Service",
      groupByType: "select",
    },
    { name: "Alle Zugänge", type: "table" },
  ],
};

/**
 * Baut den `configuration`-Block einer Ansicht.
 * `propertyIds` bildet Property-Name → Property-ID ab.
 */
export function buildViewConfiguration(view, propertyIds) {
  switch (view.type) {
    case "board": {
      const propertyId = propertyIds[view.groupByProperty];
      if (!propertyId) return null;
      const groupBy =
        view.groupByType === "status"
          ? { type: "status", property_id: propertyId, group_by: "group", sort: { type: "manual" } }
          : view.groupByType === "relation"
            // Notion bildet je verknüpftem Datensatz eine Spalte. Leere Gruppen
            // ausblenden, sonst steht für jeden Kunden ohne Aufgabe eine leere da.
            ? { type: "relation", property_id: propertyId, sort: { type: "ascending" }, hide_empty_groups: true }
            : { type: view.groupByType ?? "select", property_id: propertyId, sort: { type: "manual" } };
      return { type: "board", group_by: groupBy, card_layout: "compact" };
    }
    case "calendar": {
      const propertyId = propertyIds[view.dateProperty];
      if (!propertyId) return null;
      return { type: "calendar", date_property_id: propertyId };
    }
    case "timeline": {
      const propertyId = propertyIds[view.dateProperty];
      if (!propertyId) return null;
      return {
        type: "timeline",
        date_property_id: propertyId,
        ...(view.endDateProperty && propertyIds[view.endDateProperty]
          ? { end_date_property_id: propertyIds[view.endDateProperty] }
          : {}),
        show_table: true,
        preference: { zoom_level: "week" },
      };
    }
    default:
      return null;
  }
}
