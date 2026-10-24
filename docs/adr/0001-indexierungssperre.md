# 0001 – Die Seite sperrt sich selbst aus dem Suchindex

Akzeptiert · 24.10.2026

## Kontext

Die Seite ging zuerst unter einer `*.vercel.app`-Adresse live, mit einem noch
unvollständigen Impressum. Zwei Fehler drohten, die beide teuer und schlecht
sichtbar sind:

1. Wird die Vorschau-Adresse indexiert, konkurriert sie später als Duplikat
   mit der echten Domain.
2. Eine indexierte Seite ohne vollständige Anbieterkennzeichnung ist nach
   § 5 DDG angreifbar.

Beides fällt erst auf, wenn es passiert ist.

## Entscheidung

`src/app/robots.ts` gibt die Indexierung nur frei, wenn **beides** zutrifft:

- `NEXT_PUBLIC_SITE_URL` ist auf die kanonische Domain gesetzt
- das Impressum enthält keine Platzhalter mehr

Zusammengefasst in `site.mayBeIndexed`. Das Root-Layout setzt zusätzlich das
passende `robots`-Meta – zwei Signale statt einem.

## Alternativen

- **Nur per Hand steuern:** verworfen, weil genau das vergessen wird.
- **Nur die Domain prüfen:** verworfen, weil das Impressum die zweite, ebenso
  harte Bedingung ist.

## Konsequenzen

- Nach dem Setzen von `NEXT_PUBLIC_SITE_URL` muss einmal neu deployt werden.
- `tests/indexierung.test.ts` prüft alle Umgebungsfälle; wer die Sperre
  aushebelt, bricht die Tests.
- Beim Prüfen von `robots.txt` auf Produktion kann ein `Disallow: /`
  irritieren – es ist dann meist kein Fehler, sondern genau diese Sperre.
