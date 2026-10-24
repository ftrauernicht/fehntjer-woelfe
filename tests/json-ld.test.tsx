import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { JsonLdScript } from "@/components/json-ld";

/**
 * `JsonLdScript` ist eine asynchrone Server-Komponente. Statt sie zu rendern,
 * wird sie hier aufgerufen und das zurückgegebene Element geprüft – das ist
 * genau die Grenze, an der die Komponente etwas entscheidet.
 */
async function renderToElement(data: Parameters<typeof JsonLdScript>[0]["data"]) {
  return (await JsonLdScript({ data })) as ReactElement<{
    type: string;
    nonce?: string;
    dangerouslySetInnerHTML: { __html: string };
  }>;
}

describe("JsonLdScript", () => {
  it("gibt einen JSON-LD-Block aus", async () => {
    const el = await renderToElement({ "@type": "Thing" });
    expect(el.props.type).toBe("application/ld+json");
  });

  it("übernimmt den Nonce aus den Request-Headern", async () => {
    const el = await renderToElement({ "@type": "Thing" });
    // vitest.setup.tsx liefert "test-nonce" als x-nonce.
    expect(el.props.nonce).toBe("test-nonce");
  });

  it("schreibt gültiges JSON", async () => {
    const el = await renderToElement({ "@type": "Thing", name: "Wölfe" });
    const parsed = JSON.parse(el.props.dangerouslySetInnerHTML.__html);
    expect(parsed).toEqual({ "@type": "Thing", name: "Wölfe" });
  });

  it("verhindert den Ausbruch aus dem script-Element", async () => {
    // Ohne Maskierung würde dieser Wert ein </script> in den Quelltext
    // schreiben und den Rest der Seite zu Markup machen.
    const el = await renderToElement({
      "@type": "Thing",
      name: "</script><script>alert(1)</script>",
    });
    const html = el.props.dangerouslySetInnerHTML.__html;
    expect(html).not.toContain("</script>");
    expect(html).toContain("\\u003c");
    // Trotz Maskierung muss der Inhalt gültiges JSON bleiben.
    expect(() => JSON.parse(html)).not.toThrow();
  });

  it("nimmt auch eine Liste von Schemata", async () => {
    const el = await renderToElement([{ "@type": "A" }, { "@type": "B" }]);
    const parsed = JSON.parse(el.props.dangerouslySetInnerHTML.__html);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
  });
});
