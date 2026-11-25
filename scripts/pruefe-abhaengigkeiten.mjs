#!/usr/bin/env node
/**
 * Prüft die Abhängigkeiten auf Schwachstellen – getrennt nach dem, was
 * ausgeliefert wird, und dem, was nur beim Entwickeln mitläuft.
 *
 * Läuft in der CI (`.github/workflows/ci.yml`) und lokal mit
 * `npm run pruefe:abhaengigkeiten`.
 *
 * Warum nicht einfach `npm audit --audit-level=moderate`: Dieser Aufruf wirft
 * beides in einen Topf. Am 16.11.2026 hat er den gesammelten Dependabot-Lauf
 * blockiert, weil neun moderate Funde in der eslint-Kette steckten – während
 * derselbe Lauf Next von 16.4.3 auf 16.4.6 gehoben und damit sieben echte
 * Hinweise an der ausgelieferten Anwendung geschlossen hätte. Das Tor hielt
 * die Behebung auf, für die es da ist.
 *
 * Die Maßstäbe sind deshalb verschieden:
 *
 * - **Was ausgeliefert wird**, ist ab `moderate` ein Abbruch. Hier gilt die
 *   ursprüngliche Begründung weiter: die Produktionsabhängigkeiten sind
 *   wenige, ein Treffer ist fast immer echt.
 * - **Was nur baut, prüft oder testet**, wird gemeldet und bricht erst ab
 *   `high` ab. Ein eslint-Plugin verarbeitet keine Besucheranfragen.
 *
 * Eine Ausnahme braucht Grund und Datum und fällt weg, sobald der Fund nicht
 * mehr gemeldet wird – darauf weist der Lauf dann selbst hin.
 *
 * Bewusst ohne Abhängigkeiten: `npm audit --json` und `node:child_process`
 * genügen.
 */

import { spawnSync } from "node:child_process";

/**
 * Ausnahmen, mit GHSA-Kennung als Schlüssel.
 *
 * Beispiel, falls einmal eine nötig wird:
 *   "GHSA-xxxx-yyyy-zzzz": { grund: "Kein Patch, Pfad nicht erreichbar", seit: "2026-11-25" }
 *
 * Leer ist der Normalfall. Eine Ausnahme ist eine Entscheidung, kein Zustand.
 */
const AUSNAHMEN = {};

const SCHWEREGRADE = ["info", "low", "moderate", "high", "critical"];
const abAb = (schwere, grenze) =>
  SCHWEREGRADE.indexOf(schwere) >= SCHWEREGRADE.indexOf(grenze);

function audit(nurProduktion) {
  const befehl = nurProduktion ? "npm audit --omit=dev --json" : "npm audit --json";
  const lauf = spawnSync(befehl, {
    encoding: "utf8",
    shell: true,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (!lauf.stdout) {
    console.error(`\`${befehl}\` hat nichts geliefert.`);
    console.error(lauf.stderr?.trim() ?? "");
    process.exit(2);
  }
  return JSON.parse(lauf.stdout);
}

/** Flacht den Bericht auf eine Karte GHSA → Fund ab. */
function funde(bericht) {
  const karte = new Map();
  for (const eintrag of Object.values(bericht.vulnerabilities ?? {})) {
    for (const via of eintrag.via) {
      if (typeof via !== "object" || !via.url) continue;
      karte.set(via.url.split("/").pop(), {
        paket: eintrag.name,
        schwere: via.severity,
        titel: via.title,
        behebbar: eintrag.fixAvailable,
      });
    }
  }
  return karte;
}

const alle = funde(audit(false));
const produktion = funde(audit(true));

let offen = 0;

function pruefe(gruppe, karte, grenze) {
  if (karte.size === 0) {
    console.log(`${gruppe}: nichts gemeldet.`);
    return;
  }
  console.log(`${gruppe}:`);
  for (const [ghsa, fund] of karte) {
    const ausnahme = AUSNAHMEN[ghsa];
    if (ausnahme) {
      console.log(`  Ausnahme ${ghsa} (${fund.paket}, seit ${ausnahme.seit}): ${ausnahme.grund}`);
    } else if (abAb(fund.schwere, grenze)) {
      offen++;
      const fix =
        typeof fund.behebbar === "object"
          ? ` – behoben in ${fund.behebbar.name}@${fund.behebbar.version}`
          : "";
      console.error(`  OFFEN ${fund.schwere} ${ghsa} in ${fund.paket}: ${fund.titel}${fix}`);
    } else {
      console.log(`  ${fund.schwere} ${ghsa} in ${fund.paket}: ${fund.titel}`);
    }
  }
}

const werkzeuge = new Map([...alle].filter(([ghsa]) => !produktion.has(ghsa)));

pruefe("Ausgeliefert", produktion, "moderate");
pruefe("Nur Werkzeuge", werkzeuge, "high");

for (const ghsa of Object.keys(AUSNAHMEN)) {
  if (!alle.has(ghsa)) {
    console.log(`Ausnahme ${ghsa} wird nicht mehr gemeldet. Aus diesem Skript entfernen.`);
  }
}

if (offen > 0) {
  console.error(`\n${offen} Fund(e) über der jeweiligen Grenze und ohne Ausnahme.`);
  process.exit(1);
}
console.log("\nKein Fund über der jeweiligen Grenze.");
