# Sicherheit

## Eine Lücke melden

Wenn Sie ein Sicherheitsproblem an dieser Seite oder an diesem Repository
finden: **bitte nicht als öffentliches Issue.** Schreiben Sie an
`mail@fehntjer-woelfe.de` oder nutzen Sie bei GitHub die private Meldung unter
*Security → Report a vulnerability*.

Es ist eine private Platzhalterseite für eine Kinderfußballmannschaft, kein
Produkt mit Bereitschaftsdienst. Eine Antwort kann ein paar Tage dauern. Ein
Dankeschön gibt es trotzdem.

## Was die Seite tut – und was nicht

Die Angriffsfläche ist bewusst klein:

- **Keine Formulare, keine Anmeldung, keine Datenbank.** Es gibt nichts
  einzugeben.
- **Keine Cookies, kein Tracking, keine eingebetteten fremden Inhalte.**
- **Keine Nutzerdaten.** Die einzige Verarbeitung sind Server-Logs beim
  Hoster, siehe Datenschutzerklärung.

## Getroffene Maßnahmen

| Maßnahme | Wo |
|---|---|
| Content-Security-Policy mit Nonce pro Anfrage, kein `unsafe-inline` | `src/proxy.ts` |
| HSTS, `X-Content-Type-Options`, `X-Frame-Options`, Permissions-Policy, COOP | `next.config.ts` |
| `X-Powered-By` entfernt | `next.config.ts` |
| Externe Links mit `noopener noreferrer` | geprüft in `tests/seiten.test.tsx` |
| JSON-LD gegen Ausbruch aus dem `<script>` abgesichert | geprüft in `tests/json-ld.test.tsx` |
| Abhängigkeiten: `npm audit` und CodeQL bei jedem Lauf, Dependabot wöchentlich | `.github/workflows/` |
| Workflows mit `contents: read`, nur CodeQL darf schreiben | `.github/workflows/` |

Die Sicherheits-Header und CSP-Direktiven sind nicht nur gesetzt, sondern in
`tests/sicherheit.test.ts` festgeschrieben. Wer sie abschwächt, bricht die
Tests.

## Infrastruktur

Was wo läuft, steht in [`docs/infrastruktur.md`](docs/infrastruktur.md) –
bewusst nur das, was ohnehin öffentlich abfragbar ist. Zugangsdaten und
Kundennummern stehen dort nicht.
