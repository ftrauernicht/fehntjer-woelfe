import { canonicalUrl } from "@/lib/seo";
import { logos, site, venue } from "@/content/site";

/**
 * Feste Kennungen für die beiden Knoten. Damit verweisen sie aufeinander,
 * statt unverbunden nebeneinander zu stehen: ein Leser – Mensch oder Maschine
 * – sieht so, dass diese Website *von dieser Mannschaft* handelt.
 */
const TEAM_ID = `${canonicalUrl("/")}#mannschaft`;
const SITE_ID = `${canonicalUrl("/")}#website`;

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
    "@id": TEAM_ID,
    name: site.name,
    /**
     * Dieselbe Definition wie in der Meta-Beschreibung und im Seitentext.
     * Ein Satz, der für sich allein verständlich ist – Name, Art, Verein,
     * Ort. Antwortmaschinen zitieren genau solche Sätze; sie können sich
     * nichts aus drei Absätzen zusammensuchen.
     */
    description: site.description,
    // Beide Schreibweisen des Namens. `alternateName` ist genau dafür
    // gedacht und sagt Suchmaschinen, dass Umlaut und Umschrift dieselbe
    // Mannschaft meinen.
    alternateName: site.alternateNames,
    sport: "Fußball",
    url: canonicalUrl("/"),
    email: site.email,
    logo: canonicalUrl(logos.woelfe.src),
    sameAs: [site.instagram],
    memberOf: {
      "@type": "SportsOrganization",
      name: site.club,
      alternateName: site.clubUmlaut,
      // Der Verein ist eine eigene Entität mit eigener Website. Ohne diesen
      // Verweis bleibt „Mitglied von SV Grossefehn" eine Zeichenkette; mit
      // ihm zeigt sie auf etwas Nachprüfbares. Die Seite verlinkt den Verein
      // auch sichtbar.
      url: site.clubUrl,
      sameAs: [site.clubUrl],
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
    "@id": SITE_ID,
    name: site.name,
    url: canonicalUrl("/"),
    inLanguage: "de-DE",
    // Verweis auf den Mannschaftsknoten: diese Website handelt von dieser
    // Mannschaft. Ohne `about` sind es zwei zufällig benachbarte Angaben.
    about: { "@id": TEAM_ID },
  };
}
