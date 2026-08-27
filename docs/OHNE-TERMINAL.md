# Ohne Terminal — alles im Browser

Der Builder läuft auf GitHub. Auf deinem Rechner musst du nichts installieren,
nichts klonen, kein Terminal öffnen.

Drei Orte, mehr nicht:

```
NOTION    Integration anlegen, Seite freigeben
GITHUB    zwei Secrets eintragen, zweimal auf "Run workflow" klicken
NOTION    fertigen Workspace aufräumen (25 Minuten Handarbeit)
```

Insgesamt etwa 35 Minuten.

---

## 1 — In Notion: Integration anlegen

Die Seite für Integrationen ist eine **Entwicklerseite**. Sie liegt außerhalb
deines Workspaces, ist auch bei deutscher Notion-Oberfläche **auf Englisch**,
und sie lässt sich nicht über die Notion-Suche finden.

**Der zuverlässige Weg:** Diese Adresse in die Adresszeile eines Browsers
eingeben — nicht in die Notion-Suche, nicht in die Notion-App:

```
https://www.notion.so/my-integrations
```

> **Wichtig:** Im Browser, nicht in der Notion-App. Die Desktop-App öffnet
> Entwicklerseiten nicht zuverlässig. Chrome, Safari oder Firefox verwenden.

Alternativ über die Oberfläche:
**Einstellungen** (*Settings*) → **Verbindungen** (*Connections*) → ganz unten
**Integrationen entwickeln oder verwalten** (*Develop or manage integrations*).

### Auf der Seite

Die Beschriftungen sind englisch, auch wenn dein Notion deutsch ist:

1. **New integration**
2. **Name**: `Novera Builder`
3. **Associated workspace**: deinen Novera-Workspace wählen
4. **Type**: **Internal**
5. **Save**
6. Danach **Configure** → bei **Internal Integration Secret** auf **Show** →
   den Wert kopieren

Das Secret beginnt mit `ntn_`. Es ist ein Passwort — behandle es wie eins.

### Berechtigungen prüfen

Auf derselben Seite unter **Capabilities** müssen aktiv sein:

- **Read content**
- **Update content**
- **Insert content**

Ohne *Insert content* kann der Builder nichts anlegen.

---

## 2 — In Notion: Seite anlegen und freigeben

**Hier gehen die meisten schief.** Notion zeigt einer Integration ausschließlich
Seiten, die ausdrücklich für sie freigegeben wurden.

1. Eine neue leere Seite anlegen, z.B. `Novera`
2. Oben rechts auf **•••**
3. **Verbindungen** (*Connections*) → **Verbindung hinzufügen** (*Connect to*)
4. `Novera Builder` auswählen
5. **•••** → **Link kopieren** (*Copy link*) → die Adresse kopieren

> Findest du **Verbindungen** im •••-Menü nicht, scroll darin nach unten — der
> Punkt sitzt je nach Notion-Version weiter unten oder heißt in älteren
> Fassungen noch **Hinzufügen von Verbindungen**.

---

## 3 — Auf GitHub: die zwei Secrets eintragen

Im Repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Name | Wert |
|---|---|
| `NOTION_TOKEN` | das Secret aus Schritt 1 (`ntn_…`) |
| `NOTION_PARENT_PAGE` | die Seitenadresse aus Schritt 2 |

Secrets sind verschlüsselt und tauchen in keinem Protokoll auf. Wenn du sie
später ändern willst: dieselbe Stelle, **Update**.

### Optional

Dieselbe Stelle, nur wenn du es willst:

| Name | Wofür |
|---|---|
| `NOVERA_SPOTIFY_URL` | deine Arbeitsplaylist |
| `NOVERA_GCAL_EMBED_URL` | Google Calendar im Dashboard |
| `NOVERA_DRIVE_URL` | dein Drive-Hauptordner |
| `NOVERA_GITHUB_URL` | dein GitHub-Profil für die Quick Links |

Fehlt eines davon, steht an der Stelle im Dashboard ein orange markierter
Hinweis, was noch fehlt. Nichts geht kaputt.

> Die Adresse des Uhr-Widgets musst du **nicht** eintragen — der Workflow leitet
> sie aus dem Repo selbst ab.

---

## 4 — Auf GitHub: Widget veröffentlichen

Das muss **vor** dem Bauen passieren. Aus dieser Adresse holt der Builder vier
Dinge: das Logo als Seiten-Icon, das Ambiente-Cover, die Uhr im Kopf und den
Fokus-Timer.

1. **Settings** → **Pages** → bei **Source**: **GitHub Actions** wählen
2. Reiter **Actions** → links **Deploy widget to GitHub Pages**
3. Rechts **Run workflow** → Branch auswählen → **Run workflow**

Nach etwa einer Minute im Browser prüfen:

```
https://clarknissen-lab.github.io/NoveraHQ/
```

Du solltest den Novera-Header mit laufender Uhr sehen. Kommt 404, ist der
Workflow noch nicht durch — im Reiter **Actions** nachsehen.

---

## 5 — Auf GitHub: bauen

1. Reiter **Actions** → links **Novera HQ in Notion bauen**
2. Rechts **Run workflow**
3. Die Schalter stehen richtig voreingestellt:

| Schalter | Standard | Bedeutung |
|---|---|---|
| Beispieldaten | an | Musterkunde mit Projekt, Website, Angebot, Aufgaben |
| Ambiente-Licht | an | Cover und getönte Sektionsbänder |
| Nur testen | aus | an = nichts in Notion schreiben, nur prüfen |
| Dashboard neu | aus | an = Dashboard verwerfen und neu aufbauen |
| Notion-Thema | dark | auf `light` stellen, wenn Notion hell läuft |

**Notion-Thema:** Ein eingebettetes Widget kann nicht erkennen, ob Notion hell
oder dunkel läuft — es sieht nur das Thema des Rechners. Deshalb wird es hier
gesetzt. Steht es falsch, liegt ein weißer Kasten auf der dunklen Seite.

4. **Run workflow**

Der Lauf dauert ein bis zwei Minuten. Grüner Haken = fertig. Klick auf den Lauf
zeigt eine Zusammenfassung mit den nächsten Schritten.

**Beim ersten Mal lohnt „Nur testen":** Das prüft den kompletten Aufbau, ohne
irgendetwas in dein Notion zu schreiben. Läuft der durch, kannst du echt bauen.

---

## 6 — In Notion: aufräumen

Öffne Notion. Unter deiner freigegebenen Seite liegt jetzt **NOVERA STUDIO** mit
9 Datenbanken, 52 Ansichten und dem Dashboard.

Zwei Dinge kann die Notion-API nicht, die stehen mit exakten Klicks in
**[MANUELL-EINZURICHTEN.md](MANUELL-EINZURICHTEN.md)**:

- **13 verknüpfte Ansichten** einsetzen — es gibt keinen API-Blocktyp dafür.
  Die Ansichten selbst sind fertig; du zeigst nur, wo sie erscheinen sollen.
- **5 Datenbank-Vorlagen** anlegen — die API kann Vorlagen lesen, nicht schreiben.
  Die Musterdatensätze haben den fertigen Aufbau schon im Seitenkörper.

Etwa 25 Minuten, einmalig. Im Workspace erkennst du jede offene Stelle an einem
orangen Kasten mit 🔧.

---

## Noch einmal bauen

Der Lauf ist wiederholbar. Die IDs aller angelegten Objekte schreibt der
Workflow als `.novera-state.json` ins Repo zurück. Ein zweiter Lauf überspringt,
was schon existiert, und ergänzt nur Fehlendes.

Praktisch, wenn du später ein Secret nachträgst: Spotify-Link eintragen, Workflow
noch einmal starten — der Player erscheint, alles andere bleibt unangetastet.

**Komplett neu bauen:** `.novera-state.json` im Repo löschen und die alten Seiten
in Notion in den Papierkorb schieben. Ohne das Löschen entsteht ein zweiter Satz
Datenbanken.

---

## Wenn etwas klemmt

Der Workflow bricht mit einer konkreten Meldung ab, nicht mit einem Fehlercode.
Klick auf den roten Lauf und lies den fehlgeschlagenen Schritt.

| Meldung | Ursache | Lösung |
|---|---|---|
| `Das Secret NOTION_TOKEN fehlt` | Secret nicht angelegt | Schritt 3 |
| `Die Seite ist nicht mit der Integration verbunden` | häufigster Fehler | Schritt 2.3 |
| `Notion weist das Token zurück` | Secret falsch kopiert | Schritt 1.5, dann Secret aktualisieren |
| `Die Integration darf nicht schreiben` | *Insert content* fehlt | Capabilities, Schritt 1 |
| Uhr fehlt im Dashboard | Pages noch nicht veröffentlicht | Schritt 4, dann erneut bauen |
| „my-integrations" nicht auffindbar | in der Notion-Suche gesucht statt im Browser | Adresse in die Adresszeile eines Browsers eingeben |

---

## Lieber doch auf dem eigenen Rechner?

Geht auch — dann brauchst du Node und ein Terminal. Der Weg steht in
**[SETUP.md](SETUP.md)**. Beide Wege bauen exakt dasselbe und teilen sich über
git dieselbe State-Datei; du kannst also wechseln.
