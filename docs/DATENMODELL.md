# Datenmodell

Neun Datenbanken, 156 Properties. Definiert in `scripts/lib/schema.mjs`.

Der Grundsatz: **so einfach wie möglich, so umfangreich wie nötig.** Was sich
über eine Relation abbilden lässt, bekommt keine eigene Datenbank.

---

## Der Weg durch das System

```
LEAD ──gewonnen──▶ KUNDE ──▶ PROJEKT ──▶ WEBSITE ──▶ BLUEPRINT
                     │           │           │
                     │           │           └──▶ HOSTING & DOMAINS
                     │           │
                     ├──▶ ANGEBOTE ◀────────┘
                     ├──▶ AUFGABEN ◀─────────
                     └──▶ ZUGÄNGE
```

Vierzehn Relationspaare, jedes genau einmal deklariert:

```
Kunden       → Leads          Lead ↔ Kunde
Projekte     → Kunden         Kunde ↔ Projekte
Websites     → Kunden         Kunde ↔ Websites
Websites     → Projekte       Projekt ↔ Websites
Blueprints   → Websites       Website ↔ Blueprint
Blueprints   → Kunden         Kunde ↔ Blueprints
Angebote     → Kunden         Kunde ↔ Angebote
Angebote     → Projekte       Projekt ↔ Angebote
Angebote     → Leads          Lead ↔ Angebot
Aufgaben     → Kunden         Kunde ↔ Aufgaben
Aufgaben     → Projekte       Projekt ↔ Aufgaben
Hosting      → Kunden         Kunde ↔ Hosting & Domains
Hosting      → Websites       Website ↔ Hosting
Zugänge      → Kunden         Kunde ↔ Zugänge
```

### Zwei Relations, die auf den ersten Blick doppelt wirken

**Blueprint → Kunde.** Der Kunde steckt bereits über die Website drin. Die
direkte Relation kostet beim Anlegen einen Klick — und macht dafür den Blueprint
in der Kundenakte unmittelbar filterbar. Über die Website ginge das nicht: Notion
kann in einer Vorlage nur auf eine direkte Relation mit „Diese Seite" filtern,
nicht über zwei Ecken. Wer den Klick sparen will, löscht die Relation in
`schema.mjs` und erreicht den Blueprint stattdessen über die Website.

**Angebot → Lead.** Ein Angebot geht oft an einen Lead, bevor daraus ein Kunde
wird. Ohne diese Relation hinge ein verschicktes Angebot in der Luft, solange
der Kunde noch nicht angelegt ist.

---

## Was es bewusst NICHT gibt

| Weggelassen | Warum | Wo es stattdessen steht |
|---|---|---|
| Finanzdatenbank | Papierkram ist die Buchhaltung | Link im HQ, `Papierkram` beim Kunden |
| Rechnungen | dito | Papierkram |
| Branding-Datenbank | Branding entsteht immer im Blueprint | Abschnitt „Branding" im Blueprint |
| Dokumenten-Datenbank | Google Drive ist die Ablage | `Google Drive` beim Kunden und beim Projekt |
| Notizen-Datenbank | eine Datenbank für Freitext lohnt sich nicht | Feld `Notizen` plus Seitenkörper |
| Kommunikations-Log | für ein Studio dieser Größe Mehraufwand | Abschnitt „Notizen" in der Kundenakte |

Jede dieser Entscheidungen folgt derselben Frage: *Bringt eine eigene Datenbank
gegenüber einem Feld oder einer Relation echten Mehrwert?* Wo die Antwort nein
lautet, gibt es keine.

---

## Warum die Relations nur auf einer Seite stehen

Notion-Relations sind **dual**: Legt man in `Aufgaben` eine Relation `Kunde` an,
entsteht in `Kunden` automatisch die Gegenseite `Aufgaben`.

Deklariert man beide Seiten selbst, bekommt man vier Properties statt zwei — zwei
davon halb kaputt. Im Schema steht deshalb jedes Paar **genau einmal**, auf der
Kind-Seite. Der Name der Gegenseite wird über `synced_property_name` festgelegt.

`npm run verify` prüft genau das.

---

## Warum der Aufbau in fünf Durchläufen passiert

| Pass | Was | Warum erst hier |
|---|---|---|
| 1 | Datenbanken + Basis-Properties | Grundlage |
| 2 | Relations | brauchen die `data_source_id` des Ziels aus Pass 1 |
| 3 | Formeln | `Erledigt?`, `Gesamtpreis`, `Tage bis …` — lesen nur Basis-Properties |
| 4 | Rollups | lesen die Formeln aus Pass 3 über die Relations aus Pass 2 |
| 5 | Formeln auf Formeln und Rollups | `Frist` liest `Tage bis Deadline`, `Fortschrittsbalken` liest das Rollup `Fortschritt` |

Zwischen Pass 5 und den Beispieldaten liest der Builder alle Property-Typen neu
ein. Ohne das kennt er die in Pass 2 entstandenen Relations nicht und würde die
Verknüpfungen der Beispieldaten stillschweigend verwerfen.

---

## Die Formeln

### Countdown — `Tage bis …` und `Frist`

```
Tage bis Deadline:  dateBetween(parseDate(formatDate(prop("Deadline"), "YYYY-MM-DD")),
                                parseDate(formatDate(now(),            "YYYY-MM-DD")), "days")

Frist:              "Überfällig · 3 Tage" · "Heute" · "Morgen" · "in 5 Tagen"
```

Zwei Schritte statt einer Monsterformel: erst die Zahl, dann der Text. Die Zahl
ist zusätzlich sortier- und filterbar.

Beide Daten werden über `formatDate`/`parseDate` auf den reinen Tag gekürzt.
Ohne das rechnet `dateBetween` mit Uhrzeiten — „morgen 09:00" wäre von
„heute 14:00" nur 19 Stunden entfernt und damit 0 Tage, also fälschlich „Heute".

Dieselbe Formel läuft an drei Stellen, jeweils mit anderer Datums- und
Status-Spalte: `Aufgaben → Frist`, `Projekte → Frist`, `Angebote → Gültigkeit`
und `Hosting & Domains → Ablauf`.

### `Aufgaben → Erledigt?`
```
format(prop("Status")) == "Erledigt"
```
Eine Checkbox als Grundlage für den Projektfortschritt. Notion-Rollups können
nicht nach Status filtern, aber sie können den Anteil angehakter Checkboxen
berechnen (`percent_checked`). Ohne diese Formel gäbe es keinen Fortschritt.

### `Aufgaben → Uhrzeit`
Zieht die Uhrzeit aus `Deadline` heraus. Deshalb gibt es **kein zweites Feld**
für die Zeit. Aufgaben ohne Uhrzeit zeigen nichts an statt `00:00`.

### `Angebote → Gesamtpreis`
```
sum(prop("Websitepreis"), prop("Markenpaket"), prop("Domain"), prop("Weitere Leistungen"))
```
Die einmaligen Posten. **Novera Care zählt bewusst nicht hinein** — das ist ein
monatlicher Betrag und würde die Angebotssumme verfälschen.

### `Hosting & Domains → Marge`
```
Monatlicher Kundenpreis − Monatliche Kosten
```
Was an einem Hosting monatlich hängen bleibt. In der Ansicht „Aktive Hostings"
zeigt die Summenzeile den Gesamtbetrag.

### `Projekte → Fortschrittsbalken`
```
slice("●●●●●●●●●●", 0, round(prop("Fortschritt") * 10)) + …
```
Punktreihe statt Blockbalken — im Dunkelmodus deutlich ruhiger. Läuft als Text
und funktioniert deshalb überall, auch in Board-Karten und auf dem Telefon.

### Gespiegelte Felder statt doppelter Pflege

`Websites → Novera Care` und `Hosting & Domains → Novera Care` sind **Rollups**
auf den Haken beim Kunden, keine eigenen Felder. Gepflegt wird an genau einer
Stelle: in der Kundenakte. Beide Rollups nutzen `show_original` und zeigen damit
den Haken selbst statt einer Zahl.

Dasselbe Prinzip beim Branding: Der Link zum Markenordner steht bei der Website
(`Branding`), die inhaltlichen Vorgaben — Logo, Farben, Typografie, Bildsprache —
stehen im Blueprint, wo sie beim Bauen gebraucht werden. Keine dritte Stelle.

### `Zugänge → Passwort`
```
"🔐 In 1Password"
```
Eine Konstante. Formeln lassen sich nicht überschreiben — damit ist es baulich
unmöglich, hier ein Passwort einzutragen. Das ist der Zweck, nicht ein Nebeneffekt.

---

## Status ohne Emoji

Die Vorgabe listete die Status mit farbigen Punkten (🔵 Neuer Lead, 🟣 Qualifiziert).
Das sind Farbangaben — und Notion-Status haben echte Farben. Die Farbe steht
deshalb dort, wo sie hingehört: als Eigenschaft der Option.

Ergebnis: Filter und Formeln bleiben lesbar (`Status == "Qualifiziert"` statt
`Status == "🟣 Qualifiziert"`), und die Farbe ist trotzdem da. Wer die Emoji im
Namen möchte, ändert die Optionslisten oben in `schema.mjs`.

---

## Property-Übersicht

| Datenbank | Properties | davon Relations | davon berechnet |
|---|---|---|---|
| Leads | 21 | 2 | 1 |
| Kunden | 27 | 8 | 2 |
| Projekte | 18 | 4 | 5 |
| Websites | 16 | 4 | 1 |
| Website Blueprints | 11 | 2 | — |
| Angebote | 18 | 3 | 3 |
| Aufgaben | 16 | 2 | 5 |
| Hosting & Domains | 18 | 2 | 4 |
| Zugänge | 11 | 1 | 1 |

Relations umfassen die automatisch entstandenen Gegenseiten — deshalb hat
`Kunden` sieben, obwohl im Schema nur eine deklariert ist.
