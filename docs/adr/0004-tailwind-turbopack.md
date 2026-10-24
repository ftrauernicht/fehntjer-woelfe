# 0004 – Tailwind als Turbopack-Loader in `next.config.ts`

Akzeptiert · 24.10.2026

## Kontext

`create-next-app` legte das Projekt ohne PostCSS-Konfiguration an, installierte
aber `@tailwindcss/turbopack`. Next 16 baut standardmäßig mit Turbopack.

Das Ergebnis war still und schwer zu bemerken: `@import "tailwindcss"` wurde
nicht verarbeitet. Die Seite lud ein Stylesheet von 3,4 KB, in dem keine
einzige Utility-Klasse stand, und rendert vollständig ungestylt. Der Build
meldete das **nur als Warnung** („Unknown at rule: @theme") und lief durch.
Tests, Lint und Typecheck waren grün.

Aufgefallen ist es erst beim Blick in den Browser.

## Entscheidung

In `next.config.ts`:

```ts
turbopack: {
  rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
}
```

Danach enthält die ausgelieferte CSS-Datei 18 KB mit allen Utilities und den
Markenfarben.

## Alternativen

- **`postcss.config.mjs` mit `@tailwindcss/postcss`:** funktioniert ebenfalls,
  passt aber nicht zum installierten Turbopack-Plugin.
- **Auf Webpack zurückgehen:** verworfen, Turbopack ist der Standard.

## Konsequenzen

- Der Block muss bleiben. Wer ihn entfernt, bekommt eine ungestylte Seite und
  nur eine Warnung als Hinweis.
- Grundsätzlicher: **Ein grüner Build heißt nicht, dass die Seite aussieht wie
  gedacht.** Nach Änderungen am Styling lohnt ein Blick in den Browser.
