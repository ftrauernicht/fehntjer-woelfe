import { describe, expect, it } from "vitest";

import {
  bewerteRobots,
  findeCanonical,
  findeOgBild,
} from "../scripts/pruefe-live.mjs";

/**
 * Der Wachhund läuft täglich gegen die veröffentlichte Seite und schlägt per
 * Mail an. Seine beiden Entscheidungen lassen sich ohne Netz prüfen – und
 * sollen es auch: ein Wachhund, der falsch bellt, wird abgeschaltet, und ein
 * Wachhund, der zu spät bellt, ist wertlos.
 */

describe("bewerteRobots", () => {
  it("erkennt die freigegebene Seite samt Sitemap-Zeile", () => {
    const { erlaubt, sitemap } = bewerteRobots(
      [
        "User-Agent: *",
        "Allow: /",
        "",
        "Host: https://fehntjer-woelfe.de",
        "Sitemap: https://fehntjer-woelfe.de/sitemap.xml",
      ].join("\n"),
    );

    expect(erlaubt).toBe(true);
    expect(sitemap).toBe("https://fehntjer-woelfe.de/sitemap.xml");
  });

  // Genau dieser Fall soll die Mail auslösen: fehlt die Umgebungsvariable
  // NEXT_PUBLIC_SITE_URL, liefert die Seite wieder eine Vollsperre aus.
  it("erkennt die Indexierungssperre", () => {
    const text = "User-Agent: *\nDisallow: /\n";

    expect(bewerteRobots(text).erlaubt).toBe(false);
  });

  it("hält ein Disallow auf einem Unterpfad nicht für eine Vollsperre", () => {
    const text = "User-Agent: *\nAllow: /\nDisallow: /api\n";

    expect(bewerteRobots(text).erlaubt).toBe(true);
  });

  it("meldet eine fehlende Sitemap-Zeile", () => {
    expect(bewerteRobots("User-Agent: *\nAllow: /\n").sitemap).toBeNull();
  });
});

describe("findeOgBild", () => {
  const basis = "https://fehntjer-woelfe.de";

  it("findet das Vorschaubild unabhängig von der Attributreihenfolge", () => {
    const voran = '<meta property="og:image" content="/opengraph-image"/>';
    const danach = '<meta content="/opengraph-image" property="og:image"/>';

    expect(findeOgBild(voran, basis)).toBe(`${basis}/opengraph-image`);
    expect(findeOgBild(danach, basis)).toBe(`${basis}/opengraph-image`);
  });

  it("macht eine relative Adresse absolut", () => {
    const html = '<meta property="og:image" content="/opengraph-image"/>';

    expect(findeOgBild(html, basis)).toBe(`${basis}/opengraph-image`);
  });

  it("gibt null zurück, wenn kein Vorschaubild im HTML steht", () => {
    expect(findeOgBild("<head><title>Wölfe</title></head>", basis)).toBeNull();
  });

  // og:image:width steht im echten HTML direkt daneben und hat ebenfalls ein
  // content-Attribut – ein zu großzügiger Ausdruck würde dessen "1200" für
  // eine Bildadresse halten.
  it("verwechselt og:image:width nicht mit dem Bild", () => {
    const html = [
      '<meta property="og:image:width" content="1200"/>',
      '<meta property="og:image:height" content="630"/>',
    ].join("");

    expect(findeOgBild(html, basis)).toBeNull();
  });
});

describe("findeCanonical", () => {
  const basis = "https://fehntjer-woelfe.de";

  // Die Seite liefert auch unter „www." aus. Zeigt der Canonical dort nicht
  // auf den Apex, bewerben sich zwei Adressen um dieselbe Platzierung.
  it("findet die kanonische Adresse", () => {
    const html = '<link rel="canonical" href="https://fehntjer-woelfe.de"/>';

    // `new URL` normalisiert und hängt den Schrägstrich an – deshalb prüft
    // das Skript gegen die Fassung mit Schrägstrich.
    expect(findeCanonical(html, basis)).toBe(`${basis}/`);
  });

  it("gibt null zurück, wenn kein Canonical im HTML steht", () => {
    expect(findeCanonical("<head><title>Wölfe</title></head>", basis)).toBeNull();
  });
});
