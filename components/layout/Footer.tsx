import Link from "next/link";

import { legalDisclaimer, legalLinks, navLinks, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-semibold tracking-tight">{site.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{site.tagline}</p>
          </div>

          <nav aria-label="Liens du pied de page" className="flex flex-col gap-2 sm:items-end">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted transition-colors hover:text-fg">
                {link.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Liens légaux" className="flex flex-col gap-2 sm:items-end">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted transition-colors hover:text-fg">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Mention imposée par les Minecraft Usage Guidelines — ne pas retirer. */}
          <p className="max-w-xl text-xs leading-relaxed text-muted">{legalDisclaimer}</p>
          <Link
            href="/cookies"
            className="shrink-0 text-xs text-muted underline underline-offset-2 transition-colors hover:text-fg"
          >
            Gérer les cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
