import Image from "next/image";
import Link from "next/link";
import { gallery, galleryImagePath } from "@/content/gallery";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Bilder",
  description: `Maskottchen-Bilder der Fehntjer Wölfe, der F-Jugend des ${site.club} – zum Anschauen und Weitergeben.`,
  path: "/bilder",
});

export default function BilderPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
      >
        ← Zurück zur Startseite
      </Link>

      <h1 className="mt-6 text-4xl font-bold tracking-tight">Unsere Wölfe</h1>

      <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted text-pretty">
        Unsere beiden Maskottchen: der junge Wolf, der immer losrennt, und der
        ältere, der die Übersicht behält.
      </p>

      {/*
        Offenlegung: Die Bilder sind KI-generiert. Das gehört sichtbar auf die
        Seite und nicht ins Kleingedruckte – es sind keine Fotos, und niemand
        soll sie dafür halten.
      */}
      <p className="mt-3 max-w-prose text-sm text-muted">
        Alle Bilder auf dieser Seite sind mit KI erzeugt und zeigen gezeichnete
        Figuren, keine echten Personen.
      </p>

      <ul className="mt-12 grid gap-8 sm:grid-cols-2">
        {gallery.map((image, index) => (
          <li
            key={image.slug}
            className="overflow-hidden rounded-2xl border border-border"
          >
            <Image
              src={galleryImagePath(image.slug)}
              alt={image.alt}
              width={1280}
              height={714}
              // Nur die ersten beiden Bilder sind beim Laden sichtbar; der Rest
              // wird nachgeladen, sobald man scrollt.
              loading={index < 2 ? "eager" : "lazy"}
              sizes="(min-width: 640px) 32rem, 100vw"
              className="w-full"
            />
            <p className="px-5 py-4 font-semibold">{image.caption}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
