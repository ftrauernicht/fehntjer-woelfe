# fehntjer-woelfe.de

Platzhalterseite der **Fehntjer Wölfe**, einer Nachwuchsmannschaft des
SV Grossefehn e.V. Sie verweist auf Instagram und auf die Vereinsadresse und
zeigt die Maskottchen der Mannschaft.

Die Seite wird **privat** betrieben und ist kein offizielles Angebot des
Vereins (siehe Impressum).

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **Vitest** + Testing Library + **jest-axe**
- **Vercel** als Hosting, DNS inbegriffen

## Loslegen

```bash
npm install
npm run dev          # http://localhost:3000
```

| Befehl | Tut |
|---|---|
| `npm run verify` | Lint, Typecheck und Tests – das volle Programm |
| `npm run test` | Tests im Watch-Modus |
| `npm run test:coverage` | Tests mit Abdeckungsbericht |
| `npm run build` | Produktions-Build |
| `npm run images` | Web-Fassungen der Bilder neu erzeugen |
| `npm run banner` | GitHub-Banner erzeugen (`docs/social-preview.png`) |

`npm run images` braucht die Originalbilder im Nachbarverzeichnis,
`npm run banner` lädt Schriften nach.

## Aufbau

```
src/
├─ app/
│  ├─ page.tsx              Startseite
│  ├─ bilder/page.tsx       Maskottchen-Galerie
│  ├─ impressum/            § 5 DDG
│  ├─ datenschutz/
│  ├─ robots.ts             Indexierungssperre
│  ├─ sitemap.ts
│  ├─ opengraph-image.tsx   Vorschaubild für geteilte Links
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

Texte gehören nach `src/content/site.ts`, nicht ins JSX. Die Altersklasse
steht dort als einzelne Konstante `ageGroup`.

## Betrieb

| | |
|---|---|
| Produktion | https://fehntjer-woelfe.de |
| Hosting und DNS | Vercel, Projekt `fehntjer-woelfe` |
| Deployment | automatisch bei jedem Push auf `main` |
| E-Mail | Strato, der MX zeigt dorthin |

Eine Umgebungsvariable ist nötig:

| Name | Wert |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://fehntjer-woelfe.de` |

Ohne sie hält sich die Seite aus dem Suchindex. Dasselbe gilt, solange das
Impressum Platzhalter enthält. Beides ist Absicht – siehe
[ADR 0001](docs/adr/0001-indexierungssperre.md).

## Tests

```bash
npm run test:coverage
```

Rund 100 Tests in acht Dateien:

| Datei | prüft |
|---|---|
| `seo.test.ts` | Canonicals, Titel, Open Graph und Twitter bleiben synchron |
| `indexierung.test.ts` | die Indexierungssperre über alle Umgebungsfälle |
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
Technisch ist gesetzt, was sich setzen lässt: saubere Canonicals,
strukturierte Daten (`SportsTeam`), Sitemap, Open Graph, `alternateName` für
beide Schreibweisen, semantisches Markup, schnelle Auslieferung.

**Das allein reicht nicht.** Eine Platzhalterseite mit wenigen Absätzen zieht
bei „SV Großefehn" nicht an der offiziellen Vereinsseite vorbei. Was hilft, in
dieser Reihenfolge:

1. **Den Link ins Instagram-Profil setzen.** Der einzige eingehende Link, über
   den die Mannschaft selbst verfügt.
2. **Inhalt ergänzen**, sobald es ihn gibt: Trainingszeiten, Anfahrt,
   Ansprechpartner, Spielberichte. Jeder echte Absatz zählt mehr als jede
   weitere Meta-Angabe.
3. **In der Google Search Console** die Sitemap einreichen.
4. **Beim Verein um einen Link bitten.**

Die Schreibweisen „Wölfe"/„Woelfe" und „Großefehn"/„Grossefehn" kommen
absichtlich beide im Seitentext vor, in ganzen Sätzen statt als Stichwortliste.
`inhalte.test.ts` hält fest, dass sie beim Umformulieren nicht verlorengehen.

## Dokumentation

| Ort | Inhalt |
|---|---|
| [`docs/adr/`](docs/adr/) | **Architekturentscheidungen** – warum etwas so ist, samt verworfener Alternativen |
| [`docs/infrastruktur.md`](docs/infrastruktur.md) | Was läuft wo, wen fragen. Nur öffentlich abfragbare Angaben |
| [`docs/dns-und-mail.md`](docs/dns-und-mail.md) | DNS-Zone und Mail-Authentifizierung als Betriebsanleitung |
| [`docs/markenleitfaden.md`](docs/markenleitfaden.md) | Farben, Maskottchen, Regeln für Bild- und Textgenerierung |
| [`SECURITY.md`](SECURITY.md) | Meldeweg für Sicherheitsprobleme |

**Dieses README beschreibt den Stand der Dinge, keine Historie.** Was sich
geändert hat und warum, gehört in ein ADR.

Das Repo-Banner erzeugt `npm run banner`. GitHub bietet dafür keine API – die
Datei wird von Hand unter **Settings → General → Social preview** gesetzt.

## Rechtliches

- **Impressum:** privat betriebene Seite, Verantwortlicher und vollständige
  ladungsfähige Anschrift nach § 5 DDG in `src/content/site.ts`.
- **Vereinswappen:** Das Wappen des SV Grossefehn e.V. ist eine fremde Marke.
  Die Verwendung auf einer privaten Mannschaftsseite ist üblich, sollte aber
  mit dem Verein abgestimmt sein.
- **Bilder:** Die Maskottchen-Bilder sind KI-generiert. Das steht sichtbar auf
  der Bilderseite und im Impressum.
- **Datenschutz:** keine Cookies, keine Analyse, keine eingebetteten fremden
  Inhalte. Nur Vercel-Serverlogs und das Strato-Postfach.
