import Image from "next/image";
import Link from "next/link";
import { legalNav, logos, site } from "@/content/site";

/**
 * GitHub-Logo als Inline-SVG.
 *
 * Offizielle Marke von GitHub, hier als reiner Verweis auf das Repository
 * verwendet – das deckt GitHubs Logo-Richtlinie ab. Inline statt als Datei,
 * damit es unter der strikten CSP ohne Ausnahme auskommt.
 */
function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/**
 * Fußbereich mit den Pflichtlinks.
 *
 * Bewusst als eigene Komponente und nicht inline im Root-Layout: das Layout
 * rendert `<html>` und `<body>` und lässt sich dadurch nur umständlich
 * testen, dieser Teil dagegen direkt.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <span className="flex items-center gap-2 font-semibold">
          <Image
            src={logos.woelfe.src}
            alt=""
            width={logos.woelfe.width}
            height={logos.woelfe.height}
            sizes="2rem"
            className="h-7 w-auto"
          />
          {site.name}
        </span>

        <div className="flex items-center gap-1">
          <nav aria-label="Rechtliches">
            <ul className="flex gap-2">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center px-3 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href={site.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 min-w-11 items-center justify-center transition-colors hover:text-foreground"
            title="Quelltext dieser Seite auf GitHub"
          >
            <GitHubIcon />
            <span className="sr-only">
              Quelltext dieser Seite auf GitHub (öffnet in neuem Tab)
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
