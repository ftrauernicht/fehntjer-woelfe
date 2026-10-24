import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/**
 * Vorschaubild für geteilte Links (WhatsApp, Teams, Instagram-Bio, Facebook).
 *
 * Bewusst zur Laufzeit erzeugt statt als fertige Bilddatei: so bleibt es
 * automatisch synchron mit `content/site.ts` – auch wenn die Mannschaft in
 * die nächste Altersklasse aufrückt.
 *
 * Das Wappen wird aus `assets/` gelesen und als Data-URI eingebettet. Satori,
 * die Engine hinter `ImageResponse`, kann keine Pfade auflösen; es braucht die
 * Bilddaten direkt. `assets/` statt `public/`, weil die Datei zur Laufzeit
 * gelesen und nicht vom Browser geladen wird – Next.js verfolgt den Pfad beim
 * Bauen und packt sie mit ein.
 *
 * Satori verlangt außerdem bei jedem Element mit mehr als einem Kindknoten ein
 * explizites `display`. Deshalb steht an jedem Container ein `display: "flex"`
 * und jeder Text als fertige Zeichenkette.
 */
export const alt = site.titleDefault;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const wappen = await readFile(
    join(process.cwd(), "assets", "woelfe-wappen-og.png"),
  );
  const wappenSrc = `data:image/png;base64,${wappen.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 70,
          padding: "0 90px",
          background: "#bf0b02",
          color: "#ffffff",
        }}
      >
        {/*
          Das Wappen hat einen weißen Hintergrund und steht deshalb auf einer
          weißen Karte – genauso wie auf der Startseite.
        */}
        <div
          style={{
            display: "flex",
            flexShrink: 0,
            padding: 18,
            background: "#ffffff",
            borderRadius: 44,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wappenSrc} width={300} height={300} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 27,
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
              marginTop: 14,
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            {site.name}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 30,
              width: 150,
              height: 9,
              background: "#ffffff",
              borderRadius: 999,
            }}
          />

          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 33,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {site.instagramHandle}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
