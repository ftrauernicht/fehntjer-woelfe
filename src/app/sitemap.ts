import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

/**
 * Routen mit Priorität und Änderungsfrequenz.
 *
 * Impressum und Datenschutz fehlen bewusst: beide tragen `robots: noindex`.
 * Eine Seite gleichzeitig in die Sitemap zu schreiben und von der Indexierung
 * auszunehmen, wären widersprüchliche Signale.
 */
const routes: {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/bilder", priority: 0.6, changeFrequency: "monthly" },
];

/** Routen, die absichtlich nicht in der Sitemap stehen, weil sie noindex sind. */
export const noindexRoutes = ["/impressum", "/datenschutz"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: canonicalUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
