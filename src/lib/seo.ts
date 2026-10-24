import type { Metadata } from "next";
import { site } from "@/content/site";

/**
 * Baut die Metadaten einer Route an einer Stelle zusammen, damit Titel,
 * Description, Canonical, Open Graph und Twitter-Card garantiert
 * zusammenpassen und keine Route eines davon vergisst.
 *
 * `path` ist immer der Pfad ohne Domain ("/impressum"). Next.js löst ihn über
 * `metadataBase` (im Root-Layout gesetzt) zu einer absoluten URL auf.
 */
export type PageMetadataInput = {
  /** Titel ohne Marken-Suffix – das Template im Root-Layout ergänzt es. */
  title: string;
  description: string;
  /** Pfad mit führendem Schrägstrich, ohne Schrägstrich am Ende. */
  path: string;
  /** true, wenn der Titel bereits vollständig ist (Startseite). */
  absoluteTitle?: boolean;
  /** Für Seiten, die nicht in den Index sollen (Impressum, Datenschutz). */
  noindex?: boolean;
};

const OG_IMAGE = "/opengraph-image";
// Gleiche Schreibweise wie im Titel – sonst steht im Alternativtext
// "Grossefehn" und daneben "Großefehn".
const OG_ALT = site.titleDefault;

/** Vollständiger Titel inklusive Marke – so wie er im <title> landet. */
export function fullTitle({ title, absoluteTitle }: PageMetadataInput): string {
  return absoluteTitle ? title : `${title} | ${site.name}`;
}

/**
 * Absolute URL einer Route – ohne Schrägstrich am Ende, genau so, wie Next.js
 * das `alternates.canonical` ausgibt. Sitemap und strukturierte Daten müssen
 * dieselbe Schreibweise verwenden, sonst entstehen Duplikate im Index.
 */
export function canonicalUrl(path: string): string {
  return path === "/" ? site.url : `${site.url}${path}`;
}

export function pageMetadata(input: PageMetadataInput): Metadata {
  const { title, description, path, absoluteTitle, noindex } = input;
  const shared = fullTitle(input);
  const image = { url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: site.name,
      url: path,
      title: shared,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: shared,
      description,
      images: [image],
    },
    // noindex ist immer restriktiver als das globale Default aus dem
    // Root-Layout – diese Seiten sollen unter keiner Domain in den Index.
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
