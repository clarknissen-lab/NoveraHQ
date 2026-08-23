# Novera HQ

Die Arbeitszentrale von Novera Studio als Notion-Workspace — aufgebaut über die
Notion-API, nicht von Hand geklickt.

Grundsatz: **so einfach wie möglich, so umfangreich wie nötig.**

```bash
npm install
cp .env.example .env     # Token und Seiten-URL eintragen
npm run check            # sagt dir, ob alles passt
npm run build
```

---

## Was entsteht

| | |
|---|---|
| **9 Datenbanken** | Leads · Kunden · Projekte · Websites · Website Blueprints · Angebote · Aufgaben · Hosting & Domains · Zugänge |
| **150 Properties** | inklusive 12 Relationspaare, 16 Formeln, 5 Rollups |
| **49 Ansichten** | Heute · Überfällig · Heute kontaktieren · Angebote offen · Domainverlängerungen · Trichter … |
| **5 Seiten** | HQ · Novera Tools · Novera AI · Dokumente · System |
| **Ambiente-Licht** | Cover, getönte Sektionsbänder, weiche Lichtwolken — abschaltbar über `NOVERA_AMBIENT=off` |
| **Beispieldaten** | der komplette Ablauf: Lead, gewonnener Kunde, Projekt, Website, Blueprint, Angebot, Hosting, Zugänge |

Dazu zwei Widgets in `widget/`, veröffentlicht über GitHub Pages und in Notion
eingebettet: der **Header** mit Novera-Logo, Analog- und Digitaluhr, Wochentag
und Datum — und ein **Fokus-Timer** (25/5, anpassbar über die URL). Logo, Farben
und Schriften stammen unverändert aus dem Novera-Studio-Webauftritt.

---

## Der Ablauf, den das HQ abbildet

```
Lead  →  Qualifiziert  →  Erstkontakt  →  Angebot  →  Gewonnen
                                                          ↓
   Novera Care  ←  Hosting  ←  Live  ←  Abnahme  ←  Website  ←  Projekt
```

## Zuständigkeiten

Jede Information hat genau einen Ort. Das ist die Regel, aus der sich der ganze
Aufbau ergibt.

| Werkzeug | Zuständig für |
|---|---|
| **Notion** | Leads, Kunden, Projekte, Websites, Blueprints, Angebote, Aufgaben, Hosting |
| **Google Drive** | alle Dateien — Notion hält nur den Ordnerlink |
| **Papierkram** | Buchhaltung, Rechnungen, Belege, Steuer |
| **1Password** | Passwörter, Passkeys, Recovery Codes |

Deshalb gibt es in Notion **keine Finanzdatenbank** und **kein einziges Passwort**.
Die Property `Passwort` in *Zugänge* ist eine feste Formel — sie lässt sich nicht
überschreiben.

---

## Dokumentation

| Datei | Inhalt |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Von null zum fertigen Workspace, Schritt für Schritt |
| [docs/NOTION-VERBINDEN.md](docs/NOTION-VERBINDEN.md) | Die zwei Wege, Notion anzubinden — und welcher wofür taugt |
| [docs/MANUELL-EINZURICHTEN.md](docs/MANUELL-EINZURICHTEN.md) | Was die API nicht kann — mit exakten Klicks, ~30 Minuten |
| [docs/DATENMODELL.md](docs/DATENMODELL.md) | Datenbanken, Relations, Formeln und warum sie so aussehen |
| [docs/BRANDING.md](docs/BRANDING.md) | Logo, Farben und Schriften — Herkunft und Verwendung |
| [docs/1PASSWORD.md](docs/1PASSWORD.md) | Vault-Struktur und Übernahme von Kundenzugängen |
| [docs/QUALITAETSKONTROLLE.md](docs/QUALITAETSKONTROLLE.md) | Jede Anforderung mit dem Ort, an dem sie sitzt |

---

## Aufbau des Repos

```
scripts/
  check.mjs             Verbindungstest: Node, .env, Token, Seite, Schreibrecht
  build-notion.mjs      Ablauf: Seiten → Datenbanken → Relations → Formeln
                        → Rollups → Ansichten → Beispieldaten → Dashboard
  verify.mjs            Prüflauf gegen einen nachgebauten Notion-Server
  lib/
    schema.mjs          die 9 Datenbanken, in fünf Durchläufen
    views.mjs           die 49 Ansichten mit Filtern und Sortierungen
    pages.mjs           Dashboard, Kundenakte, Projekt-, Blueprint- und Angebotsvorlage
    blocks.mjs          Notion-Blockbausteine
    notion.mjs          Client, Wiederholversuche, State, Fehler-Isolation
    seed.mjs            Beispieldaten
    env.mjs             liest .env, damit keine Umgebungsvariablen nötig sind
widget/
  index.html            Header: Logo, Analoguhr, Digitaluhr, Datum
  focus.html            Fokus-Timer, 25/5, über URL-Parameter anpassbar
  brand/                Logo, Emblem, Favicon, Ambiente-Cover, Marken-Schriften
```

---

## Prüflauf

```bash
npm run verify
```

Startet lokal einen Server, der sich wie die Notion-API verhält, lässt den echten
Builder komplett dagegen laufen und prüft danach das Ergebnis — Relations,
Gegenseiten, Rollup-Ziele, Filtertypen, Blocklimits. Ohne Token, ohne Internet.

---

## Wiederholte Läufe

Angelegte IDs stehen in `.novera-state.json`. Ein zweiter Lauf überspringt, was
schon existiert, und ergänzt nur Fehlendes — nach einem Netzfehler reicht also
ein erneutes `npm run build`.
