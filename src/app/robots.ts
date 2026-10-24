import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Indexierung nur freigeben, wenn zwei Bedingungen erfüllt sind:
 *
 *  1. Die kanonische Domain ist bewusst über NEXT_PUBLIC_SITE_URL gesetzt.
 *     Solange die App unter einer *.vercel.app-Adresse läuft, würde sie sonst
 *     als eigenständige Seite indexiert – und später als Duplikat der echten
 *     Domain gegen sich selbst antreten.
 *
 *  2. Das Impressum ist vollständig. Eine indexierte Seite ohne vollständige
 *     Anbieterkennzeichnung ist nach § 5 DDG angreifbar.
 *
 * Beides zusammen steckt in `site.mayBeIndexed`.
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.mayBeIndexed) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
