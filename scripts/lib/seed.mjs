/**
 * Beispieldaten.
 *
 * Zweck: Nach dem ersten Lauf ist das System nicht leer. Ansichten wie "Today"
 * und "Overdue" zeigen sofort etwas, Rollups und der Fortschrittsbalken rechnen
 * mit echten Werten — sonst sieht alles kaputt aus, obwohl es funktioniert.
 *
 * Die Daten sind frei erfunden. Mit `--no-seed` bleibt der Workspace leer.
 * Der Musterkunde dient außerdem als Vorlage für das Kundenakten-Template.
 */

/** ISO-Datum relativ zu heute. `at` = "HH:MM" hängt eine Uhrzeit an. */
function day(offset, at = null) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  if (at) {
    const [h, m] = at.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    // Lokale Zeit mit Offset, damit Notion die Uhrzeit nicht nach UTC verschiebt.
    const tz = -d.getTimezoneOffset();
    const sign = tz >= 0 ? "+" : "-";
    const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}:00` +
      `${sign}${pad(tz / 60)}:${pad(tz % 60)}`
    );
  }
  return d.toISOString().slice(0, 10);
}

export const SEED = {
  clients: [
    {
      _ref: "muster",
      "Client Name": { title: "Muster GmbH" },
      Company: { rich_text: "Muster GmbH" },
      "Contact Person": { rich_text: "A. Muster" },
      Email: { email: "kontakt@muster-beispiel.de" },
      Phone: { phone_number: "+49 000 0000000" },
      Status: { status: "Active" },
      "Client Since": { date: day(-120) },
      "Last Contact": { date: day(-3) },
      "Next Contact": { date: day(4) },
      Website: { url: "https://example.com" },
      "1Password Vault": { rich_text: "Clients → Muster GmbH" },
      Notes: { rich_text: "Beispielkunde. Zeigt, wie eine vollständige Kundenakte aussieht." },
    },
    {
      _ref: "handwerk",
      "Client Name": { title: "Beispiel Handwerk" },
      Company: { rich_text: "Beispiel Handwerk e.K." },
      "Contact Person": { rich_text: "B. Beispiel" },
      Email: { email: "info@beispiel-handwerk.de" },
      Status: { status: "Lead" },
      "Next Contact": { date: day(-1) },
      Notes: { rich_text: "Lead über Empfehlung. Erstgespräch steht aus." },
    },
  ],

  projects: [
    {
      _ref: "relaunch",
      "Project Name": { title: "Website Relaunch" },
      Status: { status: "Active" },
      Priority: { select: "High" },
      "Start Date": { date: day(-21) },
      Deadline: { date: day(18) },
      Client: { relation: "clients:muster" },
      Notes: { rich_text: "Kompletter Relaunch: neue Struktur, dunkles Design, WhatsApp-Kontakt." },
    },
  ],

  tasks: [
    {
      "Task Name": { title: "Kundenmeeting Muster GmbH" },
      Status: { status: "To Do" },
      Priority: { select: "High" },
      "Due Date": { date: day(0, "09:00") },
      Category: { select: "Client" },
      Client: { relation: "clients:muster" },
      Project: { relation: "projects:relaunch" },
    },
    {
      "Task Name": { title: "Startseite überarbeiten" },
      Status: { status: "In Progress" },
      Priority: { select: "High" },
      "Due Date": { date: day(0, "10:30") },
      Category: { select: "Website" },
      Client: { relation: "clients:muster" },
      Project: { relation: "projects:relaunch" },
    },
    {
      "Task Name": { title: "Angebot für Beispiel Handwerk erstellen" },
      Status: { status: "To Do" },
      Priority: { select: "Medium" },
      "Due Date": { date: day(0, "13:00") },
      Category: { select: "Sales" },
      Client: { relation: "clients:handwerk" },
    },
    {
      "Task Name": { title: "Rechnung 2026-014 verschicken" },
      Status: { status: "To Do" },
      Priority: { select: "Medium" },
      "Due Date": { date: day(0, "15:30") },
      Category: { select: "Finance" },
      Client: { relation: "clients:muster" },
    },
    {
      "Task Name": { title: "Bilder vom Kunden nachfassen" },
      Status: { status: "Waiting" },
      Priority: { select: "High" },
      "Due Date": { date: day(-2) },
      Category: { select: "Client" },
      Client: { relation: "clients:muster" },
      Project: { relation: "projects:relaunch" },
      Notes: { rich_text: "Überfällig — zeigt, wie die Ansicht „Overdue“ arbeitet." },
    },
    {
      "Task Name": { title: "Kontaktformular testen" },
      Status: { status: "To Do" },
      Priority: { select: "Medium" },
      "Due Date": { date: day(2) },
      Category: { select: "Website" },
      Project: { relation: "projects:relaunch" },
    },
    {
      "Task Name": { title: "Impressum und Datenschutz prüfen" },
      Status: { status: "To Do" },
      Priority: { select: "Low" },
      "Due Date": { date: day(5) },
      Category: { select: "Admin" },
      Project: { relation: "projects:relaunch" },
    },
    {
      "Task Name": { title: "Struktur und Seitenbaum abgestimmt" },
      Status: { status: "Done" },
      Priority: { select: "Medium" },
      "Due Date": { date: day(-14) },
      "Completed Date": { date: day(-14) },
      Category: { select: "Project" },
      Project: { relation: "projects:relaunch" },
    },
    {
      "Task Name": { title: "Designentwurf abgenommen" },
      Status: { status: "Done" },
      Priority: { select: "High" },
      "Due Date": { date: day(-7) },
      "Completed Date": { date: day(-7) },
      Category: { select: "Project" },
      Project: { relation: "projects:relaunch" },
    },
    {
      "Task Name": { title: "Novera Website: Referenzen ergänzen" },
      Status: { status: "Inbox" },
      Category: { select: "Marketing" },
    },
  ],

  invoices: [
    {
      "Invoice Number": { title: "2026-013" },
      Amount: { number: 2400 },
      Date: { date: day(-30) },
      "Due Date": { date: day(-16) },
      Status: { status: "Paid" },
      Client: { relation: "clients:muster" },
      Project: { relation: "projects:relaunch" },
      Notes: { rich_text: "Anzahlung Relaunch." },
    },
    {
      "Invoice Number": { title: "2026-014" },
      Amount: { number: 1800 },
      Date: { date: day(-6) },
      "Due Date": { date: day(8) },
      Status: { status: "Sent" },
      Client: { relation: "clients:muster" },
      Project: { relation: "projects:relaunch" },
      Notes: { rich_text: "Zwischenrechnung. Erstellt in Papierkram." },
    },
  ],

  expenses: [
    {
      Expense: { title: "Hosting" },
      Provider: { rich_text: "Hostinger" },
      Category: { select: "Hosting" },
      Amount: { number: 14.99 },
      Date: { date: day(-12) },
      Recurring: { select: "Monthly" },
      Project: { relation: "projects:relaunch" },
    },
    {
      Expense: { title: "Design-Software" },
      Provider: { rich_text: "Figma" },
      Category: { select: "Software" },
      Amount: { number: 15 },
      Date: { date: day(-9) },
      Recurring: { select: "Monthly" },
    },
  ],

  access: [
    {
      "Access Entry": { title: "Muster GmbH — Hostinger" },
      Service: { select: "Hostinger" },
      "Username / Email": { rich_text: "kontakt@muster-beispiel.de" },
      "Login URL": { url: "https://hpanel.hostinger.com" },
      "Account Owner": { select: "Client" },
      "2FA Enabled": { checkbox: true },
      "Password Manager Reference": { rich_text: "1Password → Clients → Muster GmbH → Hostinger" },
      Client: { relation: "clients:muster" },
    },
    {
      "Access Entry": { title: "Muster GmbH — WordPress" },
      Service: { select: "WordPress" },
      "Username / Email": { rich_text: "novera" },
      "Login URL": { url: "https://example.com/wp-admin" },
      "Account Owner": { select: "Novera Studio" },
      "2FA Enabled": { checkbox: false },
      "Password Manager Reference": { rich_text: "1Password → Clients → Muster GmbH → WordPress" },
      Client: { relation: "clients:muster" },
      Notes: { rich_text: "2FA fehlt noch — taucht in der Ansicht „No 2FA“ auf." },
    },
    {
      "Access Entry": { title: "Muster GmbH — Google Business" },
      Service: { select: "Google Business" },
      "Username / Email": { rich_text: "kontakt@muster-beispiel.de" },
      "Login URL": { url: "https://business.google.com" },
      "Account Owner": { select: "Client" },
      "2FA Enabled": { checkbox: true },
      "Password Manager Reference": { rich_text: "1Password → Clients → Muster GmbH → Google Business" },
      Client: { relation: "clients:muster" },
    },
  ],

  requirements: [
    {
      "Requirement Set": { title: "Muster GmbH — Website Relaunch" },
      Status: { status: "Confirmed" },
      "Pages Wanted": { multi_select: ["Home", "Services", "About", "Contact", "Legal / Impressum"] },
      Style: { multi_select: ["Modern", "Dark", "Minimal"] },
      Features: { multi_select: ["Contact Form", "WhatsApp Button", "Google Maps", "Social Media Links"] },
      Colors: { rich_text: "Anthrazit als Basis, ein warmer Akzent. Keine kräftigen Flächen." },
      Logo: { select: "Provided" },
      "Texts By": { select: "Client" },
      "Images By": { select: "Photographer" },
      "SEO Wishes": { rich_text: "Lokale Suche in der Region, Fokus auf die drei Hauptleistungen." },
      "Mobile Requirements": { rich_text: "Mobil zuerst. Telefonnummer und WhatsApp dauerhaft erreichbar." },
      "Reference Websites": { rich_text: "example.com — wegen Ruhe und Typografie." },
      "NOT Wanted": { rich_text: "Keine Animationen. Kein Slider. Kein Cookie-Banner mit Tracking." },
      "Special Requests": { rich_text: "Öffnungszeiten sollen ohne Entwickler änderbar sein." },
      Deadline: { date: day(18) },
      Client: { relation: "clients:muster" },
      Project: { relation: "projects:relaunch" },
    },
  ],

  communication: [
    {
      Entry: { title: "Kickoff Relaunch" },
      Date: { date: day(-21) },
      Channel: { select: "Meeting" },
      Summary: { rich_text: "Umfang abgestimmt: vier Seiten, dunkles Design, WhatsApp-Kontakt. Texte kommen vom Kunden." },
      Client: { relation: "clients:muster" },
      Project: { relation: "projects:relaunch" },
    },
    {
      Entry: { title: "Rückmeldung zum Entwurf" },
      Date: { date: day(-3) },
      Channel: { select: "Call" },
      Summary: { rich_text: "Entwurf abgenommen. Zusätzliche Leistungsseite gewünscht. Bilder folgen." },
      "Follow Up": { checkbox: true },
      "Follow Up Date": { date: day(4) },
      Client: { relation: "clients:muster" },
      Project: { relation: "projects:relaunch" },
    },
  ],

  ideas: [
    {
      Idea: { title: "Website-Paket mit festem Preis anbieten" },
      Category: { select: "Service" },
      Status: { status: "Thinking" },
      Priority: { select: "High" },
      Notes: { rich_text: "Vier Seiten, feste Leistungen, klarer Preis. Verkürzt die Angebotsphase." },
    },
    {
      Idea: { title: "Onboarding-Fragebogen als Formular" },
      Category: { select: "Automation" },
      Status: { status: "Inbox" },
      Priority: { select: "Medium" },
      Notes: { rich_text: "Der Fragenkatalog aus der Kundenakte als Notion-Formular." },
    },
  ],

  notes: [
    {
      Note: { title: "Angebotsphase dauert zu lang" },
      Type: { select: "Decision" },
      Date: { date: day(-5) },
      Content: { rich_text: "Zwischen Erstgespräch und Angebot vergehen zu viele Tage. Festpreis-Paket würde das lösen." },
    },
  ],
};

/** Alle Datenbank-Keys, für die es Beispieldaten gibt — in Anlegereihenfolge. */
export const SEED_ORDER = [
  "clients", "projects", "tasks", "invoices", "expenses",
  "access", "requirements", "communication", "ideas", "notes",
];
