#!/usr/bin/env node
/**
 * Erzeugt die Web-Fassungen der Maskottchen-Bilder.
 *
 * Die Originale sind 2K-PNGs mit rund 2 MB pro Datei und liegen bewusst
 * ausserhalb dieses Repositories (im Bildgenerierungs-Projekt daneben).
 * Eingecheckt wird nur das Ergebnis dieses Skripts: WebP in Web-Groesse.
 *
 * Aufruf:
 *   node scripts/optimize-images.mjs [quellordner]
 *
 * **Nicht nach `| head` pipen.** Das Skript loescht die Zielordner und baut
 * sie neu auf. Schliesst `head` die Pipe, stirbt der Prozess an SIGPIPE
 * mitten im Lauf und laesst einen halb geloeschten Zustand zurueck. Genau so
 * ist einmal ein Wappen aus dem Repository verschwunden.
 *
 * Der Quellordner ist der Ordner, der `ausgabe/` und `stiltest/` enthaelt.
 * Standard ist das Elternverzeichnis dieses Repositories.
 *
 * Die Auswahl in src/content/gallery.json ist handgepruefte Ware: jedes Bild wurde einzeln
 * angesehen. Aussortiert wurden Motive mit falscher Besetzung, braunen statt
 * blauen Augen und verunglueckten Wappen. Wer die Liste erweitert, prueft
 * das neue Motiv bitte genauso.
 */

import sharp from "sharp";
import GALLERY from "../src/content/gallery.json" with { type: "json" };
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const SOURCE = process.argv[2] ?? path.resolve(REPO, "..");
const TARGET = path.join(REPO, "public", "bilder");
const LOGO_TARGET = path.join(REPO, "public", "logo");

/**
 * Die beiden Wappen. Sie liegen im Referenzordner des Bildprojekts und
 * werden hier nur verkleinert und nach WebP gewandelt.
 *
 * `woelfe-wappen` ist die offizielle Druckdatei des Vereins (1254 px, saubere
 * Typografie) - nicht die aus einem PDF gezogene Fassung. Sie hat einen
 * weissen Hintergrund, `svg-vereinswappen` ist transparent. Beide stehen auf
 * der Seite deshalb auf weissen Flaechen.
 */
const LOGOS = [
  { file: "referenz/offiziell/Fehntjer Wölfe Logo.png", slug: "woelfe-wappen", width: 640 },
  { file: "referenz/logo/svg-vereinswappen.png", slug: "svg-vereinswappen", width: 256 },
];

/** Breite der ausgelieferten Bilder. Die Originale sind 2752 px breit. */
const WIDTH = 1280;
const QUALITY = 80;

/* Die kuratierte Auswahl steht in src/content/gallery.json - dieselbe Liste,
   die auch die Website rendert. Eine Quelle, zwei Verbraucher. */

async function main() {
  await rm(TARGET, { recursive: true, force: true });
  await mkdir(TARGET, { recursive: true });

  let total = 0;
  for (const { file, slug } of GALLERY) {
    const from = path.join(SOURCE, file);
    const to = path.join(TARGET, `${slug}.webp`);

    const info = await sharp(from)
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(to);

    total += info.size;
    console.log(
      `${slug.padEnd(18)} ${String(info.width).padStart(4)}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
    );
  }

  const written = await readdir(TARGET);
  console.log(`\n${written.length} Bilder, zusammen ${(total / 1024 / 1024).toFixed(2)} MB -> public/bilder/\n`);

  await rm(LOGO_TARGET, { recursive: true, force: true });
  await mkdir(LOGO_TARGET, { recursive: true });

  // Wappen fuer das Open-Graph-Bild. Liegt in assets/, nicht in public/:
  // Es wird zur Laufzeit mit readFile gelesen, nicht vom Browser geladen.
  // Next.js verfolgt diesen Pfad beim Bauen und packt die Datei mit ein.
  await mkdir(path.join(REPO, "assets"), { recursive: true });
  {
    const info = await sharp(path.join(SOURCE, LOGOS[0].file))
      .resize(420, 420, { fit: "contain", background: "#ffffff" })
      .png()
      .toFile(path.join(REPO, "assets", "woelfe-wappen-og.png"));
    console.log(`${"woelfe-wappen-og.png".padEnd(18)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB -> assets/`);
  }

  // Favicon und Apple-Touch-Icon direkt aus dem Wappen. Next.js nimmt
  // `src/app/icon.png` und `src/app/apple-icon.png` automatisch auf.
  const wappen = path.join(SOURCE, LOGOS[0].file);
  for (const [datei, groesse] of [["icon.png", 96], ["apple-icon.png", 180]]) {
    const info = await sharp(wappen)
      .resize(groesse, groesse, { fit: "contain", background: "#ffffff" })
      .png()
      .toFile(path.join(REPO, "src", "app", datei));
    console.log(`${datei.padEnd(18)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB -> src/app/`);
  }

  for (const { file, slug, width } of LOGOS) {
    const info = await sharp(path.join(SOURCE, file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(path.join(LOGO_TARGET, `${slug}.webp`));
    console.log(
      `${slug.padEnd(18)} ${String(info.width).padStart(4)}x${info.height}  ${(info.size / 1024).toFixed(0)} KB -> public/logo/`,
    );
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
