/**
 * Ansichten je Datenbank.
 *
 * Filter benutzen dasselbe Format wie die Data-Source-Query. Relative Datums-
 * operatoren (`past_week`, `this_week`, `next_week`) rechnet Notion selbst aus —
 * dadurch bleibt "Today" und "Overdue" ohne Automatisierung dauerhaft korrekt.
 *
 * Property-IDs (für group_by) werden erst zur Laufzeit aufgelöst, deshalb steht
 * hier nur der Property-NAME in `groupByProperty`.
 */

/** Fälligkeit heute: von heute 00:00 bis morgen 00:00. */
const DUE_TODAY = {
  and: [
    { property: "Due Date", date: { on_or_after: "today" } },
    { property: "Due Date", date: { before: "tomorrow" } },
  ],
};

const NOT_DONE = { property: "Status", status: { does_not_equal: "Done" } };

export const VIEWS = {
  /* ═══════════════════════════════════════════════════════════════ TASKS */
  tasks: [
    {
      name: "Today",
      type: "table",
      filter: { and: [NOT_DONE, DUE_TODAY] },
      sorts: [
        { property: "Due Date", direction: "ascending" },
        { property: "Priority", direction: "ascending" },
      ],
      description: "Alles, was heute ansteht. Nach Uhrzeit sortiert.",
    },
    {
      name: "Overdue",
      type: "table",
      filter: {
        and: [NOT_DONE, { property: "Due Date", date: { before: "today" } }],
      },
      sorts: [{ property: "Due Date", direction: "ascending" }],
      description: "Überfällig — sollte möglichst leer sein.",
    },
    {
      name: "High Priority",
      type: "table",
      filter: {
        and: [NOT_DONE, { property: "Priority", select: { equals: "High" } }],
      },
      sorts: [{ property: "Due Date", direction: "ascending" }],
    },
    {
      name: "This Week",
      type: "table",
      filter: { and: [NOT_DONE, { property: "Due Date", date: { this_week: {} } }] },
      sorts: [{ property: "Due Date", direction: "ascending" }],
    },
    {
      name: "Upcoming",
      type: "table",
      filter: {
        and: [NOT_DONE, { property: "Due Date", date: { on_or_after: "today" } }],
      },
      sorts: [{ property: "Due Date", direction: "ascending" }],
    },
    {
      name: "Inbox",
      type: "table",
      filter: { property: "Status", status: { equals: "Inbox" } },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      description: "Unsortiert reingeworfen — hier wird triagiert.",
    },
    {
      name: "By Status",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
      filter: { property: "Status", status: { does_not_equal: "Done" } },
      sorts: [{ property: "Due Date", direction: "ascending" }],
    },
    {
      name: "Calendar",
      type: "calendar",
      dateProperty: "Due Date",
      filter: NOT_DONE,
    },
    {
      name: "Completed",
      type: "table",
      filter: { property: "Status", status: { equals: "Done" } },
      sorts: [{ property: "Completed Date", direction: "descending" }],
    },
    { name: "All Tasks", type: "table", sorts: [{ property: "Due Date", direction: "ascending" }] },
  ],

  /* ════════════════════════════════════════════════════════════ PROJECTS */
  projects: [
    {
      name: "Active",
      type: "table",
      filter: { property: "Status", status: { equals: "Active" } },
      sorts: [{ property: "Deadline", direction: "ascending" }],
    },
    {
      name: "By Status",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
      sorts: [{ property: "Deadline", direction: "ascending" }],
    },
    {
      name: "Deadlines",
      type: "table",
      filter: {
        and: [
          { property: "Status", status: { does_not_equal: "Completed" } },
          { property: "Status", status: { does_not_equal: "Cancelled" } },
          { property: "Deadline", date: { is_not_empty: true } },
        ],
      },
      sorts: [{ property: "Deadline", direction: "ascending" }],
    },
    {
      name: "Timeline",
      type: "timeline",
      dateProperty: "Start Date",
      endDateProperty: "Deadline",
    },
    {
      name: "Pipeline",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Idea" } },
          { property: "Status", status: { equals: "Planning" } },
        ],
      },
    },
    { name: "All Projects", type: "table" },
  ],

  /* ═════════════════════════════════════════════════════════════ CLIENTS */
  clients: [
    {
      name: "Active Clients",
      type: "table",
      filter: { property: "Status", status: { equals: "Active" } },
      sorts: [{ property: "Client Name", direction: "ascending" }],
    },
    {
      name: "Leads",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Lead" } },
          { property: "Status", status: { equals: "Contacted" } },
        ],
      },
      sorts: [{ property: "Next Contact", direction: "ascending" }],
    },
    {
      name: "Proposal",
      type: "table",
      filter: { property: "Status", status: { equals: "Proposal" } },
      sorts: [{ property: "Next Contact", direction: "ascending" }],
    },
    {
      name: "Follow Up",
      type: "table",
      filter: { property: "Next Contact", date: { on_or_before: "today" } },
      sorts: [{ property: "Next Contact", direction: "ascending" }],
      description: "Kunden, bei denen ein Kontakt fällig ist.",
    },
    {
      name: "Pipeline",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
    },
    { name: "All Clients", type: "table", sorts: [{ property: "Client Name", direction: "ascending" }] },
  ],

  /* ════════════════════════════════════════════════════════════ INVOICES */
  invoices: [
    {
      name: "Open",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Sent" } },
          { property: "Status", status: { equals: "Open" } },
          { property: "Status", status: { equals: "Overdue" } },
        ],
      },
      sorts: [{ property: "Due Date", direction: "ascending" }],
    },
    {
      name: "Overdue",
      type: "table",
      filter: {
        and: [
          { property: "Status", status: { does_not_equal: "Paid" } },
          { property: "Status", status: { does_not_equal: "Draft" } },
          { property: "Due Date", date: { before: "today" } },
        ],
      },
      sorts: [{ property: "Due Date", direction: "ascending" }],
    },
    {
      name: "Paid",
      type: "table",
      filter: { property: "Status", status: { equals: "Paid" } },
      sorts: [{ property: "Date", direction: "descending" }],
    },
    {
      name: "By Status",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
    },
    { name: "All Invoices", type: "table", sorts: [{ property: "Date", direction: "descending" }] },
  ],

  /* ════════════════════════════════════════════════════════════ EXPENSES */
  expenses: [
    { name: "All Expenses", type: "table", sorts: [{ property: "Date", direction: "descending" }] },
    {
      name: "This Month",
      type: "table",
      filter: { property: "Date", date: { past_month: {} } },
      sorts: [{ property: "Date", direction: "descending" }],
    },
    {
      name: "Recurring",
      type: "table",
      filter: { property: "Recurring", select: { does_not_equal: "One-time" } },
      sorts: [{ property: "Amount", direction: "descending" }],
      description: "Laufende Kosten — regelmäßig auf Sinnhaftigkeit prüfen.",
    },
    {
      name: "By Category",
      type: "board",
      groupByProperty: "Category",
      groupByType: "select",
    },
  ],

  /* ══════════════════════════════════════════════════════════════ ACCESS */
  access: [
    {
      name: "By Client",
      type: "table",
      sorts: [{ property: "Access Entry", direction: "ascending" }],
      description: "Alle dokumentierten Zugänge. Passwörter stehen in 1Password.",
    },
    {
      name: "No 2FA",
      type: "table",
      filter: { property: "2FA Enabled", checkbox: { equals: false } },
      description: "Sicherheitslücken — hier sollte 2FA nachgezogen werden.",
    },
    {
      name: "By Service",
      type: "board",
      groupByProperty: "Service",
      groupByType: "select",
    },
  ],

  /* ═══════════════════════════════════════════════════════ REQUIREMENTS */
  requirements: [
    { name: "All Requirements", type: "table" },
    {
      name: "Open Questions",
      type: "table",
      filter: {
        or: [
          { property: "Status", status: { equals: "Open Questions" } },
          { property: "Status", status: { equals: "In Clarification" } },
        ],
      },
    },
    {
      name: "Confirmed",
      type: "table",
      filter: { property: "Status", status: { equals: "Confirmed" } },
    },
  ],

  /* ═══════════════════════════════════════════════════ COMMUNICATION */
  communication: [
    { name: "Timeline", type: "table", sorts: [{ property: "Date", direction: "descending" }] },
    {
      name: "Follow Up",
      type: "table",
      filter: { property: "Follow Up", checkbox: { equals: true } },
      sorts: [{ property: "Follow Up Date", direction: "ascending" }],
    },
    { name: "Calendar", type: "calendar", dateProperty: "Date" },
  ],

  /* ═══════════════════════════════════════════════════════════════ IDEAS */
  ideas: [
    {
      name: "Inbox",
      type: "table",
      filter: { property: "Status", status: { equals: "Inbox" } },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    },
    {
      name: "By Status",
      type: "board",
      groupByProperty: "Status",
      groupByType: "status",
    },
    {
      name: "By Category",
      type: "board",
      groupByProperty: "Category",
      groupByType: "select",
    },
    { name: "All Ideas", type: "table" },
  ],

  /* ═══════════════════════════════════════════════════════════════ NOTES */
  notes: [
    { name: "Recent", type: "table", sorts: [{ timestamp: "created_time", direction: "descending" }] },
    {
      name: "By Type",
      type: "board",
      groupByProperty: "Type",
      groupByType: "select",
    },
    { name: "All Notes", type: "table" },
  ],

  /* ═══════════════════════════════════════════════════════════ KNOWLEDGE */
  knowledge: [
    {
      name: "By Category",
      type: "board",
      groupByProperty: "Category",
      groupByType: "select",
      filter: { property: "Status", status: { does_not_equal: "Archived" } },
    },
    {
      name: "Active",
      type: "table",
      filter: { property: "Status", status: { equals: "Active" } },
      sorts: [{ property: "Title", direction: "ascending" }],
    },
    { name: "All Knowledge", type: "table" },
  ],
};

/**
 * Baut den `configuration`-Block für eine View.
 * `propertyIds` bildet Property-Name -> Property-ID ab.
 */
export function buildViewConfiguration(view, propertyIds) {
  switch (view.type) {
    case "board": {
      const propertyId = propertyIds[view.groupByProperty];
      if (!propertyId) return null;
      const groupBy =
        view.groupByType === "status"
          ? { type: "status", property_id: propertyId, group_by: "group", sort: { type: "manual" } }
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
