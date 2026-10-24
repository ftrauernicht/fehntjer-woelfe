import type { NextConfig } from "next";

/**
 * Sicherheits-Header.
 *
 * Die Content-Security-Policy steht bewusst **nicht** hier, sondern in
 * `src/proxy.ts`: sie braucht pro Anfrage einen frischen Nonce, und den kann
 * eine statische Header-Konfiguration nicht liefern.
 *
 * Alles hier ist dagegen konstant und gehört deshalb in die Konfiguration.
 */
const securityHeaders = [
  // Verhindert, dass der Browser den Inhaltstyp errät und z. B. eine
  // hochgeladene Textdatei als Skript ausführt.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Beim Wechsel auf fremde Seiten nur die Herkunft senden, nicht den Pfad.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Klickjacking. `frame-ancestors 'none'` in der CSP ist der moderne Weg,
  // dieser Header deckt ältere Browser ab.
  { key: "X-Frame-Options", value: "DENY" },

  // Die Seite braucht keine dieser Schnittstellen – also alle abschalten.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },

  // HTTPS erzwingen. Bewusst ohne `preload`: das ist eine Einbahnstraße, aus
  // der Preload-Liste kommt man nur langsam wieder heraus.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },

  // Isoliert das Browsing-Context-Fenster von fremden Seiten.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  /**
   * Tailwind CSS v4 als Turbopack-Loader.
   *
   * Ohne diesen Block wird `@import "tailwindcss"` nicht verarbeitet: die
   * Seite lädt dann eine Stylesheet-Datei, in der keine einzige
   * Utility-Klasse steht, und rendert völlig ungestylt. Der Build meldet das
   * nur als Warnung („Unknown at rule: @theme"), nicht als Fehler – deshalb
   * fällt es ohne Blick in den Browser leicht durch.
   */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Entfernt den `X-Powered-By: Next.js`-Header. Kein echter Schutz, aber es
  // gibt keinen Grund, die eingesetzte Technik auszuplaudern.
  poweredByHeader: false,

  // Erzeugt bei Bedarf saubere 404 statt Weiterleitungen mit Schrägstrich.
  trailingSlash: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
