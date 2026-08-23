# Qualitätskontrolle

Jeder Punkt aus deiner Anforderungsliste (Abschnitt 32) mit dem Ort, an dem er
im System sitzt.

Legende: **automatisch** = der Builder legt es an · **manuell** = ein Schritt aus
[MANUELL-EINZURICHTEN.md](MANUELL-EINZURICHTEN.md)

---

## Verknüpfungen

| Frage | Antwort | Wo |
|---|---|---|
| Sind alle Datenbanken miteinander verbunden? | Ja — 15 Relationspaare | automatisch |
| Kann ein Kunde mehrere Projekte haben? | Ja | `Clients → Projects` |
| Kann ein Projekt mehrere Tasks haben? | Ja | `Projects → Tasks` |
| Können Tasks Kunde **und** Projekt haben? | Ja, beides gleichzeitig | `Tasks → Client`, `Tasks → Project` |
| Können mehrere Zugänge pro Kunde existieren? | Ja, beliebig viele | `Clients → Access` |

Alle 15 Paare werden bei jedem `npm run verify` geprüft.

```
Projects        → Clients            Client ↔ Projects
Tasks           → Clients            Client ↔ Tasks
Tasks           → Projects           Project ↔ Tasks
Invoices        → Clients            Client ↔ Invoices
Invoices        → Projects           Project ↔ Invoices
Expenses        → Projects           Project ↔ Expenses
Client Access   → Clients            Client ↔ Access
Requirements    → Clients            Client ↔ Website Requirements
Requirements    → Projects           Project ↔ Website Requirements
Communication   → Clients            Client ↔ Communication
Communication   → Projects           Project ↔ Client Communication
Ideas           → Projects           Idea ↔ Project
Notes           → Clients            Client ↔ Notes
Notes           → Projects           Project ↔ Notes
Notes           → Tasks              Task ↔ Notes
```

---

## Sicherheit

| Frage | Antwort |
|---|---|
| Sind Passwörter **nicht** im Klartext in Notion? | Ja. Die Property `Password` in **Client Access** ist eine feste Formel mit `🔐 Stored in 1Password` und lässt sich nicht überschreiben — auch nicht versehentlich. |
| Gibt es 1Password-Verweise? | Ja. Property `Password Manager Reference` je Zugang, `1Password Vault` je Kunde, Struktur in [1PASSWORD.md](1PASSWORD.md) |
| Wird die Übergabe von Zugängen geregelt? | Ja, **Knowledge → Zugänge sicher übernehmen** |
| Fallen fehlende 2FA auf? | Ja, Ansicht **Client Access → No 2FA** |

---

## Dashboard

| Frage | Antwort | Art |
|---|---|---|
| Gibt es Datum und Uhrzeit? | Ja, live im Header | automatisch, Widget-URL nötig |
| Gibt es Today? | Ja, mit High Priority und Schedule | manuell, Schritt 1 |
| Gibt es Overdue? | Ja | manuell, Schritt 1 |
| Gibt es Active Projects? | Ja, mit Fortschrittsbalken | manuell, Schritt 1 |
| Gibt es Business-KPIs? | Ja, 7 Kacheln | manuell, Schritt 3 |
| Gibt es Quick Actions? | Ja, 8 Stück | automatisch (als Button: Schritt 5) |
| Gibt es Spotify? | Ja | automatisch, Playlist-URL nötig |
| Funktioniert die Navigation logisch? | Ja, Sidebar plus Navigationsblock am Seitenende | automatisch |
| Ist es auf Mobile brauchbar? | Ja, Reihenfolge folgt der Mobile-Priorität | automatisch |

---

## Kundenakte

| Frage | Antwort | Art |
|---|---|---|
| Gibt es Website Requirements? | Ja, eigene Datenbank mit 16 Feldern plus Fragenkatalog | automatisch |
| Gibt es Client Notes? | Ja, `Notes` mit Kundenbezug | automatisch |
| Gibt es Client Communication? | Ja, eigene Datenbank mit Datum, Kanal, Follow-up | automatisch |
| Gibt es Google-Drive-Links? | Ja, bei Kunde und Projekt | automatisch |
| Öffnet sich beim Kunden die komplette Akte? | Ja, über die Vorlage `Kundenakte` | manuell, Schritt 2a |

Die Kundenakte enthält: Overview, Projects, Tasks, Website Requirements,
Communication, Access, Finance, Files, Notes.

---

## Verbindungen nach außen

| Frage | Antwort |
|---|---|
| Gibt es Google-Workspace-Links? | Ja — 9 Dienste, auf eigener Seite und im HQ-Navigationsblock |
| Gibt es Papierkram-Links? | Ja — auf `Business Tools`, auf `Finance` und als Property je Rechnung und Ausgabe |
| Gibt es 1Password-Verweise? | Ja — siehe Sicherheit |
| Bleibt Google Calendar die Terminquelle? | Ja. Notion legt bewusst keinen zweiten Kalender an. |

---

## Keine doppelte Datenpflege

Der Anspruch aus Abschnitt 27 — jede Information hat genau einen Ort:

| Information | Einziger Ort | Wo sie sonst noch auftaucht |
|---|---|---|
| Aufgabe | `Tasks` | über Relations bei Kunde und Projekt |
| Kundenstammdaten | `Clients` | über Relations überall sonst |
| Umsatz | `Invoices` | als Rollup bei Kunde und Projekt |
| Projektfortschritt | ergibt sich aus `Tasks` | Rollup `Progress`, Balken auf dem Dashboard |
| Termine | Google Calendar | eingebettet im HQ und auf `Calendar` |
| Dateien | Google Drive | verlinkt bei Kunde und Projekt |
| Buchhaltung | Papierkram | Status gespiegelt in `Invoices` |
| Passwörter | 1Password | in Notion nur als Verweis |

Drei Stellen, an denen bewusst **nicht** doppelt gepflegt wird:

- **Kein zweites Datumsfeld „Time“.** `Due Date` enthält die Uhrzeit; die Spalte
  `Time` ist eine Formel, die sie herausliest. Ein Termin, ein Feld.
- **Kein Notion-Kalender neben Google Calendar.** Nur Deadlines aus Notion
  ergänzen die Ansicht — die stehen ohnehin nur hier.
- **Kein Feld „Progress“ zum Eintragen.** Der Fortschritt ergibt sich aus den
  abgehakten Tasks.

---

## Was der Prüflauf abdeckt

`npm run verify` fährt den kompletten Aufbau gegen einen nachgebauten
Notion-Server und prüft:

- alle 11 Datenbanken entstehen unter der richtigen Elternseite
- alle 15 Relationspaare existieren auf **beiden** Seiten
- kein Relationspaar wird doppelt angelegt
- jedes Rollup findet die Relation und die Property, die es liest
- jeder Ansichtsfilter passt zum tatsächlichen Property-Typ
- jede Board-, Kalender- und Timeline-Ansicht hat ihre Gruppierungs-/Datumsspalte
- kein Block überschreitet die Notion-Limits (100 Blöcke pro Request, 2000 Zeichen)
- jede Spaltengruppe hat mindestens zwei Spalten
- die Beispieldaten sind tatsächlich verknüpft und nicht nur angelegt

Bei jeder Änderung am Schema laufen lassen. Er braucht weder Token noch Internet.

---

## Bekannte Grenzen

Vier Dinge kann Notion nicht — unabhängig davon, wie man es aufbaut:

1. **Keine Uhr, die von selbst weiterläuft.** Notion rendert Seiten nur bei
   Interaktion neu. Gelöst über ein eingebettetes Widget, das im Browser läuft.
2. **Keine seitenübergreifende Rechnung.** Summen entstehen nur in der
   Summenzeile einer Ansicht. Deshalb ist *Profit* keine automatische Zahl.
3. **Rollups können nicht filtern.** Ein Rollup „Summe aller **bezahlten**
   Rechnungen“ gibt es nicht. Gelöst über Hilfsformeln in `Invoices`
   (`Amount Paid`, `Amount Open`), die je Status 0 oder den Betrag liefern.
4. **Spotify spielt nur Vorschauen**, außer du bist im selben Browser bei
   Spotify Premium angemeldet. Vorgabe von Spotify, nicht von Notion.
