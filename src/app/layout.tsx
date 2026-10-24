import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { JsonLdScript } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/content/site";
import { sportsTeamSchema, webSiteSchema } from "@/lib/schema";
import "./globals.css";

/**
 * Schrift wird von next/font selbst gehostet – kein Request zu Google und
 * keine Ausnahme in der CSP nötig. `display: swap` verhindert unsichtbaren
 * Text während des Ladens.
 */
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.titleDefault,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // Solange die Seite nicht unter der richtigen Domain läuft oder das
  // Impressum unvollständig ist, darf sie nirgends in den Index. Das steht
  // zusätzlich in robots.txt – doppelt hält hier besser, weil ein einzelnes
  // falsch gesetztes Signal direkt Rankings kostet.
  robots: site.mayBeIndexed
    ? { index: true, follow: true }
    : { index: false, follow: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: site.name,
    url: "/",
    title: site.titleDefault,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e11" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={geist.variable}>
      <body className="min-h-dvh font-sans antialiased flex flex-col">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-red focus:px-4 focus:py-2 focus:text-white"
        >
          Zum Inhalt springen
        </a>

        <main id="inhalt" className="flex-1">
          {children}
        </main>

        <SiteFooter />

        <JsonLdScript data={[webSiteSchema(), sportsTeamSchema()]} />
      </body>
    </html>
  );
}
