# Branding

Das HQ benutzt die echten Markenmittel von Novera Studio — nichts wird
nachgebaut oder angenähert.

Herkunft: `clarknissen-lab/noverastudio` (`images/`, `fonts/`, `css/novera.css`).

---

## Was übernommen wurde

| Datei in `widget/brand/` | Herkunft | Verwendung |
|---|---|---|
| `logo-light.svg` | `images/logo-light.svg` | Wortmarke, inline im Widget |
| `logo-dark.svg` | `images/logo-dark.svg` | Wortmarke für hellen Hintergrund |
| `emblem.svg` | `images/emblem.svg` | Monogramm ohne Schriftzug |
| `favicon.svg` | `images/favicon.svg` | Seiten-Icon in Notion, Browser-Tab |
| `inter-latin.woff2` | `fonts/` | Fließtext |
| `instrument-serif-latin.woff2` | `fonts/` | Uhrzeit |

---

## Farben

Direkt aus `css/novera.css` übernommen, nicht geschätzt:

```
Flächen      --void      #08090B     --carbon    #0C0E12
             --slate     #12151A     --elevated  #171B21

Schrift      --platinum  #E9ECEF     --silver    #98A1AD
             --muted     #939CA8

Linien       --line         rgba(255,255,255,.08)
             --line-strong  rgba(255,255,255,.16)

Schimmer     --glow         rgba(150,180,215,.30)

Chrom        #FFFFFF → #C3CAD4 → #868E99 → #FFFFFF → #B4BCC6 → #E8ECF1
```

Der Chrom-Verlauf liegt auf Logo und Uhrzeit — dort, wo im Webauftritt auch die
Überschriften liegen.

**Die Marke ist monochrom.** Kein Orange, kein Blau als Akzent, nur Graphit,
Silber und ein kühler Schimmer im Licht. Die frühere Fassung des Widgets hatte
einen orangen Akzent — der war geraten und ist raus.

---

## Wo Farbe im Workspace trotzdem vorkommt

Drei Stellen, bewusst:

1. **Statusfarben** in den Datenbanken (rot für High Priority, grün für Done,
   gelb für Waiting). Das ist Bedeutung, kein Schmuck — ein monochromes
   Statusfeld wäre unlesbar.
2. **Orange Kästen mit 🔧.** Das sind die Stellen, an denen noch ein Handgriff
   fehlt. Sie sollen auffallen und verschwinden, sobald sie erledigt sind.
3. **Emojis als Seitensymbole** in der Seitenleiste. Ein Symbol je Bereich,
   damit die Navigation auf einen Blick funktioniert.

Der Fortschritt der Projekte läuft als Punktreihe (`●●●●●●○○○○ 60 %`) statt als
Blockbalken — im Dunkelmodus deutlich ruhiger. Die Sektionsköpfe im Workspace
sind Überschriften mit getöntem Hintergrund, nicht Callouts: so bleiben sie für
Inhaltsverzeichnis, Suche und Mobilansicht echte Gliederung.

Wenn du Punkt 3 lieber ganz monochrom hättest: Notion hat einen eigenen Satz
einfarbiger Strichsymbole. Seite öffnen → auf das Icon klicken → Reiter **Icons**
→ Farbe **Gray**. Zwei Klicks je Seite. Der Builder setzt sie nicht automatisch,
weil die Notion-API die gültigen Symbolnamen nicht veröffentlicht — geratene
Namen würden den Lauf abbrechen lassen.

---

## Logo als Seiten-Icon

Sobald das Widget über GitHub Pages veröffentlicht ist, liegt das Logo unter:

```
https://clarknissen-lab.github.io/NoveraHQ/brand/favicon.svg
```

Der Builder leitet diese Adresse selbst aus `NOVERA_CLOCK_URL` ab und setzt sie
als Icon der HQ-Seite — das Novera-Monogramm steht dann in der Seitenleiste.

Eigene Adresse:

```bash
export NOVERA_LOGO_URL="https://…/mein-logo.svg"
```

Ist keine gesetzt, bekommt das HQ ein `◆` und der Builder weist am Ende darauf hin.

> Notion lädt externe Icons über seinen eigenen Zwischenspeicher. Eine URL, die
> ein Login verlangt, funktioniert deshalb nicht — GitHub Pages ist öffentlich
> und damit der einfachste Weg.

---

## Die beiden Widgets

| Datei | Was |
|---|---|
| `widget/index.html` | Header: Logo, Wortmarke, Analoguhr, Digitaluhr, Wochentag, Datum |
| `widget/focus.html` | Fokus-Timer: 25/5, Ring als Fortschritt, Rundenzähler |

Beide sind eigenständig — keine externen Aufrufe, keine Schriften von fremden
Servern. Der Chrom-Verlauf liegt auf Logo und Zeitanzeige.

Die Analoguhr hat bewusst keine Ziffern: die genaue Zeit steht daneben, das
Zifferblatt liefert nur den Blick fürs Ungefähre. Stunden- und Minutenzeiger
laufen weich mit, damit 10:30 nicht aussieht, als stünde der Stundenzeiger
exakt auf der 10.

Der Timer rechnet mit einem Zeitstempel statt mit einem Zähler. Deshalb stimmt
die Restzeit auch dann noch, wenn der Tab im Hintergrund lag oder der Rechner
geschlafen hat.

## Der Header

Liegt `NOVERA_CLOCK_URL` vor, trägt das Widget Logo, Wortmarke, Untertitel und
Uhr. Die Seite bekommt dann **keine** zusätzliche Überschrift — das wäre
dieselbe Aussage zweimal.

Ohne Widget-URL entsteht stattdessen eine schlichte Überschrift plus ein Hinweis,
was noch fehlt.

Sprache und Zeitformat steuerst du über die URL:

| URL | Ergebnis |
|---|---|
| `…/` | Browsersprache, in Deutschland 24 Stunden |
| `…/?lang=de` | Deutsch, 24 Stunden |
| `…/?lang=en` | Englisch, 12 Stunden |
| `…/?lang=de&h12=1` | Deutsch, 12 Stunden |

---

## Wenn sich die Marke ändert

Die Dateien in `widget/brand/` sind Kopien, keine Verweise. Ändert sich das Logo
im Hauptprojekt, kopierst du sie neu:

```bash
cp ../noverastudio/images/{logo-light,logo-dark,emblem,favicon}.svg widget/brand/
cp ../noverastudio/fonts/{inter-latin,instrument-serif-latin}.woff2 widget/brand/
```

Die Wortmarke ist zusätzlich in `widget/index.html` eingebettet, damit sie ohne
zweiten Netzwerkaufruf erscheint. Die Verlaufsstopps hängen dort an
CSS-Variablen — dieselbe Datei bedient Hell- und Dunkelmodus. Ändert sich der
Pfad des Logos, muss auch dieser eingebettete Block angepasst werden.
