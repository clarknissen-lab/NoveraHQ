# MANUELL EINZURICHTEN

Alles, was der Builder **nicht** anlegen kann — mit dem Grund, dem Ort und dem
genauen Handgriff.

Einmalig etwa 30 Minuten. Danach läuft das System von allein.

Im Workspace erkennst du jede offene Stelle an einem orangen Kasten mit 🔧.
Wenn du ihn abgearbeitet hast, löschst du ihn.

**Übersicht**

| # | Was | Warum nicht automatisch | Dauer |
|---|---|---|---|
| 1 | Verknüpfte Ansichten (15×) | Kein API-Blocktyp dafür | ~12 min |
| 2 | Datenbank-Templates (2×) | API kann keine Templates schreiben | ~10 min |
| 3 | KPI-Zahlen | Ergeben sich aus Ansicht 1 | ~4 min |
| 4 | Google Calendar | Einbettungs-URL ist privat | ~2 min |
| 5 | Quick Actions als Buttons | Button-Blöcke fehlen in der API | ~5 min, optional |
| 6 | Sidebar und Mobile | Reine Anzeigeeinstellung | ~3 min |

---

## 1 — Verknüpfte Ansichten

### Warum das nicht automatisch geht

Eine „Linked view of database“ ist in Notion **kein Block, den die API kennt**.
Die API kann Absätze, Überschriften, Spalten, Callouts, Embeds und Verweise
anlegen — aber es existiert schlicht kein Blocktyp für eine eingebettete,
gefilterte Datenbankansicht. Notion hat das nie geöffnet.

Was der Builder deshalb tut: Er legt **alle 50 Ansichten in den Datenbanken
selbst** an — fertig gefiltert und sortiert. Du musst also nichts konfigurieren.
Du zeigst nur noch, wo welche Ansicht erscheinen soll. Das sind drei Klicks pro Stelle.

### Der Handgriff — einmal verstehen, 15× anwenden

1. In den orangen Kasten klicken, Inhalt markieren, löschen
2. `/linked` tippen → **Linked view of database** wählen
3. Datenbank suchen und auswählen
4. Oben erscheint eine Ansicht-Auswahl → die im Kasten genannte Ansicht wählen
5. Bei Bedarf **•••** → **Properties** → Spalten ein-/ausblenden

> Wähle immer eine **vorhandene Ansicht** aus, statt neu zu filtern.
> Änderst du später den Filter in der Datenbank, ziehen alle Einbettungen mit.

### Die Stellen

**Auf `NOVERA STUDIO` (HQ) — 9 Stück**

| Abschnitt | Datenbank | Ansicht | Spalten |
|---|---|---|---|
| Today → High Priority | Tasks | `High Priority` | Task Name, Due Date, Client |
| Today → Today's Schedule | Tasks | `Today` | Time, Task Name, Client, Project |
| Overdue | Tasks | `Overdue` | Task Name, Due Date, Client |
| Next | Tasks | `Upcoming` | Task Name, Due Date, Project |
| Active Projects | Projects | `Active` | Project Name, Client, Deadline, Progress Bar, Open Tasks |
| Clients → Active Clients | Clients | `Active Clients` | Client Name, Status, Next Contact, Revenue |
| Clients → Client Access | Clients | `Active Clients` | Client Name, Access Entries |
| Notes & Ideas → Recent Notes | Notes | `Recent` | Note, Date |
| Notes & Ideas → Idea Inbox | Ideas | `Inbox` | Idea, Category |

Bei den ersten vier lohnt **•••** → **Limit** → `5` — sonst wird das Dashboard lang.

**Auf `Finance` — 4 Stück**

| Abschnitt | Datenbank | Ansicht |
|---|---|---|
| Open Invoices | Invoices | `Open` |
| Overdue Invoices | Invoices | `Overdue` |
| Paid | Invoices | `Paid` |
| Expenses | Expenses | `This Month` |

**Auf `Calendar` — 2 Stück**

| Abschnitt | Datenbank | Ansicht |
|---|---|---|
| Deadlines aus Notion | Projects | `Deadlines` |
| Task-Kalender | Tasks | `Calendar` |

---

## 2 — Datenbank-Templates

### Warum das nicht automatisch geht

Notion-Datenbanken haben Seitenvorlagen: ein neuer Kunde bringt sofort die
Kundenakte mit. Die API kann Vorlagen **lesen** (`listTemplates`), aber nicht
**schreiben**. Es gibt keinen Endpunkt dafür.

Was der Builder deshalb tut: Er hat den **Musterkunden** und das **Musterprojekt**
mit genau dem Seitenaufbau angelegt, den die Vorlage haben soll. Du machst daraus
in einem Zug eine echte Vorlage.

### 2a — Kundenakte

1. **Clients** öffnen, **Muster GmbH** öffnen
2. Klick in den Seitenkörper, `Cmd/Strg + A`, `Cmd/Strg + C`
3. Zurück zu **Clients**. Neben dem blauen **New** auf den **▾** klicken
4. **＋ New template**
5. Vorlage benennen: `Kundenakte`
6. In den Körper klicken, `Cmd/Strg + V`
7. Die sieben 🔧-Kästen jetzt durch verknüpfte Ansichten ersetzen (Handgriff aus Schritt 1):

   | Abschnitt | Datenbank | Filter |
   |---|---|---|
   | 🚀 Projects | Projects | `Client` enthält → *leer lassen* |
   | 📋 Tasks | Tasks | `Client` enthält → *leer lassen*, `Status` ist nicht `Done` |
   | 🌐 Website Requirements | Website Requirements | `Client` enthält → *leer lassen* |
   | 💬 Communication | Client Communication | `Client` enthält → *leer lassen*, sortiert `Date` absteigend |
   | 🔐 Access | Client Access | `Client` enthält → *leer lassen* |
   | 💰 Finance | Invoices | `Client` enthält → *leer lassen* |
   | 📝 Notes | Notes | `Client` enthält → *leer lassen* |

   > **Der entscheidende Punkt:** Beim Filter `Client enthält` erscheint in einer
   > Vorlage die Option **„Diese Seite“ / „This page“**. Die wählen. Dann füllt
   > sich jede neue Kundenakte automatisch mit den Daten genau dieses Kunden.
   > Wählst du stattdessen einen konkreten Kunden aus, zeigen alle Akten dessen Daten.

8. Oben links **← Back**
9. Bei der Vorlage auf **•••** → **Set as default** → **For all users**

Ab jetzt bringt jeder neue Kunde die komplette Akte mit.

### 2b — Projektseite

Dasselbe mit **Website Relaunch** in **Projects**, Vorlage `Projektseite`,
vier 🔧-Kästen, Filter jeweils auf `Project` enthält → **Diese Seite**.

### 2c — Optional: Task-Vorlagen

In **Tasks** lohnen zwei Vorlagen für Wiederkehrendes:

- `Kundenmeeting` — Category `Client`, Priority `Medium`, im Körper eine Agenda
- `Website-Livegang` — Category `Website`, im Körper die Launch-Checkliste aus
  **Knowledge → Website Launch Checklist**

---

## 3 — KPI-Zahlen

### Warum das nicht automatisch geht

Notion kann eine Zahl nicht frei auf einer Seite berechnen. Summen entstehen
ausschließlich in der **Summenzeile einer Datenbankansicht**. Und die braucht
eine verknüpfte Ansicht — siehe Schritt 1.

### Der Handgriff

Für jede Kachel im Abschnitt **Business** auf dem HQ:

1. Verknüpfte Ansicht in die Kachel einfügen
2. **•••** → **Properties** → alles ausblenden bis auf die eine Spalte
3. Ganz unten in der Spalte auf **Calculate** klicken → Funktion wählen
4. **•••** → **Layout** → **Show database title** aus, **Show view options** aus

| Kachel | Datenbank | Ansicht | Spalte | Calculate |
|---|---|---|---|---|
| Revenue | Invoices | `Paid` | Amount Paid | `Sum` |
| Expenses | Expenses | `This Month` | Amount | `Sum` |
| Open Invoices | Invoices | `Open` | Amount Open | `Sum` |
| Active Clients | Clients | `Active Clients` | beliebig | `Count all` |
| Active Projects | Projects | `Active` | beliebig | `Count all` |
| Leads | Clients | `Leads` | beliebig | `Count all` |
| Open Tasks | Tasks | `Upcoming` | beliebig | `Count all` |

**Profit** rechnet Notion seitenübergreifend nicht. Zwei Wege:

- **Pragmatisch:** Revenue und Expenses stehen direkt nebeneinander — die
  Differenz liest man im Vorbeigehen.
- **Belastbar:** Papierkram. Dort ist die Zahl ohnehin die einzige, die zählt,
  weil sie Steuer und Abgrenzung berücksichtigt.

---

## 4 — Google Calendar

### Warum das nicht automatisch geht

Die Einbettungs-URL enthält deine private Kalender-ID. Die steht nirgends im Repo
und kann auch nirgends stehen.

### Der Handgriff

1. [calendar.google.com](https://calendar.google.com) → **⚙ Einstellungen**
2. Links den gewünschten Kalender wählen → **Kalender integrieren**
3. Unter **Code einbetten** die URL aus dem `src="…"` des iframes kopieren
4. Entweder:
   - `NOVERA_GCAL_EMBED_URL` setzen und `npm run build` erneut laufen lassen, **oder**
   - im HQ in den orangen Kasten `/embed` tippen, URL einfügen, **Embed link**

Für Dark Mode `&mode=AGENDA&showTitle=0&showPrint=0&showTabs=0` anhängen — die
Agenda-Ansicht fügt sich deutlich ruhiger ein als das Monatsraster.

> **Privater Kalender:** Nur ein Kalender, der auf *öffentlich* steht, ist im
> Embed für andere sichtbar. Für dich allein reicht es, im selben Browser in
> deinem Google-Konto angemeldet zu sein. Stelle einen Geschäftskalender nicht
> öffentlich, nur damit das Embed hübscher aussieht.

---

## 5 — Quick Actions als echte Buttons *(optional)*

### Warum das nicht automatisch geht

Notion-Buttons sind ein eigener Blocktyp, den die API nicht anlegen kann — sie
kennt nur die *Button-Property* innerhalb einer Datenbank, was etwas anderes ist.

Aktuell führt jede Quick Action zur Datenbank; dort legst du mit **New** an.
Das kostet einen Klick mehr. Mit einem echten Button geht es in einem.

### Der Handgriff — Beispiel „New Task“

1. Im HQ auf die Kachel **New Task** klicken, Inhalt löschen
2. `/button` → **Button**
3. Beschriftung: `New Task`
4. **Add action** → **Add page to** → Datenbank **Tasks**
5. **Edit page** → Vorbelegung setzen, z.B. `Status` = `Inbox`
6. **Done**

Lohnt sich vor allem für **New Task** und **New Note** — die beiden legst du am
häufigsten an. Für den Rest genügt der Link.

---

## 6 — Sidebar und Mobile

### Sidebar

Die Struktur steht bereits: alle Seiten hängen unter `NOVERA STUDIO`. Was du noch
tun kannst:

1. `NOVERA STUDIO` in der Seitenleiste mit **•••** → **Add to Favorites** —
   dann steht es ganz oben
2. Reihenfolge per Drag & Drop: Tasks, Projects, Clients, Client Records,
   Calendar, Finance, Ideas, Knowledge, Notes, Files
3. `Google Workspace` und `Business Tools` nach ganz unten

**Warum es zwei Sammelseiten gibt:** `Client Records` bündelt Client Access,
Website Requirements und Client Communication; `Finance` bündelt Invoices und
Expenses. Notion erlaubt keiner Datenbank, Elternteil einer anderen zu sein —
ohne die beiden Seiten lägen 11 Datenbanken flach nebeneinander in der Leiste.

### Mobile

Auf dem Telefon stapelt Notion Spalten untereinander, in der Reihenfolge der
Seite. Die Reihenfolge auf dem HQ ist bereits danach gebaut: Header, Quick
Actions, Today, Overdue, Projects, Clients, KPIs, Calendar, Spotify, Notizen.

1. Notion-App öffnen, `NOVERA STUDIO` auf **Favorites** setzen
2. iOS: Seite teilen → **Zum Home-Bildschirm** — dann startet das HQ wie eine App
3. In der App unter **Settings** → **Appearance** → **Dark**

Für unterwegs reicht meist die Datenbank **Tasks** mit der Ansicht `Today`.
Die lässt sich ebenfalls einzeln favorisieren.

---

## 7 — Spotify

Sofern `NOVERA_SPOTIFY_URL` gesetzt war, steht der Player schon. Sonst:

1. In Spotify die Playlist öffnen → **•••** → **Teilen** → **Link kopieren**
2. Im HQ in den orangen Kasten einfügen → **Create embed**

Notion bettet Spotify über den offiziellen Player ein. Der spielt **30-Sekunden-
Vorschauen**, außer du bist im selben Browser bei Spotify Premium angemeldet —
dann laufen die vollen Titel. Das ist eine Vorgabe von Spotify, nicht von Notion,
und lässt sich von unserer Seite nicht ändern.

---

## Wenn alles erledigt ist

`docs/QUALITAETSKONTROLLE.md` durchgehen — dort steht jeder Punkt aus deiner
Anforderungsliste mit dem Ort, an dem er im System sitzt.
