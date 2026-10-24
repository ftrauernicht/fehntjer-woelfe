import Image from "next/image";
import Link from "next/link";
import { galleryImagePath, galleryTeaser } from "@/content/gallery";
import { home, logos, site, venue } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: site.titleDefault,
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

export default function Home() {
  return (
    <>
      {/*
        Rotes Hero über die volle Breite. Das Vereinsrot ist das stärkste
        Wiedererkennungsmerkmal – es trägt die Seite, statt nur als Akzent
        aufzutauchen.
      */}
      <section className="bg-brand-red text-white">
        <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">
          {/*
            Das Wappen hat einen weißen Hintergrund und steht deshalb auf
            einer weißen Karte – wie ein aufgeklebter Aufnäher.
          */}
          <div className="inline-flex rounded-3xl bg-white p-3 shadow-lg">
            <Image
              src={logos.woelfe.src}
              alt={logos.woelfe.alt}
              width={logos.woelfe.width}
              height={logos.woelfe.height}
              priority
              sizes="(min-width: 640px) 13rem, 10rem"
              className="h-40 w-auto sm:h-52"
            />
          </div>

          <p className="mt-8 text-sm font-bold uppercase tracking-widest text-white/80">
            {home.eyebrow}
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            {home.title}
          </h1>

          <p className="mt-3 text-xl font-medium text-white/90 text-pretty">
            {home.lead}
          </p>

          <p className="mt-6 max-w-prose text-lg leading-relaxed text-white/90 text-pretty">
            {home.text}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={site.instagram}
              // noopener schützt vor window.opener-Zugriff, noreferrer
              // verhindert zusätzlich das Weiterreichen der Herkunfts-URL.
              rel="me noopener noreferrer"
              target="_blank"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 font-bold text-brand-red transition-colors hover:bg-white/90"
            >
              {home.instagramCta}
              <span className="sr-only"> (öffnet Instagram in neuem Tab)</span>
            </a>

            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white/70 px-6 py-3 font-bold text-white transition-colors hover:bg-white/10"
            >
              {home.mailCta}
            </a>
          </div>

          <p className="mt-5 text-sm text-white/80">
            {home.mailHint}{" "}
            <a
              href={`mailto:${site.email}`}
              className="font-semibold text-white underline underline-offset-4"
            >
              {site.email}
            </a>
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-5 py-16">
        <section>
          <h2 className="text-2xl font-bold tracking-tight">
            {home.about.title}
          </h2>
          {home.about.paragraphs.map((absatz) => (
            <p
              key={absatz.slice(0, 32)}
              className="mt-4 max-w-prose leading-relaxed text-muted text-pretty"
            >
              {absatz}
            </p>
          ))}
        </section>

        {/* Zugehörigkeit zum Verein, mit dem Vereinswappen */}
        <section className="mt-10 flex items-center gap-5 rounded-2xl border-l-4 border-brand-red bg-surface p-5">
          <Image
            src={logos.verein.src}
            alt={logos.verein.alt}
            width={logos.verein.width}
            height={logos.verein.height}
            sizes="5rem"
            className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
          />
          <p className="leading-relaxed text-pretty">
            <span className="font-bold">{home.club.title}</span>
            <br />
            <span className="text-muted">{home.club.text}</span>
          </p>
        </section>

        {/* Anfahrt - echter Ortsbezug, hilft auch bei der lokalen Suche */}
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-2xl font-bold tracking-tight">
            {home.anfahrt.title}
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-muted text-pretty">
            {home.anfahrt.text}
          </p>

          <address className="mt-5 not-italic leading-relaxed">
            <span className="font-semibold">{venue.name}</span>
            <br />
            {venue.street}
            <br />
            {venue.postalCode} {venue.city}
          </address>

          <a
            href={venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-red underline underline-offset-4 hover:text-brand-red-dark"
          >
            {home.anfahrt.mapLabel}
            <span className="sr-only"> (öffnet eine Karte in neuem Tab)</span>
          </a>

          <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted text-pretty">
            {home.anfahrt.hint}
          </p>
        </section>

        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-2xl font-bold tracking-tight">Unsere Wölfe</h2>
          <p className="mt-2 max-w-prose text-muted text-pretty">
            Bis die richtige Seite steht, gibt es schon mal ein paar Bilder
            unserer beiden Maskottchen.
          </p>

          <Link
            href="/bilder"
            className="group mt-6 block overflow-hidden rounded-2xl border border-border transition-colors hover:border-brand-red"
          >
            <Image
              src={galleryImagePath(galleryTeaser.slug)}
              alt={galleryTeaser.alt}
              width={1280}
              height={714}
              sizes="(min-width: 768px) 48rem, 100vw"
              className="w-full transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span className="flex min-h-12 items-center justify-between bg-brand-red px-5 py-4 font-bold text-white">
              Alle Bilder ansehen
              <span aria-hidden>→</span>
            </span>
          </Link>
        </section>
      </div>
    </>
  );
}
