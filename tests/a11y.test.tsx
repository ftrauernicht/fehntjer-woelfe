import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import BilderPage from "@/app/bilder/page";
import DatenschutzPage from "@/app/datenschutz/page";
import ImpressumPage from "@/app/impressum/page";
import NotFound from "@/app/not-found";
import Home from "@/app/page";
import { SiteFooter } from "@/components/site-footer";

/**
 * Automatisierte Barrierefreiheitsprüfung mit axe.
 *
 * Das ersetzt keine Prüfung mit echten Hilfsmitteln – axe findet etwa 30 bis
 * 40 Prozent der üblichen Probleme. Aber es findet sie bei *jedem* Testlauf,
 * und es verhindert, dass ein fehlender Alternativtext oder ein kaputter
 * Kontrast unbemerkt in den Hauptzweig wandert.
 */
const seiten = [
  ["Startseite", <Home key="home" />],
  ["Bilderseite", <BilderPage key="bilder" />],
  ["Impressum", <ImpressumPage key="impressum" />],
  ["Datenschutz", <DatenschutzPage key="datenschutz" />],
  ["404", <NotFound key="404" />],
  ["Fußbereich", <SiteFooter key="footer" />],
] as const;

describe("Barrierefreiheit", () => {
  for (const [name, element] of seiten) {
    it(`${name} hat keine axe-Verstöße`, async () => {
      const { container } = render(element);
      const ergebnis = await axe(container);
      expect(ergebnis.violations).toEqual([]);
    });
  }
});

describe("Wappen", () => {
  it("wird im Fußbereich als dekorativ ausgezeichnet", () => {
    // Das Wappen steht direkt neben dem ausgeschriebenen Namen. Ein
    // Alternativtext würde den Namen doppelt vorlesen.
    const { container } = render(<SiteFooter />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("alt", "");
  });

  it("trägt auf der Startseite einen beschreibenden Alternativtext", () => {
    const { container } = render(<Home />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("alt")!.length).toBeGreaterThan(20);
  });
});

describe("Überschriften-Hierarchie", () => {
  /**
   * Screenreader navigieren über Überschriften. Eine übersprungene Ebene
   * (h1 direkt auf h3) macht diese Navigation kaputt.
   */
  for (const [name, element] of seiten) {
    it(`${name} überspringt keine Überschriftenebene`, () => {
      const { container } = render(element);
      const ebenen = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
        (h) => Number(h.tagName[1]),
      );
      for (let i = 1; i < ebenen.length; i++) {
        expect(ebenen[i] - ebenen[i - 1]).toBeLessThanOrEqual(1);
      }
    });
  }
});
