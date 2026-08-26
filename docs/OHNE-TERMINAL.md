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

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) öffnen
2. **New integration**
3. Name: `Novera Builder`, Associated workspace: dein Workspace, Type: **Internal**
4. **Save**
5. **Configure** → **Internal Integration Secret** → **Show** → kopieren

Das Secret beginnt mit `ntn_`. Es ist ein Passwort — behandle es wie eins.

Unter **Capabilities** müssen **Read**, **Update** und **Insert content** aktiv
sein. Ohne *Insert content* kann der Builder nichts anlegen.

---

## 2 — In Notion: Seite anlegen und freigeben

**Hier gehen die meisten schief.** Notion zeigt einer Integration ausschließlich
Seiten, die ausdrücklich für sie freigegeben wurden.

1. Eine neue leere Seite anlegen, z.B. `Novera`
2. Oben rechts auf **•••**
3. **Connections** (Verbindungen) → **Connect to** → `Novera Builder`
4. **•••** → **Copy link** → die Adresse kopieren

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
3. Die drei Schalter stehen richtig voreingestellt:

| Schalter | Standard | Bedeutung |
|---|---|---|
| Beispieldaten | an | Musterkunde mit Projekt, Website, Angebot, Aufgaben |
| Ambiente-Licht | an | Cover und getönte Sektionsbänder |
| Nur testen | aus | an = nichts in Notion schreiben, nur prüfen |

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

---

## Lieber doch auf dem eigenen Rechner?

Geht auch — dann brauchst du Node und ein Terminal. Der Weg steht in
**[SETUP.md](SETUP.md)**. Beide Wege bauen exakt dasselbe und teilen sich über
git dieselbe State-Datei; du kannst also wechseln.
