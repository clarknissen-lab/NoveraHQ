# Novera Studio OS

Ein Notion-Workspace als Business Command Center — aufgebaut über die Notion-API,
nicht von Hand geklickt.

```bash
npm install
export NOTION_TOKEN="ntn_..."
export NOTION_PARENT_PAGE="<seiten-id>"
npm run build
```

---

## Was entsteht

| | |
|---|---|
| **11 Datenbanken** | Clients · Projects · Tasks · Invoices · Expenses · Client Access · Website Requirements · Client Communication · Ideas · Notes · Knowledge |
| **150 Properties** | inklusive 15 Relationspaare, 15 Formeln, 10 Rollups |
| **50 Ansichten** | Today, Overdue, High Priority, Follow Up, Pipeline, Timeline … |
| **7 Seiten** | HQ · Finance · Client Records · Calendar · Files · Google Workspace · Business Tools |
| **Beispieldaten** | ein Musterkunde mit Projekt, Aufgaben, Rechnungen, Zugängen und Anforderungen |

Dazu zwei Widgets in `widget/`, veröffentlicht über GitHub Pages und in Notion
eingebettet: der **Header** mit Novera-Logo, Analog- und Digitaluhr, Wochentag
und Datum — und ein **Fokus-Timer** (25/5, anpassbar über die URL). Logo, Farben
und Schriften stammen unverändert aus dem Novera-Studio-Webauftritt.

---

## Zuständigkeiten

Jede Information hat genau einen Ort. Das ist die Regel, aus der sich der ganze
Aufbau ergibt.

| Werkzeug | Zuständig für |
|---|---|
| **Notion** | HQ, CRM, Projekte, Aufgaben, Anforderungen, Wissen, Notizen |
| **Google Workspace** | Mail, Kalender, Dateien, Dokumente, Meetings |
| **Papierkram** | Buchhaltung, Rechnungsstellung, Belege, Steuer |
| **1Password** | Passwörter, Passkeys, Recovery Codes |

In Notion steht **nie** ein Passwort. Die Property `Password` in *Client Access*
ist eine feste Formel — sie lässt sich nicht überschreiben.

---

## Dokumentation

| Datei | Inhalt |
|---|---|
| [docs/NOTION-VERBINDEN.md](docs/NOTION-VERBINDEN.md) | Die zwei Wege, Notion anzubinden — und welcher wofür taugt |
| [docs/SETUP.md](docs/SETUP.md) | Von null zum fertigen Workspace, ~10 Minuten |
| [docs/MANUELL-EINZURICHTEN.md](docs/MANUELL-EINZURICHTEN.md) | Was die API nicht kann — mit exakten Klicks, ~30 Minuten |
| [docs/DATENMODELL.md](docs/DATENMODELL.md) | Datenbanken, Relations, Formeln und warum sie so aussehen |
| [docs/BRANDING.md](docs/BRANDING.md) | Logo, Farben und Schriften — Herkunft und Verwendung |
| [docs/1PASSWORD.md](docs/1PASSWORD.md) | Vault-Struktur und Übernahme von Kundenzugängen |
| [docs/QUALITAETSKONTROLLE.md](docs/QUALITAETSKONTROLLE.md) | Jede Anforderung mit dem Ort, an dem sie sitzt |

---

## Aufbau des Repos

```
scripts/
  build-notion.mjs      Ablauf: Seiten → Datenbanken → Relations → Formeln
                        → Rollups → Ansichten → Beispieldaten → Dashboard
  verify.mjs            Prüflauf gegen einen nachgebauten Notion-Server
  lib/
    schema.mjs          die 11 Datenbanken, in fünf Durchläufen
    views.mjs           die 50 Ansichten mit Filtern und Sortierungen
    pages.mjs           HQ-Dashboard, Kundenakte, Projektseite, Bereichsseiten
    blocks.mjs          Notion-Blockbausteine
    notion.mjs          Client, Wiederholversuche, State, Fehler-Isolation
    seed.mjs            Beispieldaten
widget/
  index.html            Header: Logo, Analoguhr, Digitaluhr, Datum
  focus.html            Fokus-Timer, 25/5, über URL-Parameter anpassbar
  brand/                Logo, Emblem, Favicon und die beiden Marken-Schriften
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
