import Image from "next/image";
import Link from "next/link";
import { logos } from "@/content/site";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-24 text-center">
      <Image
        src={logos.woelfe.src}
        alt=""
        width={logos.woelfe.width}
        height={logos.woelfe.height}
        sizes="8rem"
        className="mx-auto h-28 w-auto"
      />
      <h1 className="mt-8 text-3xl font-bold tracking-tight">
        Diese Seite gibt es nicht.
      </h1>
      <p className="mt-4 text-muted text-pretty">
        Vielleicht ist der Link alt, vielleicht haben wir die Seite noch gar
        nicht gebaut. Beides gut möglich.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-xl bg-brand-red px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-red-dark"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
