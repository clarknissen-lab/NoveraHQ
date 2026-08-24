/**
 * Beispieldaten.
 *
 * Zweck: Nach dem ersten Lauf ist das HQ nicht leer. Die Ansichten „Heute“,
 * „Überfällig“ und „Domainverlängerungen“ zeigen sofort etwas, Rollups und
 * Fortschrittsbalken rechnen mit echten Werten.
 *
 * Die Daten bilden den kompletten Ablauf ab: ein offener Lead, ein gewonnener
 * Kunde mit Projekt, Website, Blueprint, Angebot, Hosting und Zugängen.
 *
 * Alles frei erfunden. Mit --no-seed bleibt das HQ leer.
 */

/** ISO-Datum relativ zu heute. `at` = "HH:MM" hängt eine Uhrzeit an. */
function tag(offset, at = null) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  if (at) {
    const [h, m] = at.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    // Lokale Zeit mit Offset, damit Notion die Uhrzeit nicht nach UTC schiebt.
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
  /* ── LEADS ──────────────────────────────────────────────────────── */
  leads: [
    {
      _ref: "gewonnen",
      Unternehmen: { title: "Muster GmbH" },
      Ansprechpartner: { rich_text: "A. Muster" },
      "E-Mail": { email: "kontakt@muster-beispiel.de" },
      Branche: { select: "Handwerk" },
      Standort: { rich_text: "Beispielstadt" },
      "Lead Score": { number: 9 },
      Priorität: { select: "Hoch" },
      Status: { status: "Gewonnen" },
      Quelle: { select: "Google Maps" },
      "Sales Angle": { rich_text: "Alte Seite ohne mobile Ansicht, kein Impressum, Ladezeit über 6 Sekunden." },
      "Letzter Kontakt": { date: tag(-24) },
      Notizen: { rich_text: "Aus diesem Lead ist der Musterkunde entstanden." },
    },
    {
      _ref: "offen",
      Unternehmen: { title: "Beispiel Bäckerei" },
      Ansprechpartner: { rich_text: "B. Beispiel" },
      "E-Mail": { email: "info@beispiel-baeckerei.de" },
      Branche: { select: "Gastronomie" },
      Standort: { rich_text: "Beispielstadt" },
      "Lead Score": { number: 7 },
      Priorität: { select: "Mittel" },
      Status: { status: "Follow-up" },
      Quelle: { select: "Instagram" },
      "Sales Angle": { rich_text: "Guter Instagram-Auftritt, aber gar keine Website." },
      "Letzter Kontakt": { date: tag(-6) },
      "Nächstes Follow-up": { date: tag(-1) },
      Notizen: { rich_text: "Follow-up ist überfällig — taucht in „Heute kontaktieren“ auf." },
    },
    {
      Unternehmen: { title: "Beispiel Physiotherapie" },
      "E-Mail": { email: "praxis@beispiel-physio.de" },
      Branche: { select: "Gesundheit" },
      Standort: { rich_text: "Nachbarstadt" },
      "Lead Score": { number: 6 },
      Priorität: { select: "Niedrig" },
      Status: { status: "Neuer Lead" },
      Quelle: { select: "Google Maps" },
      "Sales Angle": { rich_text: "Website von 2014, keine Online-Terminbuchung." },
    },
  ],

  /* ── KUNDEN ─────────────────────────────────────────────────────── */
  kunden: [
    {
      _ref: "muster",
      Firmenname: { title: "Muster GmbH" },
      Ansprechpartner: { rich_text: "A. Muster" },
      "E-Mail": { email: "kontakt@muster-beispiel.de" },
      Telefon: { phone_number: "+49 000 0000000" },
      Adresse: { rich_text: "Beispielweg 1, 12345 Beispielstadt" },
      Website: { url: "https://example.com" },
      Branche: { select: "Handwerk" },
      Standort: { rich_text: "Beispielstadt" },
      "Kunde seit": { date: tag(-21) },
      Status: { status: "Projekt läuft" },
      "Novera Care": { checkbox: true },
      "Novera Care · Monatlich": { number: 49 },
      "1Password Vault": { rich_text: "Kunden → Muster GmbH" },
      Lead: { relation: "leads:gewonnen" },
      Notizen: { rich_text: "Musterkunde. Zeigt, wie eine vollständige Kundenakte aussieht." },
    },
  ],

  /* ── PROJEKTE ───────────────────────────────────────────────────── */
  projekte: [
    {
      _ref: "relaunch",
      Projektname: { title: "Website Relaunch Muster GmbH" },
      Projekttyp: { select: "Website" },
      Status: { status: "Entwicklung" },
      Startdatum: { date: tag(-18) },
      Deadline: { date: tag(16) },
      Preis: { number: 2900 },
      Kunde: { relation: "kunden:muster" },
      Notizen: { rich_text: "Vier Seiten, dunkles Design, WhatsApp-Kontakt gewünscht." },
    },
  ],

  /* ── WEBSITES ───────────────────────────────────────────────────── */
  websites: [
    {
      _ref: "musterweb",
      Website: { title: "muster-beispiel.de" },
      Status: { status: "Entwicklung" },
      Domain: { rich_text: "muster-beispiel.de" },
      "Preview-URL": { url: "https://preview.example.com" },
      Branding: { url: "https://drive.google.com/drive/folders/beispiel-branding" },
      "SEO erledigt": { checkbox: false },
      Kunde: { relation: "kunden:muster" },
      Projekt: { relation: "projekte:relaunch" },
    },
  ],

  /* ── BLUEPRINTS ─────────────────────────────────────────────────── */
  blueprints: [
    {
      Blueprint: { title: "Muster GmbH · Blueprint" },
      Version: { select: "v3 · final" },
      Status: { status: "Freigegeben" },
      Kundenfreigabe: { checkbox: true },
      Freigabedatum: { date: tag(-9) },
      Website: { relation: "websites:musterweb" },
      Kunde: { relation: "kunden:muster" },
      Notizen: { rich_text: "Freigegeben nach zwei Änderungsrunden. Danach wurde gebaut." },
    },
  ],

  /* ── ANGEBOTE ───────────────────────────────────────────────────── */
  angebote: [
    {
      Angebotsname: { title: "Angebot Website Muster GmbH" },
      Websitepreis: { number: 2400 },
      Markenpaket: { number: 500 },
      "Novera Care · Monatlich": { number: 49 },
      Domain: { number: 0 },
      "Weitere Leistungen": { number: 0 },
      "Erstellt am": { date: tag(-26) },
      "Versendet am": { date: tag(-25) },
      "Gültig bis": { date: tag(4) },
      Status: { status: "Angenommen" },
      Kunde: { relation: "kunden:muster" },
      Projekt: { relation: "projekte:relaunch" },
      Lead: { relation: "leads:gewonnen" },
    },
    {
      Angebotsname: { title: "Angebot Website Beispiel Bäckerei" },
      Websitepreis: { number: 1800 },
      Markenpaket: { number: 0 },
      "Novera Care · Monatlich": { number: 39 },
      Domain: { number: 15 },
      "Weitere Leistungen": { number: 0 },
      "Erstellt am": { date: tag(-4) },
      "Versendet am": { date: tag(-3) },
      "Gültig bis": { date: tag(11) },
      Status: { status: "Versendet" },
      Lead: { relation: "leads:offen" },
      Notizen: { rich_text: "Angebot an einen Lead, noch kein Kunde — genau dafür ist die Lead-Relation da." },
    },
  ],

  /* ── AUFGABEN ───────────────────────────────────────────────────── */
  aufgaben: [
    {
      Aufgabe: { title: "Startseite fertigstellen" },
      Kategorie: { select: "Entwicklung" },
      Priorität: { select: "Hoch" },
      Status: { status: "In Arbeit" },
      Deadline: { date: tag(0, "10:00") },
      Kunde: { relation: "kunden:muster" },
      Projekt: { relation: "projekte:relaunch" },
    },
    {
      Aufgabe: { title: "Bei Beispiel Bäckerei nachfassen" },
      Kategorie: { select: "Sales" },
      Priorität: { select: "Hoch" },
      Status: { status: "Offen" },
      Deadline: { date: tag(0, "14:00") },
    },
    {
      Aufgabe: { title: "Bilder vom Kunden anfordern" },
      Kategorie: { select: "Kunde" },
      Priorität: { select: "Hoch" },
      Status: { status: "Wartet auf Kunde" },
      Deadline: { date: tag(-3) },
      Kunde: { relation: "kunden:muster" },
      Projekt: { relation: "projekte:relaunch" },
      Notiz: { rich_text: "Überfällig — zeigt, wie die Ansicht „Überfällig“ arbeitet." },
    },
    {
      Aufgabe: { title: "Kontaktformular testen" },
      Kategorie: { select: "Entwicklung" },
      Priorität: { select: "Mittel" },
      Status: { status: "Offen" },
      Deadline: { date: tag(3) },
      Projekt: { relation: "projekte:relaunch" },
    },
    {
      Aufgabe: { title: "Meta Titles und Descriptions schreiben" },
      Kategorie: { select: "SEO" },
      Priorität: { select: "Mittel" },
      Status: { status: "Offen" },
      Deadline: { date: tag(6) },
      Projekt: { relation: "projekte:relaunch" },
    },
    {
      Aufgabe: { title: "Impressum und Datenschutz prüfen" },
      Kategorie: { select: "Admin" },
      Priorität: { select: "Niedrig" },
      Status: { status: "Offen" },
      Deadline: { date: tag(9) },
      Projekt: { relation: "projekte:relaunch" },
    },
    {
      Aufgabe: { title: "Blueprint mit Kunde abgestimmt" },
      Kategorie: { select: "Design" },
      Priorität: { select: "Hoch" },
      Status: { status: "Erledigt" },
      Deadline: { date: tag(-9) },
      Kunde: { relation: "kunden:muster" },
      Projekt: { relation: "projekte:relaunch" },
    },
    {
      Aufgabe: { title: "Seitenstruktur festgelegt" },
      Kategorie: { select: "Design" },
      Priorität: { select: "Mittel" },
      Status: { status: "Erledigt" },
      Deadline: { date: tag(-14) },
      Projekt: { relation: "projekte:relaunch" },
    },
    {
      Aufgabe: { title: "Domainverlängerungen prüfen" },
      Kategorie: { select: "Technik" },
      Priorität: { select: "Mittel" },
      Status: { status: "Offen" },
      Deadline: { date: tag(12) },
      Wiederkehrend: { select: "Monatlich" },
    },
  ],

  /* ── HOSTING & DOMAINS ──────────────────────────────────────────── */
  hosting: [
    {
      Eintrag: { title: "Muster GmbH · muster-beispiel.de" },
      Hostinganbieter: { select: "Hostinger" },
      Tarif: { rich_text: "Premium Web Hosting" },
      "Monatliche Kosten": { number: 3.99 },
      Domain: { rich_text: "muster-beispiel.de" },
      Registrar: { select: "Hostinger" },
      Domainstatus: { status: "Aktiv" },
      Ablaufdatum: { date: tag(21) },
      SSL: { checkbox: true },
      Backup: { checkbox: true },
      "Monatlicher Kundenpreis": { number: 49 },
      Kunde: { relation: "kunden:muster" },
      Website: { relation: "websites:musterweb" },
      Notiz: { rich_text: "Läuft in drei Wochen ab — steht in „Domainverlängerungen“." },
    },
  ],

  /* ── ZUGÄNGE ────────────────────────────────────────────────────── */
  zugaenge: [
    {
      Eintrag: { title: "Muster GmbH · Hostinger" },
      Service: { select: "Hostinger" },
      "Benutzername / E-Mail": { rich_text: "kontakt@muster-beispiel.de" },
      "1Password-Eintrag": { rich_text: "Kunden → Muster GmbH → Hostinger" },
      URL: { url: "https://hpanel.hostinger.com" },
      Zweck: { rich_text: "Hosting und Domain verwalten" },
      Status: { select: "Aktiv" },
      "2FA aktiv": { checkbox: true },
      Kunde: { relation: "kunden:muster" },
    },
    {
      Eintrag: { title: "Muster GmbH · Google Business" },
      Service: { select: "Google Business" },
      "Benutzername / E-Mail": { rich_text: "kontakt@muster-beispiel.de" },
      "1Password-Eintrag": { rich_text: "Kunden → Muster GmbH → Google Business" },
      URL: { url: "https://business.google.com" },
      Zweck: { rich_text: "Unternehmensprofil, Bewertungen, lokale SEO" },
      Status: { select: "Aktiv" },
      "2FA aktiv": { checkbox: false },
      Kunde: { relation: "kunden:muster" },
      Notiz: { rich_text: "2FA fehlt noch — taucht in „Ohne 2FA“ auf." },
    },
  ],
};

/** Anlegereihenfolge — Relations zeigen immer auf bereits Angelegtes. */
export const SEED_ORDER = [
  "leads", "kunden", "projekte", "websites", "blueprints",
  "angebote", "aufgaben", "hosting", "zugaenge",
];
