# Setup

Vom leeren Notion zum fertigen Novera Studio OS. Rechne mit 10 Minuten.

---

## Schritt 1 — Notion-Integration anlegen

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) öffnen
2. **New integration**
3. Name: `Novera Builder`
4. Associated workspace: dein Novera-Workspace
5. Type: **Internal**
6. **Save**, dann **Configure integration settings** → **Internal Integration Secret** → **Show** → kopieren

Das Secret beginnt mit `ntn_`. Es ist ein Passwort — es gehört in 1Password und
niemals in einen Commit. `.gitignore` blockt `.env` bereits.

**Berechtigungen prüfen:** unter *Capabilities* müssen **Read**, **Update** und
**Insert content** aktiv sein. Ohne *Insert content* kann der Builder nichts anlegen.

---

## Schritt 2 — Elternseite anlegen und freigeben

Der Builder braucht eine Seite, unter der er baut.

1. In Notion eine neue leere Seite anlegen, z.B. `Novera`
2. Auf der Seite oben rechts **•••** → **Connections** → **Connect to** → `Novera Builder`
3. Seiten-ID aus der URL kopieren:

```
https://www.notion.so/Novera-24f1a0b3c4d5e6f7a8b9c0d1e2f3a4b5
                            └──────── das ist die ID ────────┘
```

Die ID kannst du mit oder ohne Bindestriche einsetzen — auch die komplette URL
funktioniert, der Builder holt sich die ID selbst heraus.

> Ohne Schritt 2.2 bricht der Lauf mit `object_not_found` ab. Das ist der mit
> Abstand häufigste Fehler: die Integration sieht ausschließlich Seiten, die
> ausdrücklich mit ihr geteilt wurden.

---

## Schritt 3 — Bauen

```bash
git clone https://github.com/clarknissen-lab/NoveraHQ.git
cd NoveraHQ
npm install

export NOTION_TOKEN="ntn_..."
export NOTION_PARENT_PAGE="24f1a0b3c4d5e6f7a8b9c0d1e2f3a4b5"

npm run build
```

Der Lauf legt an:

| Was | Menge |
|---|---|
| Datenbanken | 11 |
| Properties | 150 |
| Relations (Paare) | 15 |
| Rollups und Formeln | 25 |
| Ansichten | 50 |
| Seiten | 7 + Beispieldaten |

### Optionale Einstellungen

```bash
export NOVERA_CLOCK_URL="https://clarknissen-lab.github.io/NoveraHQ/"   # Header mit Logo und Live-Uhr
export NOVERA_SPOTIFY_URL="https://open.spotify.com/embed/playlist/…"   # Arbeitsplaylist
export NOVERA_GCAL_EMBED_URL="https://calendar.google.com/calendar/embed?src=…"
export NOVERA_DRIVE_URL="https://drive.google.com/drive/folders/…"
```

`NOVERA_LOGO_URL` musst du nicht setzen — der Builder leitet die Adresse des
Logos aus `NOVERA_CLOCK_URL` ab und setzt sie als Icon der HQ-Seite. Details in
[BRANDING.md](BRANDING.md).

Ist eine davon nicht gesetzt, entsteht an der Stelle ein orange markierter
Platzhalter mit der Anleitung — nichts geht kaputt, es fehlt nur der Inhalt.

### Flags

```bash
npm run build -- --no-seed    # ohne Beispieldaten
npm run build -- --no-views   # ohne Ansichten
npm run build:dry             # nichts schreiben, nur prüfen
```

---

## Schritt 4 — Live-Uhr veröffentlichen

Notion hat keine Uhr, die von selbst weiterläuft. Das Widget in `widget/` liefert
sie — zusammen mit dem Novera-Logo und der Wortmarke.

1. Im Repo: **Settings** → **Pages** → Source: **GitHub Actions**
2. Nach `main` pushen — der Workflow `pages.yml` veröffentlicht `widget/`
3. Die Seite liegt dann unter `https://clarknissen-lab.github.io/NoveraHQ/`
4. `NOVERA_CLOCK_URL` auf diese URL setzen und `npm run build` erneut laufen lassen —
   oder die URL direkt im HQ per `/embed` einfügen

Deutsche Beschriftung und 24-Stunden-Anzeige: `?lang=de` an die URL hängen.
Für 12-Stunden-Anzeige `?lang=de&h12=1`.

Sobald die Seite steht, liegt auch das Logo öffentlich unter
`…/brand/favicon.svg` — der Builder benutzt es als Seiten-Icon, sodass das
Novera-Monogramm in der Notion-Seitenleiste steht.

Unter derselben Adresse liegt der **Fokus-Timer** (`…/focus.html`). Auch den
bindet der Builder selbst ein, sobald `NOVERA_CLOCK_URL` gesetzt ist. Längen
lassen sich über die URL anpassen:

| URL | Ergebnis |
|---|---|
| `…/focus.html` | 25 Minuten Arbeit, 5 Pause, alle 4 Runden 15 Minuten |
| `…/focus.html?work=50&break=10` | 50 Minuten Arbeit, 10 Pause |
| `…/focus.html?work=25&break=5&long=20&every=3` | lange Pause schon nach 3 Runden |

---

## Schritt 5 — Rest von Hand

Fünf Dinge kann die Notion-API nicht. Sie stehen mit exakten Klicks in
**[MANUELL-EINZURICHTEN.md](MANUELL-EINZURICHTEN.md)**. Etwa 30 Minuten einmalig.

---

## Erneut bauen

Der Lauf ist wiederholbar. Angelegte IDs stehen in `.novera-state.json`; ein
zweiter Lauf überspringt, was schon existiert, und ergänzt nur Fehlendes. Nach
einem Abbruch — Netzfehler, Rate Limit — reicht ein erneutes `npm run build`.

**Komplett neu bauen:** `.novera-state.json` löschen und die alten Seiten in
Notion in den Papierkorb schieben. Ohne das Löschen entsteht ein zweiter
Satz Datenbanken.

---

## Prüflauf

```bash
npm run verify
```

Startet lokal einen Server, der sich wie die Notion-API verhält, lässt den
echten Builder komplett dagegen laufen und prüft danach das Ergebnis: sind alle
Relations da, sind die Gegenseiten entstanden, finden die Rollups ihre
Properties, passen die Filter zu den Property-Typen. Nützlich nach jeder
Änderung am Schema — und er braucht weder Token noch Internet.

---

## Wenn etwas klemmt

| Meldung | Ursache | Lösung |
|---|---|---|
| `object_not_found` | Elternseite nicht mit der Integration geteilt | Schritt 2.2 |
| `unauthorized` | Token falsch oder abgelaufen | Secret neu kopieren |
| `validation_error` bei Status | Workspace erlaubt keine Status-Properties über die API | Passiert automatisch: der Builder legt sie als Select an und meldet es |
| `restricted_resource` | *Insert content* fehlt | Capabilities in den Integration-Settings |
| `rate_limited` | zu viele Anfragen | Der Builder wartet und wiederholt selbst |
| Lauf bricht mittendrin ab | Netz | `npm run build` erneut — er setzt auf |

Der Builder bricht nicht beim ersten Problem ab. Was nicht durchgeht, sammelt er
und listet es am Ende unter **Hinweise** auf.
