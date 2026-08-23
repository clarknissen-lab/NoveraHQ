# Notion verbinden

Es gibt zwei Wege, und sie lösen verschiedene Probleme. Kurz vorweg:

| | Integration + Token | Connector auf claude.ai |
|---|---|---|
| **Wofür** | den Workspace **aufbauen** | im Alltag **damit arbeiten** |
| Legt Datenbanken an | ja | eingeschränkt |
| Legt Relations, Rollups, Formeln an | ja | nein |
| Legt Ansichten an | ja (alle 50) | nein |
| Aufwand | einmal 5 Minuten | einmal 2 Minuten |

**Für den Aufbau brauchst du Weg A.** Weg B ist danach bequem, ersetzt ihn aber nicht.

---

## Weg A — Integration + Token

Das ist der Weg, für den der Builder in diesem Repo gebaut ist. Er läuft auf
deinem Rechner und spricht direkt mit Notion.

Vollständig beschrieben in **[SETUP.md](SETUP.md)**. In Kurzform:

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration** → Internal
2. **Internal Integration Secret** kopieren (beginnt mit `ntn_`)
3. In Notion eine leere Seite anlegen → **•••** → **Connections** → deine Integration verbinden
4. Seiten-URL kopieren
5. Auf deinem Rechner:

```bash
git clone https://github.com/clarknissen-lab/NoveraHQ.git
cd NoveraHQ
npm install

cp .env.example .env     # Token und Seiten-URL eintragen
npm run check            # prüft Token, Seite und Schreibrecht
npm run build
```

Danach stehen 11 Datenbanken, 50 Ansichten und das komplette Dashboard.

> **Warum das nicht in dieser Claude-Sitzung läuft:** Diese Sitzung läuft in
> einem abgeschotteten Container, dessen Netzwerkzugang auf eine Freigabeliste
> beschränkt ist. `api.notion.com` steht nicht darauf — ich habe es geprüft, der
> Aufbau wird mit einem 403 abgewiesen. Der Builder muss deshalb bei dir laufen.
> Das ist auch besser so: dein Token verlässt dabei nie deinen Rechner.

---

## Weg B — Connector auf claude.ai

Damit kann Claude in künftigen Unterhaltungen direkt in deinem Notion suchen,
Seiten lesen und Einträge anlegen — ohne Token, ohne Skript.

1. [claude.ai](https://claude.ai) öffnen
2. **Einstellungen** → **Connectors**
3. Bei **Notion** auf **Verbinden**
4. Notion fragt nach der Erlaubnis → **Auswählen, welche Seiten freigegeben werden**
5. Gib die Seite frei, unter der dein `NOVERA STUDIO` liegt

Danach musst du den Connector **je Unterhaltung aktivieren**: im Chat unten auf
das Werkzeugsymbol → **Notion** einschalten. Ohne diesen Schritt ist er zwar
verbunden, aber im Gespräch nicht verfügbar.

### Was Weg B kann

Der Notion-Connector bringt Werkzeuge wie `search`, `fetch`, `create-pages`,
`update-page`, `create-database` und `update-database` mit. Gut geeignet für:

- „Leg mir eine Aufgabe an: Angebot für Beispiel Handwerk, Freitag, hohe Priorität"
- „Was steht diese Woche bei Muster GmbH an?"
- „Fass zusammen, was wir mit dem Kunden zuletzt besprochen haben"
- „Trag die Rückmeldung von heute ins Gesprächsprotokoll ein"

### Was Weg B nicht kann

Er arbeitet auf einer gröberen Ebene als die rohe API. Damit fehlt genau das,
was dieses System ausmacht:

- **Keine Ansichten.** Die 50 gefilterten Ansichten entstehen nicht.
- **Keine Relations mit benannter Gegenseite**, keine Rollups, keine Formeln.
  Ohne die gibt es keinen Umsatz je Kunde, keinen Projektfortschritt und kein
  gesperrtes Passwortfeld.
- **Keine Kontrolle über die Reihenfolge.** Der Aufbau hängt davon ab, dass
  Relations vor Rollups entstehen und Formeln vor den Rollups, die sie lesen.

Deshalb: erst Weg A für den Aufbau, dann Weg B für den Alltag.

---

## Beides zusammen

So sieht die sinnvolle Arbeitsteilung aus:

```
Weg A  ─ einmalig ─→  Workspace steht
                      11 Datenbanken, 50 Ansichten, Dashboard

Weg B  ─ täglich ──→  Aufgaben anlegen, Kunden nachschlagen,
                      Protokolle schreiben, Fragen stellen

Notion ─────────────→ die Oberfläche, in der du selbst arbeitest
```

Der Builder bleibt auch danach nützlich: Änderst du das Schema in
`scripts/lib/schema.mjs` — ein neues Feld, eine neue Ansicht — genügt ein
erneutes `npm run build`. Was schon existiert, wird übersprungen; nur das Neue
kommt dazu.

---

## Sicherheit

- Das Token ist ein Passwort. Es gehört in 1Password, nicht in einen Commit.
  `.gitignore` blockt `.env` bereits.
- Die Integration sieht **ausschließlich** Seiten, die du ihr ausdrücklich
  freigibst. Gib ihr die eine Elternseite, nicht den ganzen Workspace.
- Verlierst du das Token, kannst du es unter *my-integrations* zurückziehen und
  neu erzeugen. Der Builder läuft danach unverändert weiter.
- Beim Connector gilt dasselbe: Bei der Freigabe gezielt Seiten auswählen statt
  pauschal alles.
