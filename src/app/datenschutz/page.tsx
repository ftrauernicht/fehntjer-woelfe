import Link from "next/link";
import { impressum, site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Datenschutz",
  description: `Datenschutzerklärung für ${site.name}.`,
  path: "/datenschutz",
  noindex: true,
});

export default function DatenschutzPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
      >
        ← Zurück zur Startseite
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Datenschutz</h1>

      <p className="mt-6 leading-relaxed text-muted text-pretty">
        Diese Seite ist eine reine Informationsseite. Sie setzt keine Cookies,
        bindet keine Analyse- oder Werbedienste ein und lädt keine Inhalte von
        fremden Servern nach. Es gibt kein Kontaktformular und keine Anmeldung.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Verantwortlicher</h2>
      <address className="mt-3 not-italic leading-relaxed text-muted">
        {impressum.name}
        {impressum.addressLines.map((zeile) => (
          <span key={zeile}>
            <br />
            {zeile}
          </span>
        ))}
        <br />
        E-Mail:{" "}
        <a
          href={`mailto:${impressum.email}`}
          className="underline underline-offset-4"
        >
          {impressum.email}
        </a>
      </address>

      <h2 className="mt-8 text-lg font-semibold">Hosting und Server-Logs</h2>
      <p className="mt-3 leading-relaxed text-muted text-pretty">
        Die Seite wird bei der Vercel Inc., 440 N Barranca Ave #4133, Covina, CA
        91723, USA gehostet. Beim Abruf der Seite verarbeitet Vercel technisch
        notwendige Verbindungsdaten wie IP-Adresse, Zeitpunkt der Anfrage,
        abgerufene Adresse, übertragene Datenmenge und den verwendeten Browser.
        Diese Daten sind nötig, damit die Seite überhaupt ausgeliefert werden
        kann, und dienen der Sicherheit des Betriebs.
      </p>
      <p className="mt-3 leading-relaxed text-muted text-pretty">
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO – unser berechtigtes
        Interesse am sicheren und zuverlässigen Betrieb der Seite. Mit Vercel
        besteht ein Vertrag zur Auftragsverarbeitung. Die Übermittlung in die
        USA stützt sich auf die Standardvertragsklauseln der EU-Kommission.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Kontakt per E-Mail</h2>
      <p className="mt-3 leading-relaxed text-muted text-pretty">
        Wenn Sie uns eine E-Mail schreiben, verarbeiten wir Ihre Angaben
        ausschließlich, um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art.
        6 Abs. 1 lit. f DSGVO. Die Nachrichten werden gelöscht, sobald sie nicht
        mehr benötigt werden und keine gesetzlichen Aufbewahrungsfristen
        entgegenstehen. Das Postfach liegt bei der STRATO AG, Pascalstraße 10,
        10587 Berlin.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Links zu Instagram</h2>
      <p className="mt-3 leading-relaxed text-muted text-pretty">
        Auf dieser Seite steht ein gewöhnlicher Link zu unserem Instagram-Profil.
        Es sind keine Instagram-Inhalte eingebettet und es wird nichts
        nachgeladen – erst wenn Sie den Link anklicken, verlassen Sie diese
        Seite. Für die Datenverarbeitung bei Instagram ist dann die Meta
        Platforms Ireland Ltd. verantwortlich.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Ihre Rechte</h2>
      <p className="mt-3 leading-relaxed text-muted text-pretty">
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
        Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.
        Wenden Sie sich dafür an die oben genannte E-Mail-Adresse. Außerdem
        können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren.
      </p>
    </div>
  );
}
