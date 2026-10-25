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
 *
 * **KI-Crawler sind bewusst eingeschlossen.** `User-Agent: *` erlaubt auch
 * GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot und Google-Extended. Für
 * eine Mannschaft, die gefunden werden will, ist jede Antwortmaschine ein
 * Kanal; sie auszusperren würde nur die eigene Sichtbarkeit kosten. Wer das
 * später anders sieht, sperrt sie hier namentlich – und schreibt ein ADR
 * dazu, denn es ist eine inhaltliche Entscheidung, keine technische.
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
