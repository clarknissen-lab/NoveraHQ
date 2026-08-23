# Datenmodell

Elf Datenbanken, 150 Properties, 15 Relationspaare. Definiert in
`scripts/lib/schema.mjs`.

---

## Überblick

```
                            ┌───────────┐
                            │  CLIENTS  │
                            └─────┬─────┘
        ┌──────────┬──────────┬───┴───┬──────────┬──────────┐
        │          │          │       │          │          │
   ┌────┴────┐ ┌───┴───┐ ┌────┴───┐ ┌─┴────┐ ┌───┴────┐ ┌───┴──────┐
   │PROJECTS │ │ TASKS │ │INVOICES│ │ACCESS│ │  COMM  │ │REQUIREM. │
   └────┬────┘ └───┬───┘ └────┬───┘ └──────┘ └────────┘ └──────────┘
        │          │          │
        ├──────────┘          │        ┌───────┐   ┌───────────┐
        ├─────────────────────┘        │ IDEAS │   │ KNOWLEDGE │
        ├──── EXPENSES                 └───┬───┘   └───────────┘
        ├──── NOTES ────── TASKS           │        (ohne Relation)
        └──────────────────────────────────┘
```

---

## Warum die Relations nur auf einer Seite stehen

Notion-Relations sind **dual**: Legt man in `Tasks` eine Relation `Client` an, die
auf `Clients` zeigt, entsteht in `Clients` automatisch die Gegenseite `Tasks`.

Deklariert man beide Seiten selbst, bekommt man vier Properties statt zwei — zwei
davon halb kaputt. Deshalb steht im Schema jedes Paar **genau einmal**, auf der
Kind-Seite (Task wählt seinen Kunden, nicht umgekehrt). Der Name der Gegenseite
wird über `synced_property_name` festgelegt.

`npm run verify` prüft genau das: Jede Gegenseite muss existieren, und keine darf
doppelt angelegt worden sein.

---

## Warum der Aufbau in fünf Durchläufen passiert

Notion-Properties hängen voneinander ab. Die Reihenfolge ist nicht kosmetisch —
in der falschen Reihenfolge schlägt der Aufbau fehl.

| Pass | Was | Warum erst hier |
|---|---|---|
| 1 | Datenbanken + Basis-Properties | Grundlage |
| 2 | Relations | brauchen die `data_source_id` des Ziels aus Pass 1 |
| 3 | Formeln | z.B. `Done?`, `Amount Paid`, `Days Left` — lesen nur Basis-Properties |
| 4 | Rollups | lesen die Formeln aus Pass 3 über die Relations aus Pass 2 |
| 5 | Formeln auf Formeln und Rollups | `Progress Bar` liest das Rollup `Progress`, `Deadline` liest `Days Left` |

`npm run verify` prüft diese Reihenfolge: Jede Formel wird gegen die zu diesem
Zeitpunkt vorhandenen Properties gehalten. Liest eine Formel etwas, das noch
nicht existiert, bricht der Prüflauf ab.

Zwischen Pass 5 und den Beispieldaten liest der Builder alle Property-Typen neu
ein. Ohne diesen Schritt kennt er die in Pass 2 entstandenen Relations nicht und
würde die Verknüpfungen der Beispieldaten stillschweigend verwerfen.

---

## Die Formeln und wozu sie da sind

### `Tasks → Done?`
```
format(prop("Status")) == "Done"
```
Eine Checkbox als Grundlage für den Projektfortschritt. Notion-Rollups können
nicht nach Status filtern, aber sie können den Anteil angehakter Checkboxen
berechnen (`percent_checked`). Ohne diese Formel gäbe es keinen Fortschritt.

### `Tasks → Overdue?`
```
and(not(empty(prop("Due Date"))), format(prop("Status")) != "Done", prop("Due Date") < now())
```
Damit „überfällig“ eine Eigenschaft der Aufgabe ist und nicht nur ein Filter.

### `Tasks → Time`
```
if(empty(prop("Due Date")), "",
   if(formatDate(prop("Due Date"), "HH:mm") == "00:00", "",
      formatDate(prop("Due Date"), "HH:mm")))
```
Zieht die Uhrzeit aus `Due Date` heraus. Deshalb gibt es **kein zweites Feld
„Time“** zum Pflegen. Aufgaben ohne Uhrzeit zeigen nichts an statt `00:00`.

### `Invoices → Amount Paid` und `Amount Open`
```
if(format(prop("Status")) == "Paid", prop("Amount"), 0)
if(or(… "Sent", … "Open", … "Overdue"), prop("Amount"), 0)
```
Der Umweg um die größte Rollup-Einschränkung: Ein Rollup „Summe der bezahlten
Rechnungen“ existiert in Notion nicht. Diese Formeln liefern je Status entweder
den Betrag oder 0 — die Summe darüber ist dann korrekt.

### `Tasks → Days Left` und `Deadline`
```
Days Left:  dateBetween(parseDate(formatDate(prop("Due Date"), "YYYY-MM-DD")),
                        parseDate(formatDate(now(),            "YYYY-MM-DD")), "days")

Deadline:   "Überfällig · 3 Tage" · "Heute" · "Morgen" · "in 5 Tagen" · "Erledigt"
```
Zwei Schritte statt einer Monsterformel: erst die Zahl, dann der Text. Die Zahl
ist zusätzlich sortier- und filterbar.

Beide Daten werden über `formatDate`/`parseDate` auf den reinen Tag gekürzt.
Ohne das rechnet `dateBetween` mit Uhrzeiten — „morgen 09:00" wäre von
„heute 14:00" nur 19 Stunden entfernt und damit 0 Tage, also fälschlich „Heute".

Dieselbe Spalte gibt es in `Projects` (auf `Deadline`) und `Invoices` (auf
`Due Date`), jeweils mit den passenden Abschluss-Status.

### `Projects → Progress Bar`
```
slice("●●●●●●●●●●", 0, round(prop("Progress") * 10)) +
slice("○○○○○○○○○○", 0, 10 - round(prop("Progress") * 10)) + …
```
Die Punktreihe aus der Designvorlage. Punkte statt Blockbalken, weil sie im
Dunkelmodus deutlich ruhiger wirken. Läuft als Text und funktioniert deshalb in
jeder Ansicht — auch in Board-Karten und auf dem Telefon.

### `Client Access → Password`
```
"🔐 Stored in 1Password"
```
Eine Konstante. Formeln lassen sich nicht überschreiben — damit ist es baulich
unmöglich, hier ein Passwort einzutragen. Das ist der Zweck, nicht ein Nebeneffekt.

---

## Status oder Select

`status`-Properties waren über die Notion-API lange gesperrt. Der aktuelle Stand
lässt sie zu. Falls ein Workspace das doch ablehnt, legt der Builder dieselbe
Property als `select` mit identischen Optionen an, meldet es und schreibt alle
Ansichtsfilter von `status` auf `select` um.

Funktional ist der Unterschied gering: `select` hat keine Gruppen
(To-do / In progress / Complete). Board-Ansichten gruppieren dann nach Option
statt nach Gruppe.

---

## Property-Übersicht

| Datenbank | Properties | davon Relations | davon berechnet |
|---|---|---|---|
| Clients | 27 | 7 | 6 |
| Projects | 25 | 8 | 8 |
| Tasks | 16 | 3 | 5 |
| Invoices | 14 | 2 | 5 |
| Expenses | 10 | 1 | — |
| Client Access | 11 | 1 | 1 |
| Website Requirements | 18 | 2 | — |
| Client Communication | 8 | 2 | — |
| Ideas | 7 | 1 | — |
| Notes | 8 | 3 | — |
| Knowledge | 6 | — | — |

Relations umfassen die automatisch entstandenen Gegenseiten — deshalb hat
`Clients` sieben, obwohl im Schema keine einzige deklariert ist.
