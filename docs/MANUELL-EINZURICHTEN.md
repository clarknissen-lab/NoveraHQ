# MANUELL EINZURICHTEN

Alles, was der Builder nicht anlegen kann — mit dem Grund, dem Ort und dem
genauen Handgriff.

Einmalig etwa 25 Minuten. Danach läuft das HQ von allein.

Im Workspace erkennst du jede offene Stelle an einem orangen Kasten mit 🔧.
Ist sie erledigt, löschst du den Kasten.

| # | Was | Warum nicht automatisch | Dauer |
|---|---|---|---|
| 1 | Verknüpfte Ansichten (13×) | Kein API-Blocktyp dafür | ~11 min |
| 2 | Datenbank-Vorlagen (5×) | API kann keine Vorlagen schreiben | ~14 min |
| 3 | Novera-Care-Umsatz | ergibt sich aus Schritt 1 | ~2 min |
| 4 | Seitenleiste sortieren | reine Anzeigeeinstellung | ~3 min |

---

## 1 — Verknüpfte Ansichten

### Warum das nicht automatisch geht

Eine „verknüpfte Datenbankansicht" ist in Notion **kein Block, den die API
kennt**. Die API kann Absätze, Überschriften, Spalten, Callouts, Embeds und
Verweise anlegen — aber es existiert schlicht kein Blocktyp für eine
eingebettete, gefilterte Datenbankansicht.

Was der Builder deshalb tut: Er legt **alle 49 Ansichten in den Datenbanken
selbst** an, fertig gefiltert und sortiert. Du konfigurierst nichts. Du zeigst
nur, wo welche Ansicht erscheinen soll.

### Der Handgriff — einmal verstehen, zehnmal anwenden

1. In den orangen Kasten klicken, Inhalt markieren, löschen
2. `/verknüpfte` tippen → **Verknüpfte Ansicht einer Datenbank**
3. Datenbank auswählen
4. Oben die im Kasten genannte Ansicht wählen
5. Bei Bedarf **•••** → **Eigenschaften** → Spalten ein- und ausblenden

> Immer eine **vorhandene Ansicht** wählen statt neu zu filtern. Änderst du
> später den Filter in der Datenbank, ziehen alle Einbettungen mit.

### Auf `NOVERA STUDIO` (dem Dashboard)

Die Reihenfolge auf der Seite ist bewusst so gewählt: oben steht, was du morgens
zuerst sehen willst.

| Abschnitt | Datenbank | Ansicht | Spalten | Limit |
|---|---|---|---|---|
| Heute · Überfällig | Aufgaben | `Überfällig` | Aufgabe, Frist, Kunde | 5 |
| Heute · Heutige Aufgaben | Aufgaben | `Heute` | Aufgabe, Uhrzeit, Kunde, Priorität | — |
| Heute · Follow-ups | Leads | `Heute kontaktieren` | Unternehmen, Priorität, Sales Angle | 5 |
| Heute · Dringende Projekte | Projekte | `Dringend` | Projektname, Kunde, Frist | 5 |
| Aktive Projekte | Projekte | `Aktiv` | Projektname, Kunde, Frist, Fortschrittsbalken, Offene Aufgaben | 5 |
| Sales · Neue Leads | Leads | `Neue Leads` | Unternehmen, Lead Score, Branche | 5 |
| Sales · Offene Angebote | Angebote | `Offen` | Angebotsname, Kunde, Gesamtpreis, Gültigkeit | — |
| Technik · Domainverlängerungen | Hosting & Domains | `Domainverlängerungen` | Eintrag, Domain, Ablauf | — |
| Technik · Novera Care | Kunden | `Novera Care` | Firmenname, Novera Care · Monatlich | — |

> **Limit setzen:** **•••** → **Limit** → `5`. Ohne Limit werden aus den Ansichten
> lange Tabellen, und genau das soll das Dashboard nicht sein.

### Auf `Kalender`

| Abschnitt | Datenbank | Ansicht |
|---|---|---|
| Aufgaben mit Termin | Aufgaben | `Kalender` |
| Projekt-Deadlines | Projekte | `Deadlines` |
| Domainverlängerungen | Hosting & Domains | `Domainverlängerungen` |

> Die Spalte **Frist** schreibt den Rest der Zeit aus: „Überfällig · 3 Tage",
> „Heute", „Morgen", „in 5 Tagen". Sie ersetzt das rohe Datum — man sieht sofort,
> was drängt.

---

## 2 — Datenbank-Vorlagen

### Warum das nicht automatisch geht

Notion-Datenbanken haben Seitenvorlagen: Ein neuer Kunde bringt sofort die
Kundenakte mit. Die API kann Vorlagen **lesen**, aber nicht **schreiben**.

Was der Builder deshalb tut: Er hat je einen Musterdatensatz mit genau dem
Seitenaufbau angelegt, den die Vorlage haben soll. Du machst daraus in einem Zug
eine echte Vorlage.

### Der Ablauf, fünfmal gleich

1. Datenbank öffnen, den Musterdatensatz öffnen
2. In den Seitenkörper klicken, `Cmd/Strg + A`, `Cmd/Strg + C`
3. Zurück zur Datenbank. Neben dem blauen **Neu** auf **▾** klicken
4. **＋ Neue Vorlage**, benennen
5. In den Körper klicken, `Cmd/Strg + V`
6. Orange Kästen durch verknüpfte Ansichten ersetzen (Handgriff aus Schritt 1)
7. **← Zurück**, dann bei der Vorlage **•••** → **Als Standard festlegen**

| Datenbank | Musterdatensatz | Vorlagenname | 🔧-Kästen |
|---|---|---|---|
| Kunden | Muster GmbH | `Kundenakte` | 7 |
| Projekte | Website Relaunch Muster GmbH | `Website-Projekt` | 1 |
| Website Blueprints | Muster GmbH · Blueprint | `Blueprint` | 0 |
| Angebote | Angebot Website Muster GmbH | `Angebot` | 0 |
| Leads | Beispiel Bäckerei | `Lead` | 0 |

Drei der fünf Vorlagen haben gar keine Kästen — dort genügt Kopieren und Einfügen.

### Der entscheidende Punkt bei den Filtern

In der **Kundenakte** und im **Website-Projekt** filtern die verknüpften
Ansichten auf den jeweiligen Datensatz. Beim Filter `Kunde enthält` erscheint in
einer Vorlage die Option **„Diese Seite"**. Die wählen.

Dann füllt sich jede neue Kundenakte automatisch mit den Daten genau dieses
Kunden. Wählst du stattdessen einen konkreten Kunden aus, zeigen alle Akten
dessen Daten.

**Kundenakte — sieben Ansichten:**

| Abschnitt | Datenbank | Filter |
|---|---|---|
| 🚀 Projekte | Projekte | `Kunde` enthält → **Diese Seite** |
| 📄 Angebote | Angebote | `Kunde` enthält → **Diese Seite** |
| 🌐 Websites | Websites | `Kunde` enthält → **Diese Seite** |
| 🧠 Blueprints | Website Blueprints | `Kunde` enthält → **Diese Seite** |
| ✅ Aufgaben | Aufgaben | `Kunde` enthält → **Diese Seite**, `Status` ist nicht `Erledigt` |
| ☁️ Hosting & Domain | Hosting & Domains | `Kunde` enthält → **Diese Seite** |
| 🔐 Zugänge | Zugänge | `Kunde` enthält → **Diese Seite** |

Der Abschnitt **🎯 Herkunft** braucht keine Ansicht — der Lead steht oben in den
Eigenschaften und ist von dort einen Klick entfernt. **🎨 Branding** ebenfalls
nicht: Der Link zum Markenordner steht bei der Website, die Vorgaben im Blueprint.

**Website-Projekt — eine Ansicht:**

| Abschnitt | Datenbank | Filter |
|---|---|---|
| Aufgaben | Aufgaben | `Projekt` enthält → **Diese Seite** |

Die Checkliste im Projekt ist bereits fertig — Konzept, Branding, Mockups,
Entwicklung, SEO, Qualität, Abnahme, Launch.

---

## 3 — Novera-Care-Umsatz

### Warum das nicht automatisch geht

Notion berechnet Zahlen nicht frei auf einer Seite. Summen entstehen
ausschließlich in der **Summenzeile einer Datenbankansicht**.

### Der Handgriff

Wenn du den monatlichen Betreuungsumsatz im Blick haben willst:

1. Auf dem HQ eine verknüpfte Ansicht einfügen → **Kunden** → Ansicht `Novera Care`
2. **•••** → **Eigenschaften** → alles ausblenden bis auf `Firmenname` und
   `Novera Care · Monatlich`
3. Unter der Spalte auf **Berechnen** → **Summe**
4. **•••** → **Layout** → Datenbanktitel und Ansichtsoptionen ausblenden

Dasselbe funktioniert bei **Hosting & Domains → Aktive Hostings** mit der Spalte
`Marge` — dann siehst du, was von den Hosting-Einnahmen übrig bleibt.

Alles Weitere zu Zahlen steht in Papierkram. Notion rechnet hier bewusst nicht mit.

---

## 4 — Seitenleiste und Mobile

### Seitenleiste

Alle Seiten und Datenbanken hängen unter `NOVERA HQ`. Sinnvolle Reihenfolge per
Drag & Drop:

```
NOVERA STUDIO
├── Leads
├── Kunden
├── Projekte
├── Websites
├── Website Blueprints
├── Angebote
├── Aufgaben
├── Hosting & Domains
├── Zugänge
├── Kalender
├── Novera Tools
├── Dokumente
└── System
```

`NOVERA STUDIO` mit **•••** → **Zu Favoriten hinzufügen** ganz nach oben holen.

### Mobile

Notion stapelt Spalten auf dem Telefon untereinander, in der Reihenfolge der
Seite. Das Dashboard ist danach gebaut:

```
Uhrzeit  →  Heute  →  Schnelle Aktionen  →  Mein Arbeitsbereich
   →  Aktive Projekte  →  Quick Links  →  Spotify  →  Sales  →  Technik
```

Die acht Schnellaktionen stehen bewusst **nach** „Heute": auf dem Telefon würden
acht gestapelte Karten den Heute-Bereich sonst unter die Falz drücken.

**Spotify auf dem Telefon:** Der eingebettete Player ist auf kleinen Bildschirmen
sperrig. Wenn er stört: **•••** → **Löschen** und stattdessen den Link
„Zuletzt gehört" nutzen — der öffnet die Spotify-App direkt.

Für unterwegs genügt meist die Datenbank **Aufgaben** mit der Ansicht `Heute` —
die lässt sich einzeln favorisieren. In der App unter **Einstellungen** →
**Darstellung** → **Dunkel**.

---

## Wenn alles erledigt ist

Öffne das HQ am Morgen. Du solltest sofort sehen: was überfällig ist, was heute
ansteht, wen du kontaktieren musst, welche Projekte laufen und ob eine Domain
demnächst abläuft.

Mehr soll das Dashboard nicht.
