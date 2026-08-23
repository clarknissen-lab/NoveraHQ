# Setup

Vom leeren Notion zum fertigen Novera HQ. Rechne mit 15 Minuten.

Der Ablauf ist immer derselbe:

```
1. Node installieren      einmalig
2. Repo holen             einmalig
3. Integration in Notion  einmalig
4. Seite freigeben        ← hier gehen die meisten schief
5. .env ausfüllen
6. npm run check          sagt dir, ob alles passt
7. npm run build          baut den Workspace
8. Handgriffe in Notion   siehe MANUELL-EINZURICHTEN.md
```

---

## 1 — Node installieren

Der Builder ist ein Skript. Zum Ausführen braucht es Node.

Prüfen, ob es schon da ist — Terminal öffnen (macOS: *Terminal*, Windows:
*PowerShell*) und eingeben:

```bash
node --version
```

Kommt eine Zahl ab `v18`, bist du fertig. Kommt „command not found", lade die
**LTS**-Version von [nodejs.org](https://nodejs.org) und installiere sie.
Danach das Terminal einmal schließen und neu öffnen.

---

## 2 — Repo holen

```bash
git clone https://github.com/clarknissen-lab/NoveraHQ.git
cd NoveraHQ
npm install
```

Ohne Git: auf GitHub **Code → Download ZIP**, entpacken, im Terminal in den
Ordner wechseln (`cd` und den Ordner ins Fenster ziehen), dann `npm install`.

---

## 3 — Integration in Notion anlegen

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) öffnen
2. **New integration**
3. Name: `Novera Builder`
4. Associated workspace: dein Novera-Workspace
5. Type: **Internal**
6. **Save**
7. **Configure** → **Internal Integration Secret** → **Show** → kopieren

Das Secret beginnt mit `ntn_`. Es ist ein Passwort — es gehört in 1Password.

Unter **Capabilities** müssen **Read**, **Update** und **Insert content**
aktiv sein. Ohne *Insert content* kann der Builder nichts anlegen.

---

## 4 — Seite anlegen und freigeben

**Das ist der Schritt, an dem es am häufigsten hakt.** Notion zeigt einer
Integration ausschließlich Seiten, die ausdrücklich für sie freigegeben wurden.
Ohne diesen Schritt findet der Builder die Seite nicht — obwohl sie da ist.

1. In Notion eine neue leere Seite anlegen, z.B. `Novera`
2. Oben rechts auf **•••**
3. **Connections** (Verbindungen) → **Connect to** → `Novera Builder`
4. Die Adresse der Seite kopieren — **•••** → **Copy link**

---

## 5 — .env ausfüllen

```bash
cp .env.example .env
```

Unter Windows: `copy .env.example .env`

Dann `.env` in einem Editor öffnen und die zwei Pflichtwerte eintragen:

```
NOTION_TOKEN=ntn_dein_echtes_secret
NOTION_PARENT_PAGE=https://www.notion.so/Novera-24f1a0b3c4d5e6f7a8b9c0d1e2f3a4b5
```

Die komplette Seiten-URL genügt — der Builder holt sich die ID selbst heraus.

Alles Weitere in der Datei ist optional und darf leer bleiben. Fehlt ein Wert,
entsteht an der Stelle im Dashboard ein orange markierter Hinweis, was noch fehlt.

> `.env` ist über `.gitignore` ausgeschlossen und landet nie auf GitHub.

---

## 6 — Verbindungstest

```bash
npm run check
```

Prüft der Reihe nach Node-Version, `.env`, Token, Seite und Schreibrecht.
Beim ersten Problem bricht er ab und sagt konkret, was zu tun ist:

```
✓ Node 22.14.0
✓ .env gelesen (6 Einträge)
✓ Token gefunden (ntn_abc…)
✓ Elternseite 24f1a0b3…
✓ Token gültig — Integration „Novera Builder"
✓ Seite erreichbar — „Novera"
✓ Schreibrecht vorhanden

  Alles bereit.
  Jetzt bauen:  npm run build
```

---

## 7 — Bauen

```bash
npm run build
```

Dauert ein bis zwei Minuten. Der Lauf legt an:

| Was | Menge |
|---|---|
| Datenbanken | 9 |
| Properties | 150 |
| Relations (Paare) | 12 |
| Rollups und Formeln | 21 |
| Ansichten | 49 |
| Seiten | 5 + Beispieldaten |

Am Ende steht eine Zusammenfassung und, falls etwas nicht durchging, eine Liste
unter **Hinweise**. Der Builder bricht nicht beim ersten Problem ab.

### Flags

```bash
npm run build -- --no-seed    # ohne Beispieldaten
npm run build -- --no-views   # ohne Ansichten
npm run build:dry             # nichts schreiben, nur prüfen
```

---

## 8 — Widget veröffentlichen

Notion hat keine Uhr, die von selbst weiterläuft. Das Widget in `widget/`
liefert sie — zusammen mit Logo, Wortmarke und dem Fokus-Timer.

1. Im Repo: **Settings** → **Pages** → Source: **GitHub Actions**
2. Nach `main` pushen — der Workflow `pages.yml` veröffentlicht `widget/`
3. Die Seite liegt dann unter `https://clarknissen-lab.github.io/NoveraHQ/`
4. In `.env` eintragen und noch einmal bauen:

```
NOVERA_CLOCK_URL=https://clarknissen-lab.github.io/NoveraHQ/
```

Daraus leitet der Builder auch das Seiten-Icon (`brand/favicon.svg`), den
Fokus-Timer (`focus.html`) und das Ambiente-Cover (`brand/cover.jpg`) ab — die
musst du nicht einzeln eintragen.

Sprache und Zeitformat über die URL:

| URL | Ergebnis |
|---|---|
| `…/?lang=de` | Deutsch, 24 Stunden |
| `…/?lang=en` | Englisch, 12 Stunden |
| `…/focus.html?work=50&break=10` | Timer mit 50/10 statt 25/5 |
| `…/?ambient=off` | ohne Ambiente-Licht |

Das Ambiente-Licht — Cover auf dem HQ, violett getönte Sektionsbänder, weiche
Lichtwolken in den Widgets — lässt sich in `.env` abschalten:

```
NOVERA_AMBIENT=off
```

---

## 9 — Handgriffe in Notion

Vier Dinge kann die Notion-API nicht. Sie stehen mit exakten Klicks in
**[MANUELL-EINZURICHTEN.md](MANUELL-EINZURICHTEN.md)**. Etwa 25 Minuten einmalig.

---

## Erneut bauen

Der Lauf ist wiederholbar. Angelegte IDs stehen in `.novera-state.json`; ein
zweiter Lauf überspringt, was schon existiert, und ergänzt nur Fehlendes. Nach
einem Abbruch — Netzfehler, Rate Limit — reicht ein erneutes `npm run build`.

**Komplett neu bauen:** `.novera-state.json` löschen und die alten Seiten in
Notion in den Papierkorb schieben. Ohne das Löschen entsteht ein zweiter Satz
Datenbanken.

---

## Prüflauf ohne Notion

```bash
npm run verify
```

Startet lokal einen Server, der sich wie die Notion-API verhält, lässt den
echten Builder komplett dagegen laufen und prüft danach das Ergebnis: Relations,
Gegenseiten, Rollup-Ziele, Formeln, Filtertypen, Blocklimits. Braucht weder
Token noch Internet. Nützlich nach jeder Änderung am Schema.

---

## Wenn etwas klemmt

`npm run check` beantwortet die meisten Fälle direkt. Darüber hinaus:

| Meldung | Ursache | Lösung |
|---|---|---|
| `object_not_found` | Seite nicht mit der Integration geteilt | Schritt 4 |
| `unauthorized` | Token falsch oder zurückgezogen | Secret neu kopieren |
| `restricted_resource` | *Insert content* fehlt | Capabilities, Schritt 3 |
| `validation_error` bei Status | Workspace erlaubt keine Status-Properties über die API | Passiert automatisch: der Builder legt sie als Select an und meldet es |
| `rate_limited` | zu viele Anfragen | Der Builder wartet und wiederholt selbst |
| Lauf bricht mittendrin ab | Netz | `npm run build` erneut — er setzt auf |
| `command not found: npm` | Node fehlt | Schritt 1 |
