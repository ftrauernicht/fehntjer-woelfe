import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/**
 * Vorschaubild für geteilte Links (WhatsApp, Instagram-Bio, Facebook).
 *
 * Bewusst zur Laufzeit aus Text erzeugt statt als fertige Bilddatei: so bleibt
 * es automatisch synchron mit `content/site.ts` – auch wenn die Mannschaft in
 * die nächste Altersklasse aufrückt.
 *
 * Satori, die Engine hinter `ImageResponse`, verlangt bei jedem Element mit
 * mehr als einem Kindknoten ein explizites `display`. Deshalb steht an jedem
 * Container ein `display: "flex"` und jeder Text als fertige Zeichenkette.
 */
export const alt = site.titleDefault;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#c8102e",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {`${site.ageGroup} des ${site.club}`}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 104,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          {site.name}
        </div>

        {/* Weißer Balken als ruhiger Abschluss unter dem Namen */}
        <div
          style={{
            display: "flex",
            marginTop: 36,
            width: 160,
            height: 10,
            background: "#ffffff",
            borderRadius: 999,
          }}
        />

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 36,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {site.instagramHandle}
        </div>
      </div>
    ),
    size,
  );
}
