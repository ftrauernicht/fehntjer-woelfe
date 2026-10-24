# 0003 – Originalbilder liegen nicht im Repository

Akzeptiert · 24.10.2026

## Kontext

Die Maskottchen-Bilder sind KI-generierte 2K-PNGs mit je rund 2 MB. Dazu
kommen die Druckdaten des Vereins und der Sponsoren (ELSCO, VO Immobilien,
Ostfriesische Brandkasse) als AI-, EPS- und INDD-Dateien.

## Entscheidung

Eingecheckt werden nur die Web-Fassungen: WebP in Auslieferungsgröße unter
`public/bilder/` und `public/logo/`, zusammen etwa 0,9 MB.
`scripts/optimize-images.mjs` erzeugt sie aus den Originalen, die im
Nachbarprojekt liegen.

Die Auswahl steht in `src/content/gallery.json` – dieselbe Liste, die auch die
Website rendert. Eine Quelle, zwei Verbraucher.

## Alternativen

- **Originale mit einchecken:** verworfen, rund 30 MB ohne Nutzen für die
  Auslieferung.
- **Git LFS:** verworfen, zusätzliche Abhängigkeit für ein Repository, das
  sonst mit einem schlichten `clone` auskommt.
- **Sponsorendateien mit einchecken:** verworfen. Fremde Marken und
  Druckdaten gehören nicht in ein öffentliches Repository.

## Konsequenzen

- `npm run images` funktioniert nur dort, wo die Originale vorliegen.
- Die Bildauswahl ist **handgeprüft**. Bei einem Durchlauf von fünfzehn
  Motiven waren vier unbrauchbar: falsche Figurenbesetzung, braune statt
  blaue Augen, ein verunglücktes Wappen. Wer die Liste erweitert, sieht sich
  das neue Bild vorher an.
- Dass die Bilder KI-generiert sind, steht sichtbar auf der Bilderseite und
  im Impressum.
