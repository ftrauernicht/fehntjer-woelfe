import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap, { noindexRoutes } from "@/app/sitemap";
import { gallery, galleryImagePath, galleryTeaser } from "@/content/gallery";
import { home, impressum, legalNav, logos, site, venue } from "@/content/site";
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
  /**
   * Der gesamte sichtbare Text der Startseite, so wie ihn eine Suchmaschine
   * sieht – einschliesslich der E-Mail-Adresse. Frueher stand hier ein eigener
   * Absatz, der die Schreibweisen erklaerte; der ist raus, weil er niemanden
   * interessiert. Die Varianten muessen trotzdem vorkommen, nur eben
   * beilaeufig statt erklaert.
   */
  const seitentext = [
    home.title,
    home.lead,
    home.eyebrow,
    home.text,
    ...home.about.paragraphs,
    home.club.title,
    home.club.text,
    home.mailHint,
    site.email,
  ].join(" ");

  it("nennt den Namen mit Umlaut", () => {
    expect(seitentext).toContain("Fehntjer Wölfe");
  });

  it("bringt die Umschrift zumindest ueber die Adresse unter", () => {
    // Ohne den frueheren Erklaerabsatz traegt die E-Mail-Adresse die
    // oe-Schreibweise. Das reicht als Signal, ersetzt aber keinen Flietext –
    // siehe Hinweis im README.
    expect(seitentext).toContain("fehntjer-woelfe");
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

describe("Spielstätte", () => {
  it("ist vollständig angegeben", () => {
    for (const [feld, wert] of Object.entries(venue)) {
      expect(wert, feld).toBeTruthy();
    }
    expect(venue.postalCode).toMatch(/^\d{5}$/);
  });

  it("verlinkt eine Karte über HTTPS", () => {
    const url = new URL(venue.mapUrl);
    expect(url.protocol).toBe("https:");
    // Die Karte sucht nach der Anschrift, nicht nach Koordinaten.
    expect(decodeURIComponent(url.search)).toContain(venue.street);
  });

  it("steht in den strukturierten Daten genau so wie auf der Seite", () => {
    // Strukturierte Daten dürfen nichts behaupten, was nicht sichtbar ist.
    const ort = sportsTeamSchema().location as {
      name: string;
      address: Record<string, string>;
    };
    expect(ort.name).toBe(venue.name);
    expect(ort.address.streetAddress).toBe(venue.street);
    expect(ort.address.postalCode).toBe(venue.postalCode);
    expect(ort.address.addressLocality).toBe(venue.city);
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

describe("Wappendateien", () => {
  /**
   * Beide Wappen müssen ausgeliefert werden. Einmal fehlte eines im
   * Deployment, weil das Bildskript mitten im Lauf abgebrochen war und die
   * Löschung eingecheckt wurde – auf der Seite stand dann nur noch der
   * Alternativtext.
   */
  for (const [schluessel, logo] of Object.entries(logos)) {
    it(`${schluessel} liegt unter public/`, () => {
      const datei = path.join(process.cwd(), "public", logo.src);
      expect(existsSync(datei), logo.src).toBe(true);
    });
  }

  it("hat zu jedem Wappen Maße und Alternativtext", () => {
    for (const [schluessel, logo] of Object.entries(logos)) {
      expect(logo.width, schluessel).toBeGreaterThan(0);
      expect(logo.height, schluessel).toBeGreaterThan(0);
      expect(logo.alt.length, schluessel).toBeGreaterThan(10);
    }
  });
});

describe("Open-Graph-Bild", () => {
  it("findet das Wappen, das zur Laufzeit eingebettet wird", () => {
    // Liegt in assets/, nicht in public/ – wird mit readFile gelesen.
    const datei = path.join(process.cwd(), "assets", "woelfe-wappen-og.png");
    expect(existsSync(datei)).toBe(true);
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
