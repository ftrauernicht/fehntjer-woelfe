import { afterEach, describe, expect, it, vi } from "vitest";

import { site } from "@/content/site";
import { sportsTeamSchema, webSiteSchema } from "@/lib/schema";

/**
 * Antwortmaschinen – Googles KI-Übersicht, ChatGPT, Perplexity – lesen
 * dieselbe Seite wie ein Mensch, ziehen daraus aber einzelne Aussagen. Was
 * hier geprüft wird, sind genau die Stellen, an denen die Seite sich selbst
 * erklärt: ein verbundener Datengraph und eine Zusammenfassung, die sich aus
 * den Stammdaten erzeugt und darum nicht veralten kann.
 *
 * Googles KI-Übersicht hat am 25.10.2026 behauptet, eine Fußballmannschaft
 * dieses Namens existiere nicht – während die Seite direkt darunter als
 * erstes Webergebnis stand. Das ist der Anlass dieser Prüfungen.
 */

describe("Strukturierte Daten als verbundener Graph", () => {
  it("gibt der Mannschaft eine feste Kennung", () => {
    const team = sportsTeamSchema();

    // Dieselbe Schreibweise wie der Canonical der Startseite: ohne
    // abschließenden Schrägstrich.
    expect(team["@id"]).toBe(`${site.url}#mannschaft`);
  });

  // Ohne diesen Verweis stehen zwei Angaben nebeneinander, ohne dass etwas
  // sagt, dass die eine von der anderen handelt.
  it("verknüpft die Website mit der Mannschaft", () => {
    const seite = webSiteSchema();
    const team = sportsTeamSchema();

    expect(seite.about).toEqual({ "@id": team["@id"] });
  });

  it("trägt eine Definition, die für sich allein verständlich ist", () => {
    const team = sportsTeamSchema();
    const beschreibung = String(team.description);

    expect(beschreibung).toBe(site.description);
    // Name, Art, Verein und Ort müssen in diesem einen Satz vorkommen.
    expect(beschreibung).toContain("Fehntjer Wölfe");
    expect(beschreibung).toContain("Nachwuchsmannschaft");
    expect(beschreibung).toContain("SV Großefehn");
    expect(beschreibung).toContain("Ostfriesland");
  });

  it("verweist beim Verein auf dessen eigene Seite", () => {
    const verein = sportsTeamSchema().memberOf as Record<string, unknown>;

    expect(verein.url).toBe(site.clubUrl);
    expect(verein.sameAs).toEqual([site.clubUrl]);
  });

  it("nennt das Wappen mit absoluter Adresse", () => {
    const team = sportsTeamSchema();

    expect(team.logo).toBe(`${site.url}/logo/woelfe-wappen.webp`);
  });
});

describe("/llms.txt", () => {
  async function ladeRoute(domain: string) {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", domain);
    const mod = await import("@/app/llms.txt/route");
    return mod.GET();
  }

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  // Dieselbe Regel wie in robots.txt: was nicht indexiert werden darf, wird
  // auch nicht für Sprachmodelle zusammengefasst.
  it("antwortet mit 404, solange die Seite nicht indexiert werden darf", async () => {
    const antwort = await ladeRoute("");

    expect(antwort.status).toBe(404);
  });

  it("liefert die Zusammenfassung als reinen Text", async () => {
    const antwort = await ladeRoute("https://fehntjer-woelfe.de");

    expect(antwort.status).toBe(200);
    expect(antwort.headers.get("content-type")).toContain("text/plain");
  });

  it("enthält die Fakten, nach denen gefragt wird", async () => {
    const text = await (await ladeRoute("https://fehntjer-woelfe.de")).text();

    for (const erwartet of [
      "Fehntjer Wölfe",
      "Fehntjer Woelfe",
      site.ageGroup,
      "SV Großefehn",
      site.clubUrl,
      "Mühlenstadion",
      site.email,
      site.instagram,
    ]) {
      expect(text).toContain(erwartet);
    }
  });

  // Der Name kollidiert mit echten Wolfssichtungen in Ostfriesland und mit
  // anderen Vereinen, die „Fehntjer" im Namen tragen. Beides hat zu falschen
  // Antworten geführt.
  it("grenzt die Mannschaft von echten Wölfen ab", async () => {
    const text = await (await ladeRoute("https://fehntjer-woelfe.de")).text();

    expect(text).toContain("nicht um freilebende Wölfe");
    expect(text).toContain("KI-generiert");
    expect(text).toContain("privat betrieben");
  });

  // Die Datei entsteht aus Textbausteinen, die selbst auf Satzzeichen enden.
  // „SV Grossefehn e.V." plus angefügtem Punkt ergab zwei Punkte.
  it("setzt keine doppelten Satzzeichen", async () => {
    const text = await (await ladeRoute("https://fehntjer-woelfe.de")).text();

    expect(text).not.toMatch(/\.\./);
  });
});
