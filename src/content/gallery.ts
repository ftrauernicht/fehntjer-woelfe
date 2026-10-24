import data from "./gallery.json";

/**
 * Die Maskottchen-Bilder der Wölfe.
 *
 * Die Liste steht als JSON daneben, weil sie zwei Verbraucher hat: diese
 * App und `scripts/optimize-images.mjs`. Zwei Kopien derselben Liste wären
 * auseinandergelaufen, sobald jemand ein Bild ergänzt.
 *
 * Die Bilder sind KI-generiert. Das steht auch auf der Seite – wer Bilder
 * zeigt, die keine Fotos sind, sagt das besser dazu.
 */
export type GalleryImage = {
  /** Pfad der Originaldatei im Bildprojekt – nur für das Optimierungsskript. */
  file: string;
  /** Dateiname im Web, ohne Endung. */
  slug: string;
  /** Kurze Bildunterschrift. */
  caption: string;
  /** Alternativtext. Pflicht, nicht optional – Barrierefreiheit. */
  alt: string;
};

export const gallery: readonly GalleryImage[] = data;

/** Öffentlicher Pfad der Web-Fassung eines Bildes. */
export function galleryImagePath(slug: string): string {
  return `/bilder/${slug}.webp`;
}

/** Das Bild, das als Vorschau auf der Startseite dient. */
export const galleryTeaser = gallery[0];
