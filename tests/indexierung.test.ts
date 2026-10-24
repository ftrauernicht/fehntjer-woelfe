import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Die wichtigste Regel der Seite: sie darf nur in den Suchindex, wenn
 * die kanonische Domain gesetzt **und** das Impressum vollständig ist.
 *
 * `content/site.ts` liest die Umgebung beim Laden des Moduls. Deshalb muss
 * für jeden Fall die Modulregistrierung zurückgesetzt und neu importiert
 * werden – ein einfaches `process.env.X = ...` im Test würde zu spät kommen.
 */
async function ladeRobots(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) vi.stubEnv(key, "");
    else vi.stubEnv(key, value);
  }
  const mod = await import("@/app/robots");
  return mod.default();
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("robots.txt", () => {
  it("sperrt alles, solange keine kanonische Domain gesetzt ist", async () => {
    const result = await ladeRobots({ NEXT_PUBLIC_SITE_URL: undefined });
    expect(result.rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(result.sitemap).toBeUndefined();
  });

  it("sperrt auch auf einer *.vercel.app-Adresse", async () => {
    const result = await ladeRobots({
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: "fehntjer-woelfe.vercel.app",
    });
    expect(result.rules).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("sperrt bei gesetzter Domain, solange das Impressum Platzhalter enthält", async () => {
    // Das Impressum im Repository ist absichtlich noch unvollständig.
    const result = await ladeRobots({
      NEXT_PUBLIC_SITE_URL: "https://fehntjer-woelfe.de",
    });
    const { impressumIsComplete } = await import("@/content/site");

    if (impressumIsComplete) {
      // Sobald die Anschrift eingetragen ist, muss die Freigabe greifen.
      expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
      expect(result.sitemap).toBe("https://fehntjer-woelfe.de/sitemap.xml");
    } else {
      expect(result.rules).toEqual({ userAgent: "*", disallow: "/" });
    }
  });
});

describe("site.mayBeIndexed", () => {
  async function ladeSite(env: Record<string, string>) {
    vi.resetModules();
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    return import("@/content/site");
  }

  it("ist falsch ohne kanonische Domain", async () => {
    const { site } = await ladeSite({ NEXT_PUBLIC_SITE_URL: "" });
    expect(site.mayBeIndexed).toBe(false);
  });

  it("verlangt zusätzlich ein vollständiges Impressum", async () => {
    const { site, impressumIsComplete } = await ladeSite({
      NEXT_PUBLIC_SITE_URL: "https://fehntjer-woelfe.de",
    });
    expect(site.isCanonicalHost).toBe(true);
    expect(site.mayBeIndexed).toBe(impressumIsComplete);
  });
});

describe("Basis-URL", () => {
  async function ladeSite(env: Record<string, string>) {
    vi.resetModules();
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    return import("@/content/site");
  }

  it("bevorzugt die explizit gesetzte Domain", async () => {
    const { site } = await ladeSite({
      NEXT_PUBLIC_SITE_URL: "https://fehntjer-woelfe.de",
      VERCEL_PROJECT_PRODUCTION_URL: "irgendwas.vercel.app",
    });
    expect(site.url).toBe("https://fehntjer-woelfe.de");
  });

  it("schneidet einen abschließenden Schrägstrich ab", async () => {
    const { site } = await ladeSite({
      NEXT_PUBLIC_SITE_URL: "https://fehntjer-woelfe.de/",
    });
    expect(site.url).toBe("https://fehntjer-woelfe.de");
  });

  it("fällt auf die Vercel-URL zurück", async () => {
    const { site } = await ladeSite({
      NEXT_PUBLIC_SITE_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "fehntjer-woelfe.vercel.app",
    });
    expect(site.url).toBe("https://fehntjer-woelfe.vercel.app");
  });

  it("fällt zuletzt auf localhost zurück", async () => {
    const { site } = await ladeSite({
      NEXT_PUBLIC_SITE_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "",
    });
    expect(site.url).toBe("http://localhost:3000");
  });
});
