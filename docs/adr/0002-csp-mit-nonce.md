# 0002 – CSP mit Nonce statt statischer Header

Akzeptiert · 24.10.2026

## Kontext

Next.js schreibt beim Rendern Inline-Skripte in die Seite (Hydration,
Flight-Daten). Eine Content-Security-Policy, die als statischer Header in
`next.config.ts` steht, müsste diese Skripte über `script-src 'unsafe-inline'`
erlauben – und wäre als XSS-Schutz damit praktisch wertlos.

## Entscheidung

`src/proxy.ts` erzeugt pro Anfrage einen Nonce und setzt die CSP als
Response-Header. Next.js hängt den Nonce automatisch an seine eigenen Skripte;
für eigenen Code – den JSON-LD-Block – wird er über den `x-nonce`-Header
weitergereicht.

In Next 16 heißt diese Datei `proxy.ts`, nicht mehr `middleware.ts`.

## Alternativen

- **Statische CSP mit `unsafe-inline`:** verworfen, siehe oben.
- **Hash-basierte CSP:** verworfen, weil die Hashes bei jedem Build wechseln
  und nicht zuverlässig vorab bekannt sind.
- **Gar keine CSP:** verworfen, Absicherung war eine Anforderung.

## Konsequenzen

- **Seiten mit Nonce müssen dynamisch gerendert werden.** Statisches
  Ausliefern aus dem CDN entfällt. Bei vier Seiten ist das vernachlässigbar.
- Wer die Seite stark ausbaut, sollte diese Entscheidung erneut prüfen.
- Im Entwicklungsmodus ist zusätzlich `'unsafe-eval'` nötig, weil React dort
  `eval` für Stacktraces nutzt. In Produktion fehlt es – nachgemessen.
- Die Direktiven sind in `tests/sicherheit.test.ts` festgeschrieben.
