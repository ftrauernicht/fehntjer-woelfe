import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/**
 * `next/headers` gibt es nur im Server-Kontext. Die Tests rendern Komponenten
 * in jsdom, deshalb hier ein schlanker Ersatz, der den Nonce zurückgibt, den
 * `proxy.ts` im echten Betrieb setzt.
 */
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-nonce": "test-nonce" }),
}));

/**
 * `next/font` lädt und optimiert Schriften zur Bauzeit – das geht in einem
 * Testlauf nicht. Der Ersatz liefert nur die CSS-Klassennamen, die das Layout
 * an das <html>-Element hängt.
 */
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist", className: "font-geist" }),
}));

/**
 * `next/image` rendert in jsdom sonst mit Next-spezifischen Attributen, die
 * React als unbekannte DOM-Props anmeckert. Für die Tests reicht ein <img>.
 */
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    const { priority, loading, sizes, ...safe } = rest as Record<
      string,
      unknown
    >;
    void priority;
    void loading;
    void sizes;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...safe} />;
  },
}));
