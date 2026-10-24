#!/usr/bin/env node
/**
 * Wachhund – prüft die veröffentlichte Seite von außen.
 *
 * Läuft täglich in GitHub Actions (`.github/workflows/wachhund.yml`) und lokal
 * mit `npm run pruefe:live`. Schlägt eine Prüfung fehl, wird der Lauf rot und
 * GitHub schickt eine Mail. Das ist der ganze Zweck: niemand soll regelmäßig
 * nachsehen müssen.
 *
 * Geprüft wird nur, was hier schon einmal kaputt war oder unbemerkt
 * kaputtgehen könnte:
 *
 * - **robots.txt** – fehlt `NEXT_PUBLIC_SITE_URL`, sperrt sich die Seite
 *   selbst aus dem Suchindex. Von außen fällt das sonst monatelang nicht auf.
 * - **Bilddateien** – ein abgebrochener Bildlauf hat schon einmal ein Wappen
 *   aus dem Repository gelöscht.
 * - **AAAA-Eintrag** – ein alter AAAA zeigte auf einen Parkserver ohne
 *   Zertifikat; IPv6-Clients bekamen SSL_PROTOCOL_ERROR.
 * - **MX, SPF, DMARC** – ohne SPF lehnt die eigene DMARC-Regel (`p=reject`)
 *   jede ausgehende Mail ab, statt sie nur zu markieren.
 *
 * Bewusst ohne Abhängigkeiten: `fetch`, `node:dns` und `node:tls` genügen.
 */

import { resolve4, resolve6, resolveMx, resolveTxt } from "node:dns/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { connect } from "node:tls";
import { fileURLToPath } from "node:url";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = process.env.PRUEF_DOMAIN ?? "fehntjer-woelfe.de";
const BASIS = `https://${DOMAIN}`;
const ZEITGRENZE = 15_000;
const ZERTIFIKAT_MINDESTTAGE = 14;

// --------------------------------------------------------------- Hilfsteile
// Die beiden folgenden Funktionen sind rein und werden in
// tests/wachhund.test.ts geprüft – sie tragen die eigentliche Logik.

/** Liest aus einer robots.txt, ob die Seite indexiert werden darf. */
export function bewerteRobots(text) {
  const gesperrt = /^\s*Disallow:\s*\/\s*$/im.test(text);
  const sitemap = text.match(/^\s*Sitemap:\s*(\S+)/im)?.[1] ?? null;
  return { erlaubt: !gesperrt, sitemap };
}

/** Zieht die Adresse des Vorschaubildes aus dem HTML der Seite. */
export function findeOgBild(html, basis) {
  const tag = html.match(/<meta[^>]*(?:property|name)="og:image"[^>]*>/i)?.[0];
  const adresse = tag?.match(/content="([^"]+)"/i)?.[1];
  return adresse ? new URL(adresse, basis).href : null;
}

async function hole(adresse) {
  const antwort = await fetch(adresse, {
    redirect: "follow",
    signal: AbortSignal.timeout(ZEITGRENZE),
    headers: { "user-agent": "fehntjer-woelfe-wachhund" },
  });
  if (!antwort.ok) throw new Error(`HTTP ${antwort.status} für ${adresse}`);
  return antwort;
}

/** Prüft eine Datei auf Erreichbarkeit, Typ und eine Mindestgröße. */
async function pruefeDatei(pfad, typ, mindestBytes) {
  const antwort = await hole(`${BASIS}${pfad}`);
  const istTyp = antwort.headers.get("content-type") ?? "";
  if (!istTyp.includes(typ)) {
    throw new Error(`${pfad}: Typ ${istTyp}, erwartet ${typ}`);
  }
  const bytes = (await antwort.arrayBuffer()).byteLength;
  if (bytes < mindestBytes) throw new Error(`${pfad}: nur ${bytes} Bytes`);
  return bytes;
}

/** Fehlt ein Eintrag, meldet die Auflösung ENODATA – das ist kein Fehler. */
async function dnsOderLeer(aufgabe) {
  try {
    return await aufgabe();
  } catch (fehler) {
    if (fehler.code === "ENODATA" || fehler.code === "ENOTFOUND") return [];
    throw fehler;
  }
}

function restlaufzeitZertifikat(host) {
  return new Promise((fertig, fehlgeschlagen) => {
    const verbindung = connect({ host, port: 443, servername: host }, () => {
      const zertifikat = verbindung.getPeerCertificate();
      verbindung.end();
      if (!zertifikat?.valid_to) {
        fehlgeschlagen(new Error("kein Zertifikat erhalten"));
        return;
      }
      const tage = (Date.parse(zertifikat.valid_to) - Date.now()) / 86_400_000;
      fertig(Math.floor(tage));
    });
    verbindung.setTimeout(ZEITGRENZE, () => {
      verbindung.destroy(new Error("Zeitüberschreitung"));
    });
    verbindung.on("error", fehlgeschlagen);
  });
}

// ------------------------------------------------------------------- Ablauf

const ergebnisse = [];

async function pruefe(name, aufgabe) {
  try {
    ergebnisse.push({ name, ok: true, hinweis: (await aufgabe()) ?? "" });
  } catch (fehler) {
    ergebnisse.push({ name, ok: false, hinweis: fehler.message });
  }
}

async function main() {
  await pruefe("Startseite", async () => {
    const html = await (await hole(`${BASIS}/`)).text();
    if (!html.includes("Fehntjer Wölfe")) {
      throw new Error("Mannschaftsname fehlt im HTML");
    }
    return `${Math.round(html.length / 1024)} KB`;
  });

  await pruefe("Bilderseite", async () => {
    const html = await (await hole(`${BASIS}/bilder`)).text();
    return `${Math.round(html.length / 1024)} KB`;
  });

  await pruefe("Sitemap", async () => {
    const antwort = await hole(`${BASIS}/sitemap.xml`);
    const typ = antwort.headers.get("content-type") ?? "";
    if (!typ.includes("xml")) throw new Error(`Typ ${typ}, erwartet XML`);
    const xml = await antwort.text();
    for (const adresse of [BASIS, `${BASIS}/bilder`]) {
      if (!xml.includes(`<loc>${adresse}</loc>`)) {
        throw new Error(`${adresse} fehlt in der Sitemap`);
      }
    }
    return "2 Adressen";
  });

  // Der wichtigste Posten: ohne NEXT_PUBLIC_SITE_URL sperrt sich die Seite
  // selbst aus, und die Suchmaschinen vergessen sie still.
  await pruefe("Indexierung freigegeben", async () => {
    const text = await (await hole(`${BASIS}/robots.txt`)).text();
    const { erlaubt, sitemap } = bewerteRobots(text);
    if (!erlaubt) throw new Error("robots.txt sperrt die ganze Seite");
    if (sitemap !== `${BASIS}/sitemap.xml`) {
      throw new Error(`Sitemap-Zeile lautet: ${sitemap}`);
    }
    return "Allow und Sitemap-Zeile vorhanden";
  });

  await pruefe("Vorschaubild", async () => {
    const html = await (await hole(`${BASIS}/`)).text();
    const adresse = findeOgBild(html, BASIS);
    if (!adresse) throw new Error("kein og:image im HTML");
    const bytes = (await (await hole(adresse)).arrayBuffer()).byteLength;
    if (bytes < 20_000) {
      throw new Error(`nur ${bytes} Bytes – Wappen wahrscheinlich weg`);
    }
    return `${Math.round(bytes / 1024)} KB`;
  });

  await pruefe("Wappen", async () => {
    const a = await pruefeDatei("/logo/woelfe-wappen.webp", "image/webp", 2_000);
    const b = await pruefeDatei("/logo/svg-vereinswappen.webp", "image/webp", 2_000);
    return `${Math.round(a / 1024)} + ${Math.round(b / 1024)} KB`;
  });

  // Die Liste kommt aus derselben Quelle wie die Website, damit ein neues
  // Bild automatisch mitgeprüft wird.
  await pruefe("Galeriebilder", async () => {
    const pfad = path.join(HIER, "..", "src", "content", "gallery.json");
    const galerie = JSON.parse(await readFile(pfad, "utf8"));
    for (const bild of galerie) {
      await pruefeDatei(`/bilder/${bild.slug}.webp`, "image/webp", 5_000);
    }
    return `${galerie.length} Bilder`;
  });

  await pruefe("A-Eintrag", async () => (await resolve4(DOMAIN)).join(", "));

  // Ein AAAA auf dem Apex hat hier schon einmal IPv6-Clients auf einen
  // fremden Parkserver ohne Zertifikat geschickt.
  await pruefe("Kein AAAA-Eintrag", async () => {
    const adressen = await dnsOderLeer(() => resolve6(DOMAIN));
    if (adressen.length > 0) {
      throw new Error(`AAAA vorhanden: ${adressen.join(", ")}`);
    }
    return "leer, wie gewollt";
  });

  await pruefe("Posteingang (MX)", async () => {
    const eintraege = await resolveMx(DOMAIN);
    const ziele = eintraege.map((e) => e.exchange.toLowerCase());
    if (!ziele.some((e) => e.endsWith("rzone.de"))) {
      throw new Error(`MX zeigt auf ${ziele.join(", ")}`);
    }
    return ziele.join(", ");
  });

  await pruefe("Postausgang (SPF)", async () => {
    const eintraege = (await resolveTxt(DOMAIN)).map((t) => t.join(""));
    const spf = eintraege.find((e) => e.startsWith("v=spf1"));
    if (!spf) {
      throw new Error("kein SPF – DMARC p=reject lehnt dann jede Mail ab");
    }
    return spf;
  });

  await pruefe("DMARC", async () => {
    const eintraege = (await resolveTxt(`_dmarc.${DOMAIN}`)).map((t) => t.join(""));
    const dmarc = eintraege.find((e) => e.startsWith("v=DMARC1"));
    if (!dmarc) throw new Error("kein DMARC-Eintrag");
    return dmarc;
  });

  await pruefe("Zertifikat", async () => {
    const tage = await restlaufzeitZertifikat(DOMAIN);
    if (tage < ZERTIFIKAT_MINDESTTAGE) {
      throw new Error(`läuft in ${tage} Tagen ab`);
    }
    return `${tage} Tage Restlaufzeit`;
  });

  const breite = Math.max(...ergebnisse.map((e) => e.name.length));
  console.log(`Wachhund für ${DOMAIN} – ${new Date().toISOString()}\n`);
  for (const { name, ok, hinweis } of ergebnisse) {
    console.log(`${ok ? "  ok  " : "FEHLER"}  ${name.padEnd(breite)}  ${hinweis}`);
  }

  const fehler = ergebnisse.filter((e) => !e.ok);
  const bestanden = ergebnisse.length - fehler.length;
  console.log(`\n${bestanden} von ${ergebnisse.length} Prüfungen bestanden.`);
  if (fehler.length > 0) {
    console.log(`Fehlgeschlagen: ${fehler.map((e) => e.name).join(", ")}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
