import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import { proxy } from "@/proxy";

function csp(): string {
  const request = new NextRequest("https://fehntjer-woelfe.de/");
  const value = proxy(request).headers.get("content-security-policy");
  expect(value).toBeTruthy();
  return value!;
}

/** Zerlegt die CSP in ihre Direktiven. */
function directives(): Map<string, string> {
  return new Map(
    csp()
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...rest] = part.split(" ");
        return [name, rest.join(" ")] as const;
      }),
  );
}

describe("Content-Security-Policy", () => {
  it("wird überhaupt gesetzt", () => {
    expect(csp()).toContain("default-src 'self'");
  });

  it("vergibt pro Anfrage einen frischen Nonce", () => {
    const a = csp().match(/'nonce-([^']+)'/)?.[1];
    const b = csp().match(/'nonce-([^']+)'/)?.[1];
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(a).not.toBe(b);
  });

  it("reicht den Nonce als x-nonce an das Rendering weiter", () => {
    const request = new NextRequest("https://fehntjer-woelfe.de/");
    const response = proxy(request);
    const fromCsp = response.headers
      .get("content-security-policy")!
      .match(/'nonce-([^']+)'/)![1];
    // Next liest den Nonce aus der CSP; der x-nonce-Header dient eigenem Code
    // wie dem JSON-LD-Block. Beide müssen denselben Wert tragen.
    expect(fromCsp).toBeTruthy();
  });

  it("erlaubt keine Inline-Skripte ohne Nonce", () => {
    expect(directives().get("script-src")).not.toContain("'unsafe-inline'");
  });

  it("erlaubt kein eval in der Produktion", () => {
    // NODE_ENV ist im Test nicht "development", also darf unsafe-eval fehlen.
    expect(directives().get("script-src")).not.toContain("'unsafe-eval'");
  });

  it("verbietet Einbettung in fremde Seiten", () => {
    expect(directives().get("frame-ancestors")).toBe("'none'");
  });

  it("verbietet Objekt-Einbettungen und fremde base-URLs", () => {
    expect(directives().get("object-src")).toBe("'none'");
    expect(directives().get("base-uri")).toBe("'self'");
  });

  it("erzwingt HTTPS für Unterressourcen", () => {
    expect(directives().has("upgrade-insecure-requests")).toBe(true);
  });
});

describe("Sicherheits-Header aus next.config", () => {
  async function headerMap() {
    const groups = await nextConfig.headers!();
    const entry = groups.find((g) => g.source === "/:path*");
    expect(entry).toBeDefined();
    return new Map(entry!.headers.map((h) => [h.key, h.value]));
  }

  it("verbietet MIME-Sniffing", async () => {
    expect((await headerMap()).get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("verhindert Klickjacking auch in alten Browsern", async () => {
    expect((await headerMap()).get("X-Frame-Options")).toBe("DENY");
  });

  it("gibt beim Verlassen der Seite keinen vollen Pfad preis", async () => {
    expect((await headerMap()).get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("schaltet Kamera, Mikrofon und Standort ab", async () => {
    const value = (await headerMap()).get("Permissions-Policy")!;
    for (const feature of ["camera=()", "microphone=()", "geolocation=()"]) {
      expect(value).toContain(feature);
    }
  });

  it("setzt HSTS mit langer Laufzeit, aber ohne preload", async () => {
    const value = (await headerMap()).get("Strict-Transport-Security")!;
    expect(value).toContain("includeSubDomains");
    // preload ist eine Einbahnstraße und bleibt bewusst aus.
    expect(value).not.toContain("preload");
    const maxAge = Number(value.match(/max-age=(\d+)/)![1]);
    expect(maxAge).toBeGreaterThanOrEqual(31536000);
  });

  it("verrät die eingesetzte Technik nicht", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
