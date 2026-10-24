import { canonicalUrl } from "@/lib/seo";
import { site, venue } from "@/content/site";

/**
 * Strukturierte Daten (JSON-LD).
 *
 * Grundregel: hier steht nur, was auch im sichtbaren Seiteninhalt vorkommt.
 * Strukturierte Daten, die über die Seite hinaus Behauptungen aufstellen,
 * sind ein Verstoß gegen Googles Richtlinien und können zu einer manuellen
 * Maßnahme führen. Deshalb bewusst sparsam.
 */

export type JsonLd = Record<string, unknown>;

/** Die Mannschaft selbst. */
export function sportsTeamSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: site.name,
    // Beide Schreibweisen des Namens. `alternateName` ist genau dafür
    // gedacht und sagt Suchmaschinen, dass Umlaut und Umschrift dieselbe
    // Mannschaft meinen.
    alternateName: site.alternateNames,
    sport: "Fußball",
    url: canonicalUrl("/"),
    email: site.email,
    sameAs: [site.instagram],
    memberOf: {
      "@type": "SportsOrganization",
      name: site.club,
      alternateName: site.clubUmlaut,
    },
    // Die Spielstätte steht sichtbar auf der Seite, darf also auch in die
    // strukturierten Daten. Ohne den sichtbaren Abschnitt wäre das ein
    // Verstoß gegen Googles Richtlinien.
    location: {
      "@type": "Place",
      name: venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: venue.street,
        postalCode: venue.postalCode,
        addressLocality: venue.city,
        addressRegion: site.region,
        addressCountry: venue.country,
      },
    },
  };
}

/** Die Website als solche – gibt Suchmaschinen den kanonischen Namen. */
export function webSiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: canonicalUrl("/"),
    inLanguage: "de-DE",
  };
}
