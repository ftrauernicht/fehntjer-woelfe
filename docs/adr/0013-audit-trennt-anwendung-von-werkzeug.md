# 0013 – Die Schwachstellenprüfung trennt Anwendung von Werkzeug

Akzeptiert · 25.11.2026

## Kontext

Die CI brach bisher mit `npm audit --audit-level=moderate` ab. Die Begründung
im Workflow lautete: die Produktionsabhängigkeiten sind wenige, ein Treffer ist
also fast immer echt.

Der Satz stimmt. Der Aufruf prüft aber nicht nur sie. `npm audit` nimmt ohne
`--omit=dev` alles mit, was im Baum hängt, und das ist bei einer Next-Anwendung
zum überwiegenden Teil Werkzeug: eslint, typescript-eslint, vitest und was
daran hängt.

Am 16.11.2026 ist daraus ein Schaden geworden. Dependabots gesammelter
Patch-und-Minor-Lauf (#14) lief auf Rot und blieb liegen. Gemessen am
Stand vom 25.11.2026:

| | Funde | wo |
|---|---|---|
| gesamt | 10 moderat | |
| davon ausgeliefert | 1 Paket, 7 Hinweise | `next` 16.4.3 |
| davon nur Werkzeug | 9 | `eslint-config-next` → `typescript-eslint` → `@typescript-eslint/*`, `eslint` → `minimatch` |

Der eine ausgelieferte Fund war `next` selbst, mit sieben Hinweisen gegen
`>=16.0.0 <=16.4.4`: Informationsabfluss über Root-Parameter, Cache-Leaks
zwischen Nutzern, Umgehung der SVG-Sperre in der Bildoptimierung, HttpOnly-
Cookies in einem internen Antwort-Header. Behoben in 16.4.6.

**Und genau auf 16.4.6 hob der blockierte Pull Request.** Das Tor hat neun
Tage lang die Behebung aufgehalten, für die es gebaut wurde, wegen Funden in
einer Kette, die keine Besucheranfrage je berührt.

## Entscheidung

Die Prüfung läuft über `scripts/pruefe-abhaengigkeiten.mjs` und wendet zwei
Maßstäbe an:

- **Ausgeliefertes** (`npm audit --omit=dev`) bricht ab **moderat** ab. Dort
  gilt die ursprüngliche Begründung unverändert.
- **Nur Werkzeuge** (alles Übrige) wird vollständig ausgegeben und bricht erst
  ab **hoch** ab.

Eine Ausnahme braucht GHSA-Kennung, Grund und Datum und steht im Skript. Wird
ein Fund nicht mehr gemeldet, sagt der Lauf, dass die Ausnahme wegkann.

Der Jobname in der CI bleibt „Abhängigkeiten auf Schwachstellen prüfen". Der
Auto-Merge-Workflow zählt die Prüfungen über ihre Namen.

## Alternativen

**`--omit=dev` an den bestehenden Aufruf hängen.** Verworfen. Damit sieht
niemand mehr, was in der Werkzeugkette steckt. Ein hoher Fund in einem
Build-Werkzeug ist kein Alltag, aber auch nichts, worüber die CI schweigen
sollte: wer die Anwendung baut, führt diesen Code aus.

**Die Grenze pauschal auf `high` heben.** Verworfen. Die sieben Next-Hinweise
sind moderat eingestuft. Genau sie hätten dann niemanden mehr erreicht, und
die Prüfung wäre still geworden, statt genauer.

**Ausnahmeliste wie in `frank-trauernicht-de`, ohne Trennung.** Dort fängt eine
datierte Ausnahmeliste hohe Funde ab. Das passt für eine Astro-Seite mit sehr
kleinem Baum. Hier wären neun Einträge nötig gewesen, für Pakete, die mit dem
nächsten Dependabot-Lauf ohnehin verschwinden – gepflegte Listen, die niemand
liest. Die Liste bleibt trotzdem im Skript, für den Einzelfall.

**Nichts tun und den Pull Request von Hand zusammenführen.** Verworfen. Beim
nächsten Mal steht dieselbe Entscheidung wieder an, und dann vielleicht an
einem Tag ohne Zeit.

## Konsequenzen

- Nach dem Zusammenführen von #14 ist der ausgelieferte Teil sauber; es bleibt
  ein moderater Fund in `minimatch`, der gemeldet wird und nicht blockiert.
- `main` ist bis dahin rot, und das ist richtig: Die Hinweise an `next` sind
  echt, und die Seite läuft noch auf der betroffenen Fassung.
- Ein hoher Fund in einem Werkzeug stoppt die CI weiterhin.
- Die Prüfung ist lokal ausführbar: `npm run pruefe:abhaengigkeiten`. Vorher
  ging das nur über den Umweg, sich den Workflow nachzubauen.
