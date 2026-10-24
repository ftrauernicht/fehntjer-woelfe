# 0007 – TypeScript 6 statt 7

Akzeptiert · 24.10.2026

## Kontext

Dependabot schlug TypeScript 7 vor – den neu geschriebenen nativen Compiler.
Der Typecheck lief damit fehlerfrei durch.

ESLint brach jedoch ab:

```
typescript-eslint does not support TS 7.0.
```

Das ist kein Konfigurationsproblem, sondern fehlende Unterstützung;
typescript-eslint verfolgt sie für TS ≥ 7.1.

## Entscheidung

TypeScript bleibt auf **6.0.x**. Damit laufen Typecheck, Lint, Tests und Build
vollständig durch.

## Alternativen

- **TS 7 mit abgeschaltetem Lint:** verworfen. Lint ist Teil von
  `npm run verify` und der CI.
- **Auf TS 5 bleiben:** unnötig, 6 läuft sauber.

## Konsequenzen

- Vor dem nächsten Versuch mit TS 7 prüfen, ob typescript-eslint nachgezogen
  hat. Ohne das wiederholt sich der Abbruch.
- Gilt sinngemäß für andere Major-Sprünge: einzeln aktualisieren und jeweils
  `npm run verify` laufen lassen.
