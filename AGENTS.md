<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hinweise für dieses Repository

## Vor dem Commit

```bash
npm run verify
```

Lint, Typecheck und Tests. Die CI führt zusätzlich den Build und `npm audit`
aus.

## Vier Stolperstellen

1. **`src/proxy.ts`, nicht `middleware.ts`.** In Next 16 umbenannt. Dort steht
   die Content-Security-Policy mit Nonce.

2. **Der `turbopack.rules`-Block in `next.config.ts` muss bleiben.** Ohne ihn
   wird Tailwind nicht verarbeitet, und die Seite rendert ungestylt. Der Build
   meldet das nur als Warnung, nicht als Fehler.

3. **Texte gehören in `src/content/site.ts`,** nicht ins JSX. Die Altersklasse
   steht als einzelne Konstante `ageGroup`, weil der Jahrgang jedes Jahr
   aufrückt.

4. **Keine Behauptung ohne Deckung.** Die Mannschaft ist *nicht* die jüngste
   im Verein – unter ihr gibt es noch die G-Jugend. Strukturierte Daten dürfen
   nichts enthalten, was nicht auch sichtbar auf der Seite steht.

## Marke, Farben, Maskottchen

Alles Gestalterische steht in [`docs/markenleitfaden.md`](docs/markenleitfaden.md).
Dort stehen die **gemessenen** Farbwerte (Vereinsrot `#BF0B02`), beide
Schreibweisen des Namens, die Beschreibung der zwei Maskottchen und die
Regeln, an denen schon etwas schiefgegangen ist. Vor jeder Bild-, Logo- oder
Mottoerzeugung lesen.

## Bilder

`src/content/gallery.json` ist die gemeinsame Quelle für die Website und für
`scripts/optimize-images.mjs`. Neue Bilder zuerst **ansehen**, dann eintragen,
dann `npm run images`.

## Stil

Kommentare auf Deutsch und nur dort, wo sie das *Warum* erklären. Was der Code
ohnehin sagt, nicht wiederholen.
