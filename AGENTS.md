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

## Warum etwas so ist

Entscheidungen samt verworfener Alternativen stehen in
[`docs/adr/`](docs/adr/). **Das README beschreibt nur den Stand der Dinge** –
keine Historie. Wer etwas Grundlegendes ändert, legt ein neues ADR an, statt
ein bestehendes zu überschreiben.

## Marke, Farben, Maskottchen

Alles Gestalterische steht in [`docs/markenleitfaden.md`](docs/markenleitfaden.md).
Dort stehen die **gemessenen** Farbwerte (Vereinsrot `#BF0B02`), beide
Schreibweisen des Namens, die Beschreibung der zwei Maskottchen und die
Regeln, an denen schon etwas schiefgegangen ist. Vor jeder Bild-, Logo- oder
Mottoerzeugung lesen.

## Automatik – nicht aus Versehen entwerten

Zwei Workflows halten den Betrieb ohne Nachsehen am Laufen:
`wachhund.yml` prüft täglich die veröffentlichte Seite,
`dependabot-zusammenfuehren.yml` führt grüne Dependabot-Updates selbst
zusammen. Beide verlassen sich darauf, dass `ci.yml` **weiterhin streng ist**
und `CI` heißt – wer die CI aufweicht oder umbenennt, nimmt der
Zusammenführung ihr einziges Prüftor. Begründung in
[`docs/adr/0009-betrieb-ohne-nachsehen.md`](docs/adr/0009-betrieb-ohne-nachsehen.md).

Der letzte Schritt des Wachhunds ist ein **Totmannschalter**: Er pingt
healthchecks.io an, damit ein Lauf, der gar nicht stattfindet, nicht wie ein
grüner Tag aussieht. Wer das Secret `LEBENSZEICHEN_URL` entfernt, schaltet den
Alarm stumm, ohne dass irgendwo etwas rot wird. Begründung in
[`docs/adr/0011-totmannschalter-statt-monitoring.md`](docs/adr/0011-totmannschalter-statt-monitoring.md).

## Bilder

`src/content/gallery.json` ist die gemeinsame Quelle für die Website und für
`scripts/optimize-images.mjs`. Neue Bilder zuerst **ansehen**, dann eintragen,
dann `npm run images`.

## Stil

Kommentare auf Deutsch und nur dort, wo sie das *Warum* erklären. Was der Code
ohnehin sagt, nicht wiederholen.
