import { NextResponse, type NextRequest } from "next/server";

/**
 * Content-Security-Policy mit Nonce.
 *
 * In Next 16 heißt diese Datei `proxy.ts` – nicht mehr `middleware.ts`.
 *
 * Warum überhaupt ein Nonce statt einer statischen CSP in `next.config.ts`?
 * Next.js schreibt beim Rendern Inline-Skripte in die Seite (Hydration,
 * Flight-Daten). Ohne Nonce bliebe nur `script-src 'unsafe-inline'`, und damit
 * wäre die CSP als XSS-Schutz praktisch wertlos.
 *
 * Der Preis: Seiten mit Nonce müssen dynamisch gerendert werden, statisches
 * Ausliefern aus dem CDN entfällt. Bei einer Handvoll Seiten ist das
 * vernachlässigbar – die Entscheidung ist bewusst so getroffen und im README
 * unter „Architekturentscheidungen" festgehalten.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    `default-src 'self'`,
    // 'strict-dynamic' erlaubt den von Next geladenen Bundles, weitere Chunks
    // nachzuladen, ohne dass jede URL einzeln freigegeben werden muss.
    // 'unsafe-eval' braucht nur React im Dev-Modus für bessere Stacktraces.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    // Die Seite hat keine Formulare. Sollte je eines dazukommen, muss hier
    // bewusst nachgezogen werden.
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Statische Assets und das Bild-Optimierungs-Endpoint brauchen keine CSP
      // und sollen nicht bei jedem Abruf durch den Proxy laufen.
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
