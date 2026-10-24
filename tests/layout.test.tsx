import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RootLayout, { metadata, viewport } from "@/app/layout";
import { SiteFooter } from "@/components/site-footer";
import { legalNav, site } from "@/content/site";

describe("Metadaten des Root-Layouts", () => {
  it("setzt metadataBase, damit relative Pfade absolut werden", () => {
    expect(metadata.metadataBase?.toString()).toContain(new URL(site.url).host);
  });

  it("hängt den Markennamen über ein Template an Unterseiten", () => {
    const title = metadata.title as { default: string; template: string };
    expect(title.default).toBe(site.titleDefault);
    expect(title.template).toBe(`%s | ${site.name}`);
  });

  it("spiegelt die Indexierungsfreigabe", () => {
    expect(metadata.robots).toEqual(
      site.mayBeIndexed
        ? { index: true, follow: true }
        : { index: false, follow: false },
    );
  });

  it("gibt für beide Farbschemata eine Theme-Farbe an", () => {
    const themes = viewport.themeColor as { media: string; color: string }[];
    expect(themes).toHaveLength(2);
    expect(themes.map((t) => t.media)).toEqual([
      "(prefers-color-scheme: light)",
      "(prefers-color-scheme: dark)",
    ]);
  });
});

describe("Aufbau des Root-Layouts", () => {
  /**
   * Das Layout rendert `<html>` und `<body>`; beides lässt sich in jsdom nicht
   * sinnvoll in einen Container hängen. Geprüft wird deshalb der zurückgegebene
   * Elementbaum, nicht das gerenderte DOM.
   */
  const tree = RootLayout({ children: <p>Inhalt</p> }) as React.ReactElement<{
    lang: string;
    children: React.ReactElement<{ children: React.ReactNode }>;
  }>;

  it("setzt die Seitensprache auf Deutsch", () => {
    expect(tree.props.lang).toBe("de");
  });

  it("enthält einen Sprunglink, den Hauptbereich und den Fußbereich", () => {
    const body = tree.props.children;
    const kinder = Array.isArray(body.props.children)
      ? body.props.children
      : [body.props.children];
    const typen = kinder.map((kind) =>
      typeof kind === "object" && kind !== null && "type" in kind
        ? (kind as { type: unknown }).type
        : null,
    );
    expect(typen).toContain("a");
    expect(typen).toContain("main");
    expect(typen).toContain(SiteFooter);
  });
});

describe("Fußbereich", () => {
  it("verlinkt Impressum und Datenschutz", () => {
    render(<SiteFooter />);
    for (const item of legalNav) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }
  });

  it("benennt die Navigation für Screenreader", () => {
    render(<SiteFooter />);
    expect(
      screen.getByRole("navigation", { name: /rechtliches/i }),
    ).toBeInTheDocument();
  });

  it("nennt den Seitennamen", () => {
    render(<SiteFooter />);
    expect(screen.getByText(site.name)).toBeInTheDocument();
  });

  it("verlinkt das öffentliche Repository", () => {
    // Damit jemand anders die Seite übernehmen kann, wenn der jetzige
    // Betreiber aufhört.
    render(<SiteFooter />);
    const link = screen.getByRole("link", { name: /github/i });
    expect(link).toHaveAttribute("href", site.repo);
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("nutzt eine erreichbare GitHub-URL", () => {
    const url = new URL(site.repo);
    expect(url.hostname).toBe("github.com");
    expect(url.pathname.split("/").filter(Boolean)).toHaveLength(2);
  });
});
