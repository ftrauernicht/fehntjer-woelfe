import Link from "next/link";
import { impressum, impressumIsComplete, site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Impressum",
  description: `Impressum und Anbieterkennzeichnung nach § 5 DDG für ${site.name}.`,
  path: "/impressum",
  // Rechtstexte gehören nicht in den Suchindex – sie konkurrieren mit den
  // eigentlichen Inhalten und bringen keine sinnvollen Treffer.
  noindex: true,
});

/** „frank-trauernicht.de“ – ohne Schema, so wie man es vorliest. */
const betreiberseite = new URL(impressum.website).host;

export default function ImpressumPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
      >
        ← Zurück zur Startseite
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Impressum</h1>

      {!impressumIsComplete && (
        <p
          role="alert"
          className="mt-6 rounded-xl border-2 border-brand-red bg-brand-red/5 p-4 text-sm font-semibold text-brand-red"
        >
          Dieses Impressum ist noch unvollständig. Solange das so ist, hält sich
          die Seite selbst aus dem Suchindex heraus.
        </p>
      )}

      <h2 className="mt-10 text-lg font-semibold">
        Angaben gemäß § 5 DDG
      </h2>
      <address className="mt-3 not-italic leading-relaxed text-muted">
        {impressum.name}
        {impressum.addressLines.map((zeile) => (
          <span key={zeile}>
            <br />
            {zeile}
          </span>
        ))}
      </address>
      <p className="mt-3 text-muted">
        Eigene Seite des Betreibers:{" "}
        <a
          href={impressum.website}
          target="_blank"
          rel="me noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          {betreiberseite}
          <span className="sr-only"> (öffnet in neuem Tab)</span>
        </a>
      </p>

      <h2 className="mt-8 text-lg font-semibold">Kontakt</h2>
      <p className="mt-3 text-muted">
        E-Mail:{" "}
        <a
          href={`mailto:${impressum.email}`}
          className="underline underline-offset-4"
        >
          {impressum.email}
        </a>
      </p>

      <h2 className="mt-8 text-lg font-semibold">
        Verantwortlich für den Inhalt
      </h2>
      <p className="mt-3 text-muted">{impressum.name}, Anschrift wie oben.</p>

      <h2 className="mt-8 text-lg font-semibold">Hinweis zum Verein</h2>
      <p className="mt-3 leading-relaxed text-muted text-pretty">
        Diese Seite wird privat betrieben und ist kein offizielles Angebot des{" "}
        {site.club}. Sie begleitet die F-Jugend der Fehntjer Wölfe. Für Inhalte
        des Vereins ist der Verein selbst verantwortlich.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Bilder</h2>
      <p className="mt-3 leading-relaxed text-muted text-pretty">
        Die Maskottchen-Bilder auf dieser Seite sind KI-generiert. Sie zeigen
        gezeichnete Figuren und keine realen Personen.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Streitschlichtung</h2>
      <p className="mt-3 leading-relaxed text-muted text-pretty">
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungs­verfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </div>
  );
}
