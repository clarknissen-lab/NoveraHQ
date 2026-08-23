# 1Password-Struktur

Notion dokumentiert, **dass** ein Zugang existiert. 1Password speichert **ihn**.
Diese Trennung ist der einzige Grund, warum in Notion nie ein Passwort steht.

---

## Warum keine Passwörter in Notion

Notion ist nicht dafür gebaut:

- Der Inhalt liegt bei Notion unverschlüsselt — Mitarbeitende des Anbieters
  könnten technisch darauf zugreifen
- Jeder Gast, der irgendwann Zugriff auf eine Seite bekommt, sieht alles darauf
- Ein versehentlich geteilter Link macht die Seite öffentlich
- Die Volltextsuche findet Passwörter zuverlässig — auch für Leute, die sie nicht suchen
- Es gibt keine Historie, kein Ablaufdatum, keine Warnung bei Datenlecks

Deshalb ist die Property `Password` in **Client Access** eine feste Formel mit dem
Text `🔐 Stored in 1Password`. Sie lässt sich nicht überschreiben — auch nicht
versehentlich, auch nicht schnell mal eben.

---

## Vault-Struktur

1Password trennt über **Vaults**. Empfohlen sind zwei:

```
NOVERA — INTERNAL          eigene Zugänge
├── Google Workspace
├── Domain-Registrar
├── Hosting
├── Notion
├── Papierkram
├── Social Media
├── Bank / Zahlungsanbieter
└── Steuerberatung

NOVERA — CLIENTS           alles, was Kunden gehört
├── Muster GmbH
│   ├── Hostinger
│   ├── Domain
│   ├── WordPress
│   ├── Google Business
│   └── Meta Business
├── Beispiel Handwerk
└── …
```

**Warum zwei Vaults und nicht einer:** Wenn du später jemanden ins Boot holst —
Werkstudent, Freelancer, Partner — gibst du `NOVERA — CLIENTS` frei und behältst
deine eigenen Zugänge für dich. Nachträglich Einträge auseinanderzusortieren ist
deutlich mühsamer.

Kunden sortierst du innerhalb eines Vaults nicht über Ordner (die gibt es nicht),
sondern über **Tags**: ein Tag je Kunde, exakt so geschrieben wie in Notion.

---

## Namenskonvention

Damit Notion und 1Password ohne Nachdenken zusammenpassen:

```
<Kunde> — <Dienst>
```

Beispiele:

```
Muster GmbH — Hostinger
Muster GmbH — WordPress
Muster GmbH — Google Business
Novera Studio — Domain-Registrar
```

In Notion trägst du denselben Pfad in **Password Manager Reference** ein:

```
1Password → Clients → Muster GmbH → Hostinger
```

Damit ist der Sprung von Notion zum Eintrag eine Suche, kein Suchen.

---

## Was in welchen Eintrag gehört

| Feld in 1Password | Inhalt |
|---|---|
| Title | `<Kunde> — <Dienst>` |
| Username | wie in Notion unter *Username / Email* |
| Password | das Passwort |
| Website | die Login-URL, damit das Autofill greift |
| One-Time Password | den 2FA-Seed hier, nicht in einer separaten App |
| Notes | Recovery Codes, Sicherheitsfragen, Besonderheiten |
| Tags | Kundenname |

**Recovery Codes gehören in dieselbe Notiz.** Verstreut auf Screenshots im
Download-Ordner sind sie im Ernstfall genau dann weg, wenn man sie braucht.

---

## Zugänge von Kunden übernehmen

Der häufigste Fehler im Alltag: Der Kunde schickt Zugangsdaten per WhatsApp.

Ablauf, der das sauber löst:

1. Kunden bitten, den Zugang über einen **1Password-Freigabelink** zu senden
   (funktioniert auch, wenn der Kunde selbst kein 1Password hat)
2. Alternativ: Kunde legt dich als eigenen Nutzer im Dienst an — dann brauchst du
   sein Passwort nie
3. Kam es doch per Mail oder Chat: Passwort danach ändern und die Nachricht löschen
4. Eintrag in 1Password anlegen, in Notion **Client Access** dokumentieren
5. 2FA aktivieren, Recovery Codes sichern

Die Schritte stehen auch im Workspace unter **Knowledge → Zugänge sicher übernehmen**.

---

## Regelmäßig prüfen

In Notion gibt es dafür die Ansicht **Client Access → No 2FA**. Einmal im Monat
durchgehen und nachziehen. In 1Password übernimmt **Watchtower** den Rest:
schwache Passwörter, Mehrfachverwendung, bekannte Datenlecks.
