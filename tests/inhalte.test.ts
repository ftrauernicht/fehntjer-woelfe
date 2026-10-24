import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap, { noindexRoutes } from "@/app/sitemap";
import { gallery, galleryImagePath, galleryTeaser } from "@/content/gallery";
import { home, impressum, legalNav, site } from "@/content/site";
import { sportsTeamSchema, webSiteSchema } from "@/lib/schema";

describe("Stammdaten", () => {
  it("nutzt überall dieselbe E-Mail-Adresse", () => {
    expect(site.email).toBe(impressum.email);
    expect(site.email).toMatch(/^[^@\s]+@fehntjer-woelfe\.de$/);
  });

  it("verlinkt ein gültiges Instagram-Profil", () => {
    const url = new URL(site.instagram);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("www.instagram.com");
    expect(url.pathname).toContain("fehntjer_woelfe");
  });

  it("hält die Meta-Description in der Länge, die Google anzeigt", () => {
    expect(site.description.length).toBeGreaterThanOrEqual(120);
    expect(site.description.length).toBeLessThanOrEqual(160);
  });

  it("hält den Seitentitel kurz genug für die Trefferliste", () => {
    expect(site.titleDefault.length).toBeLessThanOrEqual(60);
  });
});

describe("Schreibvarianten", () => {
  /**
   * Gefunden werden soll die Seite unter beiden Schreibweisen: mit Umlaut und
   * in Umschrift. Diese Tests halten fest, dass beide auch wirklich im
   * Seitentext vorkommen – ein stiller Verlust beim Umformulieren wäre sonst
   * nicht zu bemerken.
   */
  const seitentext = [
    home.title,
    home.lead,
    home.text,
    ...home.about.paragraphs,
  ].join(" ");

  it("nennt den Namen mit Umlaut", () => {
    expect(seitentext).toContain("Fehntjer Wölfe");
  });

  it("nennt den Namen auch in Umschrift", () => {
    expect(seitentext).toContain("Fehntjer Woelfe");
  });

  it("nennt den Verein mit ß und mit ss", () => {
    expect(seitentext).toContain("Großefehn");
    expect(seitentext).toContain("Grossefehn");
  });

  it("führt beide Schreibweisen in den strukturierten Daten", () => {
    const alternate = sportsTeamSchema().alternateName as string[];
    expect(alternate).toContain("Fehntjer Woelfe");
    expect(alternate.some((n) => n.includes("Großefehn"))).toBe(true);
    expect(alternate.some((n) => n.includes("Grossefehn"))).toBe(true);
  });

  it("trägt den Markennamen in der Hauptüberschrift", () => {
    // Eine h1 wie „Hier entsteht etwas" verschenkt das stärkste Signal
    // der Seite.
    expect(home.title).toContain(site.name);
  });

  it("nennt den Verein in Titel und Description", () => {
    expect(site.titleDefault).toMatch(/Gro(ß|ss)efehn/);
    expect(site.description).toMatch(/Gro(ß|ss)efehn/);
  });
});

describe("Sitemap", () => {
  it("führt nur absolute URLs", () => {
    for (const entry of sitemap()) {
      expect(() => new URL(entry.url)).not.toThrow();
      expect(entry.url.startsWith(site.url)).toBe(true);
    }
  });

  it("enthält keine Route, die auf noindex steht", () => {
    const urls = sitemap().map((e) => e.url);
    for (const route of noindexRoutes) {
      expect(urls).not.toContain(`${site.url}${route}`);
    }
  });

  it("führt die Startseite mit der höchsten Priorität", () => {
    const home = sitemap().find((e) => e.url === site.url);
    expect(home?.priority).toBe(1);
  });

  it("enthält keine Duplikate", () => {
    const urls = sitemap().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("verweist für jede Rechtsseite auf eine echte Route im Footer", () => {
    for (const route of noindexRoutes) {
      expect(legalNav.some((item) => item.href === route)).toBe(true);
    }
  });
});

describe("Galerie", () => {
  it("hat eindeutige Slugs", () => {
    const slugs = gallery.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("hat zu jedem Eintrag eine ausgelieferte Bilddatei", () => {
    for (const image of gallery) {
      const file = path.join(
        process.cwd(),
        "public",
        "bilder",
        `${image.slug}.webp`,
      );
      expect(existsSync(file), `fehlt: ${image.slug}.webp`).toBe(true);
    }
  });

  it("hat überall einen aussagekräftigen Alternativtext", () => {
    for (const image of gallery) {
      expect(image.alt.length, image.slug).toBeGreaterThan(20);
      // Ein Alternativtext, der mit "Bild von" anfängt, sagt nichts.
      expect(image.alt.toLowerCase()).not.toMatch(/^(bild|foto|grafik) von/);
    }
  });

  it("baut den öffentlichen Pfad korrekt", () => {
    expect(galleryImagePath("jubel")).toBe("/bilder/jubel.webp");
  });

  it("hat einen Teaser", () => {
    expect(galleryTeaser).toBeDefined();
    expect(gallery).toContain(galleryTeaser);
  });
});

describe("Strukturierte Daten", () => {
  it("beschreibt die Mannschaft mit gültigem Schema-Typ", () => {
    const schema = sportsTeamSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("SportsTeam");
    expect(schema.name).toBe(site.name);
  });

  it("nennt nur Angaben, die auch auf der Seite stehen", () => {
    const schema = sportsTeamSchema();
    expect(schema.email).toBe(site.email);
    expect(schema.sameAs).toEqual([site.instagram]);
  });

  it("verwendet für die Website dieselbe kanonische URL", () => {
    expect(webSiteSchema().url).toBe(site.url);
    expect(sportsTeamSchema().url).toBe(site.url);
  });
});
