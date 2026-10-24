#!/usr/bin/env node
/**
 * Erzeugt das Social-Preview-Banner fuer GitHub (1280x640).
 *
 *   node scripts/social-banner.mjs
 *   -> docs/social-preview.png
 *
 * Das Ergebnis wird **nicht** automatisch hochgeladen: GitHub bietet dafuer
 * keine API. Die Datei muss von Hand unter
 * Repository -> Settings -> General -> Social preview gesetzt werden.
 *
 * ## Woher das Layout stammt
 *
 * Die Masse sind aus den vorhandenen Bannern anderer ftrauernicht-Repos
 * ausgemessen, nicht geschaetzt - unter anderem aus `frank-trauernicht-de`:
 *
 *   Flaeche        1280x640, Hintergrund #fbf8f3
 *   Rand           links 90, rechts 90
 *   Titel          Grundlinienband y171..235, Serife, #191713
 *   Akzentbalken   x90..154 (65x5), y267, #a4552b
 *   Beschreibung   y314..347, Sans, #191713
 *   Metazeile      y367..385, Sans, #6d6152
 *   Trennlinie     y548, x90..1190, #e6dccd
 *   Fusszeile      y571..604, Name fett Serife, Rolle Sans #6d6152
 *
 * ## Schriften
 *
 * Die Originalschrift der Vorlage ist nicht dokumentiert. Verwendet wird
 * **Source Serif 4** und **Source Sans 3** - optisch sehr nah an der Vorlage
 * und frei verfuegbar. Wer die echte Schrift kennt, tauscht unten die URLs.
 *
 * Die Dateien werden beim Lauf von Google Fonts geholt und in
 * `node_modules/.cache/banner-fonts` zwischengespeichert, damit nichts
 * Unnoetiges im Repository landet.
 */

import { Resvg } from "@resvg/resvg-js";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const CACHE = path.join(REPO, "node_modules", ".cache", "banner-fonts");
const OUT = path.join(REPO, "docs", "social-preview.png");

/* -------------------------------------------------------------------------- */
/*  Inhalt                                                                     */
/* -------------------------------------------------------------------------- */

const BANNER = {
  title: "fehntjer-woelfe",
  description: "Platzhalterseite der Fehntjer Wölfe, Nachwuchsmannschaft des SV Grossefehn",
  meta: ["Next.js 16", "strict CSP", "fehntjer-woelfe.de"],
  name: "Frank Trauernicht",
  role: "Senior Software Engineer",
};

/* -------------------------------------------------------------------------- */
/*  Layout - alle Werte ausgemessen, siehe Kopfkommentar                       */
/* -------------------------------------------------------------------------- */

const L = {
  width: 1280,
  height: 640,
  left: 90,
  right: 1190,
  bg: "#fbf8f3",
  ink: "#191713",
  muted: "#6d6152",
  accent: "#a4552b",
  rule: "#e6dccd",
  titleBaseline: 235,
  titleSize: 86,
  barY: 267,
  barW: 65,
  barH: 5,
  descBaseline: 345,
  descSize: 30,
  descLineHeight: 40,
  metaBaseline: 385,
  metaSize: 20,
  ruleY: 548,
  footBaseline: 601,
  footSize: 26,
  roleSize: 21,
};

/* -------------------------------------------------------------------------- */

/**
 * Reihenfolge ist nicht beliebig: resvg nimmt die **zuerst geladene** Schrift
 * fuer alle Texte, wenn mehrere Familien im Spiel sind - das explizite
 * `font-family` im SVG wird dann ignoriert. Mit der Sans an erster Stelle
 * loesen beide Familien korrekt auf. Nachgemessen, nicht vermutet.
 */
const FONTS = [
  ["SourceSans3-Regular.ttf", "https://fonts.gstatic.com/s/sourcesans3/v20/nwpBtKy2OAdR1K-IwhWudF-R9QMylBJAV3Bo8Ky462EK9C4.ttf"],
  ["SourceSans3-Semibold.ttf", "https://fonts.gstatic.com/s/sourcesans3/v20/nwpBtKy2OAdR1K-IwhWudF-R9QMylBJAV3Bo8Kxm7GEK9C4.ttf"],
  ["SourceSerif4-Regular.ttf", "https://fonts.gstatic.com/s/sourceserif4/v15/vEFy2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6OAVIJmeUDygwjihdqnhtdCw.ttf"],
  ["SourceSerif4-Bold.ttf", "https://fonts.gstatic.com/s/sourceserif4/v15/vEFy2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6OAVIJmeUDygwjivBtnhtdCw.ttf"],
];

async function ensureFonts() {
  await mkdir(CACHE, { recursive: true });
  for (const [name, url] of FONTS) {
    const target = path.join(CACHE, name);
    try {
      await access(target);
    } catch {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Schrift ${name} nicht ladbar: HTTP ${res.status}`);
      await writeFile(target, Buffer.from(await res.arrayBuffer()));
      console.log(`geladen  ${name}`);
    }
  }
  return FONTS.map(([name]) => path.join(CACHE, name));
}

/** XML-Sonderzeichen entschaerfen, damit Umlaute und & nicht das SVG brechen. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Bricht einen Text auf mehrere Zeilen um.
 * Grob geschaetzt ueber die mittlere Zeichenbreite - genau genug, weil die
 * Beschreibung kurz gehalten wird und das Ergebnis vor dem Hochladen ohnehin
 * angeschaut wird.
 */
function wrap(text, size, maxWidth) {
  const perChar = size * 0.5;
  const max = Math.floor(maxWidth / perChar);
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > max && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function buildSvg() {
  const descLines = wrap(BANNER.description, L.descSize, L.right - L.left);
  // Mehrzeilige Beschreibung waechst nach unten; die Metazeile rutscht mit.
  const descShift = (descLines.length - 1) * L.descLineHeight;

  const desc = descLines
    .map(
      (line, i) =>
        `<text x="${L.left}" y="${L.descBaseline + i * L.descLineHeight}" font-family="Source Sans 3" font-size="${L.descSize}" fill="${L.ink}">${esc(line)}</text>`,
    )
    .join("\n    ");

  // Metapunkte mit Mittelpunkt getrennt, so wie in der Vorlage.
  const meta = esc(BANNER.meta.join("   ·   "));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L.width}" height="${L.height}" viewBox="0 0 ${L.width} ${L.height}">
    <rect width="${L.width}" height="${L.height}" fill="${L.bg}"/>

    <text x="${L.left}" y="${L.titleBaseline}" font-family="Source Serif 4" font-size="${L.titleSize}" fill="${L.ink}">${esc(BANNER.title)}</text>

    <rect x="${L.left}" y="${L.barY}" width="${L.barW}" height="${L.barH}" fill="${L.accent}"/>

    ${desc}

    <text x="${L.left}" y="${L.metaBaseline + descShift}" font-family="Source Sans 3" font-size="${L.metaSize}" fill="${L.muted}">${meta}</text>

    <rect x="${L.left}" y="${L.ruleY}" width="${L.right - L.left}" height="1" fill="${L.rule}"/>

    <text x="${L.left}" y="${L.footBaseline}" font-family="Source Serif 4" font-weight="700" font-size="${L.footSize}" fill="${L.ink}">${esc(BANNER.name)}</text>
    <text x="${L.right}" y="${L.footBaseline}" text-anchor="end" font-family="Source Sans 3" font-size="${L.roleSize}" fill="${L.muted}">${esc(BANNER.role)}</text>
  </svg>`;
}

async function main() {
  const fontFiles = await ensureFonts();

  const resvg = new Resvg(buildSvg(), {
    fitTo: { mode: "width", value: L.width },
    font: { fontFiles, loadSystemFonts: false },
  });

  await mkdir(path.dirname(OUT), { recursive: true });
  const png = resvg.render().asPng();
  await writeFile(OUT, png);

  console.log(`\n${L.width}x${L.height}  ${(png.length / 1024).toFixed(0)} KB  ->  docs/social-preview.png`);
  console.log("Hochladen: Repository -> Settings -> General -> Social preview");
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
