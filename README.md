# fehntjer-woelfe.de

Platzhalterseite der **Fehntjer Wölfe**, einer Nachwuchsmannschaft des
SV Grossefehn e.V. Bis die richtige Seite steht, verweist sie auf Instagram und
auf die Vereinsadresse – und zeigt die Maskottchen der Mannschaft.

Die Seite wird **privat** betrieben und ist kein offizielles Angebot des
Vereins (siehe Impressum).

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **Vitest** + Testing Library + **jest-axe**
- **Vercel** als Hosting

## Loslegen

```bash
npm install
npm run dev          # http://localhost:3000
```

Weitere Befehle:

```bash
npm run verify       # lint + typecheck + tests, das volle Programm
npm run test         # Tests im Watch-Modus
npm run test:coverage
npm run build
npm run images       # Web-Fassungen der Bilder neu erzeugen
```

`npm run images` braucht die Originalbilder im Nachbarverzeichnis. Sie liegen
bewusst nicht im Repository (siehe unten).

## Aufbau

```
src/
├─ app/
│  ├─ page.tsx              Startseite
│  ├─ bilder/page.tsx       Maskottchen-Galerie
│  ├─ impressum/            § 5 DDG
│  ├─ datenschutz/
│  ├─ robots.ts             Indexierungssperre – siehe unten
│  ├─ sitemap.ts
│  ├─ opengraph-image.tsx   Vorschaubild, zur Laufzeit erzeugt
│  └─ icon.png              Favicon, aus dem Wappen erzeugt
├─ components/
├─ content/
│  ├─ site.ts               alle Stammdaten und Texte
│  └─ gallery.json          Bildliste, von App und Skript gelesen
├─ lib/
│  ├─ seo.ts                Metadaten an einer Stelle
│  └─ schema.ts             strukturierte Daten
└─ proxy.ts                 Content-Security-Policy mit Nonce
```

---

## Architekturentscheidungen

Vier Entscheidungen, die man nicht aus dem Code allein ablesen kann.

### 1. Die Seite sperrt sich selbst aus dem Suchindex

`robots.ts` gibt die Indexierung nur frei, wenn **beides** stimmt:

1. `NEXT_PUBLIC_SITE_URL` ist auf die echte Domain gesetzt – sonst würde die
   `*.vercel.app`-Adresse indexiert und später als Duplikat gegen die echte
   Domain antreten.
2. Das Impressum enthält keine Platzhalter mehr – eine indexierte Seite ohne
   vollständige Anbieterkennzeichnung ist nach § 5 DDG angreifbar.

Das ist eine Sicherung, keine Schikane: beide Fehler sind teuer und fallen
sonst erst auf, wenn es zu spät ist. Was zu tun ist, steht in
[`docs/dns-und-mail.md`](docs/dns-und-mail.md).

### 2. CSP mit Nonce statt statischer Header – und der Preis dafür

Next.js schreibt beim Rendern Inline-Skripte in die Seite. Eine CSP ohne Nonce
bräuchte `script-src 'unsafe-inline'` und wäre als XSS-Schutz wertlos. Deshalb
erzeugt `src/proxy.ts` pro Anfrage einen Nonce.

**Der Preis:** Seiten mit Nonce müssen dynamisch gerendert werden; statisches
Ausliefern aus dem CDN entfällt. Bei vier Seiten ist das vernachlässigbar. Wer
die Seite später stark ausbaut, sollte diese Entscheidung noch einmal
anschauen.

In Next 16 heißt diese Datei `proxy.ts`, nicht mehr `middleware.ts`.

### 3. Originalbilder liegen nicht im Repository

Die Maskottchen-Bilder sind KI-generierte 2K-PNGs mit je rund 2 MB. Eingecheckt
sind nur die Web-Fassungen (WebP, zusammen etwa 0,8 MB) in `public/bilder/`.
`scripts/optimize-images.mjs` erzeugt sie aus den Originalen.

Die Auswahl in `src/content/gallery.json` ist handgeprüft. Aussortiert wurden
Motive mit falscher Figurenbesetzung, mit braunen statt blauen Augen und mit
verunglückten Wappen. **Wer die Liste erweitert, sieht sich das neue Bild
vorher an.**

Dass die Bilder KI-generiert sind, steht sichtbar auf der Bilderseite und im
Impressum.

### 4. Tailwind braucht in `next.config.ts` einen Eintrag

Ohne den `turbopack.rules`-Block wird `@import "tailwindcss"` nicht
verarbeitet. Der Build meldet das nur als Warnung („Unknown at rule: @theme"),
liefert aber eine Stylesheet-Datei ohne eine einzige Utility-Klasse aus – die
Seite rendert dann völlig ungestylt. Der Eintrag muss bleiben.

---

## Tests

```bash
npm run test:coverage
```

Rund 100 Tests in acht Dateien. Schwerpunkte:

| Datei | prüft |
|---|---|
| `seo.test.ts` | Canonicals, Titel, Open Graph und Twitter bleiben synchron |
| `indexierung.test.ts` | die Sperre aus Entscheidung 1, inklusive aller Umgebungsfälle |
| `inhalte.test.ts` | Stammdaten, Sitemap, Galerie, Schreibvarianten des Namens |
| `seiten.test.tsx` | jede Route rendert, Links tragen die richtigen Attribute |
| `sicherheit.test.ts` | CSP-Direktiven und Sicherheits-Header |
| `a11y.test.tsx` | axe über alle Seiten, Überschriften-Hierarchie |
| `layout.test.tsx` | Metadaten, Fußbereich |
| `json-ld.test.tsx` | gültiges JSON-LD, kein Ausbruch aus dem `<script>` |

Die Coverage-Schwellen stehen in `vitest.config.mts`; der Lauf schlägt fehl,
wenn sie unterschritten werden.

`a11y.test.tsx` ersetzt keine Prüfung mit echten Hilfsmitteln – axe findet
etwa 30 bis 40 Prozent der üblichen Probleme. Aber es findet sie bei jedem
Lauf.

## CI

`.github/workflows/ci.yml` läuft bei jedem Push und Pull Request: Lint,
Typecheck, Tests mit Abdeckung, Produktions-Build, dazu `npm audit`.
`codeql.yml` ergänzt eine wöchentliche statische Analyse. Dependabot fasst
kleine Versionssprünge zu einem wöchentlichen Pull Request zusammen.

Alle Workflows laufen mit `contents: read`; nur der CodeQL-Job darf in den
Sicherheitsbereich schreiben.

## Suchmaschinen

Ziel ist, bei „Fehntjer Wölfe" und bei „SV Großefehn" gefunden zu werden.
Technisch ist alles gesetzt, was man setzen kann: saubere Canonicals,
strukturierte Daten (`SportsTeam`), Sitemap, Open Graph, `alternateName` für
beide Schreibweisen, semantisches Markup, schnelle Auslieferung.

**Das allein reicht nicht.** Eine Platzhalterseite mit wenigen Absätzen
konkurriert bei „SV Großefehn" mit der offiziellen Vereinsseite und wird dort
nicht vorbeiziehen. Was wirklich hilft, in dieser Reihenfolge:

1. **Den Link ins Instagram-Profil setzen.** Der einzige eingehende Link, über
   den die Mannschaft selbst verfügt.
2. **Inhalt ergänzen**, sobald es ihn gibt: Trainingszeiten, Anfahrt zum
   Sportplatz, Ansprechpartner, Spielberichte. Jeder echte Absatz zählt mehr
   als jede weitere Meta-Angabe.
3. **In der Google Search Console** die Sitemap einreichen.
4. **Beim Verein um einen Link bitten.** Ein Link von der offiziellen
   Vereinsseite auf die Mannschaftsseite ist thematisch passend und damit
   wertvoll.

Die Schreibweisen „Wölfe"/„Woelfe" und „Großefehn"/„Grossefehn" kommen
absichtlich beide im Seitentext vor, in ganzen Sätzen statt als Stichwortliste.
`inhalte.test.ts` hält fest, dass sie beim Umformulieren nicht verloren gehen.

## Markenleitfaden

[`docs/markenleitfaden.md`](docs/markenleitfaden.md) ist das Nachschlagewerk
für alles Gestalterische – geschrieben für Menschen **und für KI-Modelle**:
gemessene Farbwerte, verbindliche Schreibweisen, die festen Beschreibungen
beider Maskottchen, Regeln für Bildgenerierung, Tonfall und Mottos, dazu eine
Checkliste vor der Veröffentlichung.

Wer ein neues Logo, Motiv oder Motto erzeugen lässt, liest das vorher.

## Rechtliches

- **Impressum:** privat betriebene Seite, Verantwortlicher siehe
  `src/content/site.ts`. Straße und Ort sind noch einzutragen.
- **Vereinswappen:** Das Wappen des SV Grossefehn e.V. ist eine fremde Marke.
  Die Verwendung auf einer privaten Mannschaftsseite ist üblich, sollte aber
  einmal mit dem Verein abgestimmt werden.
- **Datenschutz:** keine Cookies, keine Analyse, keine eingebetteten fremden
  Inhalte. Nur Vercel-Serverlogs und das Strato-Postfach.
