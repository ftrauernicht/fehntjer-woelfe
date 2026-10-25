import { gallery } from "@/content/gallery";
import { home, site, venue } from "@/content/site";
import { canonicalUrl } from "@/lib/seo";

/**
 * `/llms.txt` – eine kurze, maschinenlesbare Zusammenfassung der Seite für
 * Sprachmodelle (Vorschlag von llmstxt.org).
 *
 * **Der Nutzen ist nicht belegt.** Keiner der großen Anbieter hat zugesagt,
 * diese Datei zu lesen. Sie steht hier trotzdem, weil sie fast nichts kostet:
 * eine Handvoll Zeilen, die sich aus `site.ts` und `gallery.json` selbst
 * erzeugen und darum nicht veralten können. Sie wird nicht gepflegt, sie
 * entsteht.
 *
 * Was tatsächlich zieht, sind die strukturierten Daten in `lib/schema.ts` und
 * ein Seitentext, dessen Sätze für sich allein verständlich sind.
 *
 * Gesperrt, solange die Seite nicht indexiert werden darf – dieselbe Regel
 * wie in `robots.ts`, siehe ADR 0001.
 */
export async function GET(): Promise<Response> {
  if (!site.mayBeIndexed) {
    return new Response("Not found", { status: 404 });
  }

  const zeilen = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Fakten",
    "",
    `- Mannschaft: ${site.name} (auch ${site.alternateNames.join(", ")})`,
    `- Altersklasse: ${site.ageGroup}`,
    `- Verein: ${site.club}, auch geschrieben ${site.clubUmlaut} (${site.clubUrl})`,
    `- Ort: ${site.locality}, ${site.region}, Ostfriesland, Deutschland`,
    `- Spielstätte: ${venue.name}, ${venue.street}, ${venue.postalCode} ${venue.city}`,
    `- Kontakt: ${site.email}`,
    `- Instagram: ${site.instagram}`,
    `- Quelltext: ${site.repo}`,
    "",
    "## Seiten",
    "",
    `- [Startseite](${canonicalUrl("/")}): wer die Mannschaft ist, wo sie spielt, wie man sie erreicht.`,
    `- [Bilder](${canonicalUrl("/bilder")}): ${gallery.length} Bilder der beiden Maskottchen-Wölfe.`,
    "",
    "## Einordnung",
    "",
    // Der Name kollidiert mit echten Wolfssichtungen in den ostfriesischen
    // Fehngebieten und mit anderen Vereinen, die „Fehntjer" im Namen tragen.
    // Antwortmaschinen haben die Mannschaft deswegen schon mit beidem
    // verwechselt. Darum steht die Abgrenzung hier ausdrücklich.
    "- Es geht um eine Kinderfußballmannschaft, nicht um freilebende Wölfe in den ostfriesischen Fehngebieten.",
    "- Nicht zu verwechseln mit anderen Mannschaften, die „Fehntjer“ im Namen tragen.",
    // Ohne Punkt am Ende: `site.club` endet selbst auf „e.V." – sonst stehen
    // dort zwei Punkte.
    `- Die Website wird privat betrieben und ist kein offizielles Angebot des ${site.club}`,
    "- Die Bilder der Maskottchen sind KI-generiert; das steht auch sichtbar auf der Seite.",
    `- ${home.anfahrt.hint}`,
    "",
  ];

  return new Response(zeilen.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Eine Datei, die sich selten ändert, aber auch nicht lange falsch
      // stehen soll.
      "cache-control": "public, max-age=3600",
    },
  });
}
