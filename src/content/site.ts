/**
 * Zentrale Inhalte und Stammdaten der Seite.
 *
 * Alles, was auf mehr als einer Route auftaucht, steht hier – damit Texte,
 * Adressen und Links nicht auseinanderlaufen. Die Tests in
 * `tests/site-content.test.ts` prüfen die Invarianten dieser Datei.
 */

/* -------------------------------------------------------------------------- */
/*  Basis-URL                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Basis-URL für Sitemap, robots.txt, Canonicals und Open-Graph-Tags.
 *
 * Reihenfolge:
 *   1. explizit gesetzte NEXT_PUBLIC_SITE_URL  (die echte Domain)
 *   2. die von Vercel bereitgestellte Produktions-URL (*.vercel.app)
 *   3. lokale Entwicklung
 */
function resolveUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/* -------------------------------------------------------------------------- */
/*  Impressum                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Platzhalter-Markierung. Solange dieser String irgendwo in `impressum` steht,
 * gilt das Impressum als unvollständig – und die Seite stellt sich selbst auf
 * noindex (siehe `app/robots.ts`).
 *
 * Das ist Absicht: eine öffentlich erreichbare Seite ohne vollständiges
 * Impressum ist nach § 5 DDG angreifbar. Lieber gar nicht indexiert als
 * falsch indexiert.
 */
export const PLACEHOLDER = "AUSFUELLEN";

/**
 * Impressum nach § 5 DDG.
 *
 * Betreiber ist eine Privatperson, nicht der SV Grossefehn e.V. – die Seite
 * tritt deshalb bewusst als private Seite rund um die F-Jugend auf und nicht
 * als offizielles Vereinsangebot.
 */
export const impressum = {
  name: "Frank Trauernicht",
  /**
   * Ladungsfähige Anschrift nach § 5 DDG – vollständig mit Straße.
   * Die Zeilen werden in dieser Reihenfolge untereinander ausgegeben.
   */
  addressLines: ["Süderwieke Nord 20", "26629 Großefehn", "Deutschland"],
  email: "mail@fehntjer-woelfe.de",
} as const;

/** true, sobald kein Platzhalter mehr im Impressum steht. */
export const impressumIsComplete = ![
  impressum.name,
  ...impressum.addressLines,
  impressum.email,
].some((value) => value.includes(PLACEHOLDER));

/* -------------------------------------------------------------------------- */
/*  Stammdaten                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Die aktuelle Altersklasse.
 *
 * Steht bewusst an genau einer Stelle: ein Jahrgang rückt jedes Jahr auf, aus
 * der F-Jugend wird die E-Jugend. Wer das hier ändert, hat die Seite
 * umgestellt – Titel, Description, strukturierte Daten und Seitentext ziehen
 * automatisch nach.
 *
 * Nicht behaupten, die Mannschaft sei die jüngste im Verein: unter der
 * F-Jugend gibt es noch die G-Jugend.
 */
export const ageGroup = "F-Jugend";

export const site = {
  name: "Fehntjer Wölfe",
  /**
   * Schreibvarianten.
   *
   * Der Name kommt in zwei Schreibweisen vor: mit Umlaut („Wölfe") und in
   * Umschrift („Woelfe", so wie in der Domain). Dasselbe gilt für den Verein:
   * „Großefehn" mit ß, „Grossefehn" mit ss – das Vereinswappen selbst nutzt
   * die ss-Schreibung.
   *
   * Suchmaschinen führen Umlaut und Umschrift zwar meist zusammen, aber
   * verlassen sollte man sich darauf nicht. Deshalb tauchen beide Varianten
   * im Seitentext und in den strukturierten Daten auf – natürlich formuliert,
   * nicht als Stichwortliste.
   */
  alternateNames: [
    "Fehntjer Woelfe",
    "Fehntjer Wölfe Großefehn",
    `${ageGroup} SV Großefehn`,
    `${ageGroup} SV Grossefehn`,
  ],
  /** Altersklasse – siehe `ageGroup`, ändert sich beim Aufrücken. */
  ageGroup,
  /** Vollständiger Titel der Startseite – ohne zusätzliches Marken-Suffix. */
  titleDefault: `Fehntjer Wölfe – ${ageGroup} des SV Großefehn`,
  /** Meta-Description, bewusst auf 120–160 Zeichen gehalten. */
  description: `Die Fehntjer Wölfe sind eine Nachwuchsmannschaft des SV Großefehn in Ostfriesland, aktuell in der ${ageGroup}. Neuigkeiten gibt es auf Instagram.`,
  url: resolveUrl(),
  email: impressum.email,
  instagram: "https://www.instagram.com/fehntjer_woelfe/",
  instagramHandle: "@fehntjer_woelfe",
  /**
   * Der Quelltext dieser Seite, öffentlich.
   *
   * Steht sichtbar im Fußbereich, damit jemand anders die Seite übernehmen
   * kann, wenn der jetzige Betreiber es nicht mehr macht. Eine Vereinsseite,
   * deren Quelltext niemand findet, ist nach einem Wechsel verloren.
   */
  repo: "https://github.com/ftrauernicht/fehntjer-woelfe",
  /** Schreibweise wie auf dem Vereinswappen. */
  club: "SV Grossefehn e.V.",
  /** Schreibweise des Ortsnamens im Duden und auf der Landkarte. */
  clubUmlaut: "SV Großefehn",
  locality: "Großefehn",
  region: "Niedersachsen",

  /** true, sobald die endgültige Domain über NEXT_PUBLIC_SITE_URL gesetzt ist. */
  isCanonicalHost: Boolean(process.env.NEXT_PUBLIC_SITE_URL),

  /**
   * Nur wenn beides stimmt, darf die Seite in den Index: die richtige Domain
   * *und* ein vollständiges Impressum.
   */
  get mayBeIndexed(): boolean {
    return this.isCanonicalHost && impressumIsComplete;
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  Seiteninhalte                                                              */
/* -------------------------------------------------------------------------- */

export const home = {
  eyebrow: `${ageGroup} des SV Großefehn`,
  /**
   * Die Hauptüberschrift trägt den Markennamen, nicht „Hier entsteht etwas".
   * Die h1 ist das stärkste Signal auf der Seite – sie gehört dem Begriff,
   * unter dem man gefunden werden will.
   */
  title: "Fehntjer Wölfe",
  lead: `Die ${ageGroup}-Nachwuchsfußballmannschaft des SV Großefehn.`,
  /**
   * Nennt den Verein bewusst nicht noch einmal: er steht schon im Eyebrow
   * direkt darüber und im Lead. Dreimal hintereinander liest sich schlecht.
   */
  text: "Moin! Wir sind die Fehntjer Wölfe aus Ostfriesland. An unserer Website wird gerade gebaut – auf Instagram sind wir aber längst unterwegs.",

  /**
   * Bewusst knapp. Frühere Fassungen behaupteten Dinge, die nicht für jedes
   * Kind und nicht für jede Saison stimmen – Kleinfeld, Aufrücken in die
   * E-Jugend, „jüngste Mannschaft". Alles raus. Hier steht nur, was dauerhaft
   * zutrifft.
   */
  about: {
    title: "Wer wir sind",
    paragraphs: [
      "Die Fehntjer Wölfe spielen beim SV Grossefehn e.V. in Ostfriesland. Was ansteht – Training, Spieltage, alles andere – teilen wir über Instagram und irgendwann auch hier.",
    ],
  },

  club: {
    title: `Teil des ${"SV Grossefehn e.V."}`,
    text: "Die Fehntjer Wölfe sind eine Nachwuchsmannschaft des Sportvereins Grossefehn. Alles rund um den Gesamtverein läuft über den Verein selbst – hier geht es nur um unsere Mannschaft.",
  },

  instagramCta: "Auf Instagram vorbeischauen",
  mailCta: "Schreib uns eine E-Mail",
  mailHint: "Fragen zum Training, zum Probetraining oder zum Verein?",
} as const;

/**
 * Die beiden Wappen.
 *
 * Erzeugt von `scripts/optimize-images.mjs` aus den Originalen im
 * Referenzordner. Masse hier festhalten, damit Next das Bild ohne
 * Layoutsprung reservieren kann.
 */
export const logos = {
  woelfe: {
    src: "/logo/woelfe-wappen.webp",
    width: 640,
    height: 637,
    alt: "Wappen der Fehntjer Wölfe: ein Wolf im rot-weißen Trikot mit Fußball",
  },
  verein: {
    src: "/logo/svg-vereinswappen.webp",
    width: 256,
    height: 256,
    alt: "Vereinswappen des SV Grossefehn e.V.",
  },
} as const;

export const legalNav = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
] as const;
