import { describe, expect, it } from "vitest";
import { canonicalUrl, fullTitle, pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";

describe("canonicalUrl", () => {
  it("gibt für die Startseite die Basis-URL ohne Schrägstrich zurück", () => {
    expect(canonicalUrl("/")).toBe(site.url);
    expect(canonicalUrl("/")).not.toMatch(/\/$/);
  });

  it("hängt Unterseiten ohne doppelten Schrägstrich an", () => {
    expect(canonicalUrl("/bilder")).toBe(`${site.url}/bilder`);
    expect(canonicalUrl("/bilder")).not.toContain("//bilder");
  });
});

describe("fullTitle", () => {
  const base = { description: "d", path: "/x" };

  it("ergänzt den Markennamen", () => {
    expect(fullTitle({ ...base, title: "Bilder" })).toBe(
      `Bilder | ${site.name}`,
    );
  });

  it("lässt absolute Titel unverändert", () => {
    expect(
      fullTitle({ ...base, title: "Ganz eigener Titel", absoluteTitle: true }),
    ).toBe("Ganz eigener Titel");
  });
});

describe("pageMetadata", () => {
  const input = {
    title: "Bilder",
    description: "Maskottchen-Bilder der Wölfe.",
    path: "/bilder",
  };

  it("setzt Canonical auf den übergebenen Pfad", () => {
    expect(pageMetadata(input).alternates?.canonical).toBe("/bilder");
  });

  it("hält Open Graph und Twitter beim selben Titel", () => {
    const meta = pageMetadata(input);
    expect(meta.openGraph?.title).toBe(`Bilder | ${site.name}`);
    expect(meta.twitter?.title).toBe(meta.openGraph?.title);
  });

  it("gibt beiden Kanälen dasselbe Vorschaubild", () => {
    const meta = pageMetadata(input);
    const og = meta.openGraph?.images;
    const tw = meta.twitter?.images;
    expect(og).toBeDefined();
    expect(JSON.stringify(og)).toBe(JSON.stringify(tw));
  });

  it("setzt noindex nur, wenn es angefordert wurde", () => {
    expect(pageMetadata(input).robots).toBeUndefined();
    expect(pageMetadata({ ...input, noindex: true }).robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it("verwendet deutsche Lokalisierung", () => {
    expect(pageMetadata(input).openGraph?.locale).toBe("de_DE");
  });
});
