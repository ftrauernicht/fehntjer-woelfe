import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BilderPage from "@/app/bilder/page";
import DatenschutzPage from "@/app/datenschutz/page";
import ImpressumPage from "@/app/impressum/page";
import NotFound from "@/app/not-found";
import Home from "@/app/page";
import { gallery } from "@/content/gallery";
import { impressumIsComplete, site, venue } from "@/content/site";

describe("Startseite", () => {
  it("hat genau eine Hauptüberschrift", () => {
    render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("verlinkt Instagram sicher in einem neuen Tab", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: /instagram/i });
    expect(link).toHaveAttribute("href", site.instagram);
    expect(link).toHaveAttribute("target", "_blank");
    // Ohne noopener könnte die Zielseite über window.opener auf uns zugreifen.
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  // Der Vereinsabsatz verweist auf den Verein („läuft über den Verein
  // selbst"). Ohne Link lässt dieser Satz den Leser stehen – und die
  // Verknüpfung der beiden Entitäten fehlt auch den Suchmaschinen.
  it("verlinkt die Seite des Vereins", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: /verein/i });
    expect(link).toHaveAttribute("href", site.clubUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("bietet die E-Mail-Adresse als mailto an", () => {
    render(<Home />);
    const links = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href")?.startsWith("mailto:"));
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", `mailto:${site.email}`);
  });

  it("nennt die Spielstätte mit vollständiger Anschrift", () => {
    // Die Anschrift steht in einem <address> mit <br>-Umbrüchen, die Textknoten
    // sind also zerstückelt. Deshalb gegen den Elementinhalt prüfen.
    const { container } = render(<Home />);
    const anschrift = container.querySelector("address")!;
    const text = anschrift.textContent ?? "";
    for (const teil of [venue.name, venue.street, venue.postalCode, venue.city]) {
      expect(text, teil).toContain(teil);
    }
  });

  it("verlinkt die Karte sicher in einem neuen Tab", () => {
    render(<Home />);
    const link = screen.getByRole("link", { name: /karte/i });
    expect(link).toHaveAttribute("href", venue.mapUrl);
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("führt zur Bilderseite", () => {
    render(<Home />);
    expect(
      screen.getByRole("link", { name: /alle bilder ansehen/i }),
    ).toHaveAttribute("href", "/bilder");
  });
});

describe("Bilderseite", () => {
  it("zeigt jedes Bild der Galerie", () => {
    render(<BilderPage />);
    expect(screen.getAllByRole("img")).toHaveLength(gallery.length);
  });

  it("gibt jedem Bild seinen Alternativtext", () => {
    render(<BilderPage />);
    for (const image of gallery) {
      expect(screen.getByAltText(image.alt)).toBeInTheDocument();
    }
  });

  it("weist sichtbar darauf hin, dass die Bilder KI-generiert sind", () => {
    render(<BilderPage />);
    expect(screen.getByText(/mit KI erzeugt/i)).toBeInTheDocument();
  });

  it("lädt nur die ersten beiden Bilder sofort", () => {
    const { container } = render(<BilderPage />);
    const imgs = [...container.querySelectorAll("img")];
    expect(imgs.length).toBe(gallery.length);
  });
});

describe("Impressum", () => {
  it("nennt den Verantwortlichen", () => {
    render(<ImpressumPage />);
    // Der Name steht zweimal: in der Anschrift und unter "Verantwortlich
    // für den Inhalt". Beides ist gewollt.
    expect(screen.getAllByText(/Frank Trauernicht/).length).toBeGreaterThan(0);
  });

  it("stellt klar, dass die Seite privat betrieben wird", () => {
    render(<ImpressumPage />);
    expect(screen.getByText(/kein offizielles Angebot/i)).toBeInTheDocument();
  });

  it("warnt sichtbar, solange Platzhalter enthalten sind", () => {
    render(<ImpressumPage />);
    const warnung = screen.queryByRole("alert");
    if (impressumIsComplete) {
      expect(warnung).toBeNull();
    } else {
      expect(warnung).toBeInTheDocument();
    }
  });
});

describe("Datenschutz", () => {
  it("nennt den Hoster", () => {
    render(<DatenschutzPage />);
    expect(screen.getByText(/Vercel Inc\./)).toBeInTheDocument();
  });

  it("stellt klar, dass nichts getrackt wird", () => {
    render(<DatenschutzPage />);
    expect(screen.getByText(/keine Cookies/i)).toBeInTheDocument();
  });

  it("nennt eine Rechtsgrundlage", () => {
    render(<DatenschutzPage />);
    expect(screen.getAllByText(/Art\. 6 Abs\. 1 lit\. f DSGVO/).length).toBeGreaterThan(0);
  });
});

describe("404-Seite", () => {
  it("führt zurück zur Startseite", () => {
    render(<NotFound />);
    const main = screen.getByRole("heading", { level: 1 }).parentElement!;
    expect(
      within(main).getByRole("link", { name: /zur startseite/i }),
    ).toHaveAttribute("href", "/");
  });
});
