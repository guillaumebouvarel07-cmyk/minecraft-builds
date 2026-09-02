import Link from "next/link";

import { legalDisclaimer, navLinks, site } from "@/lib/site";

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
        </div>

        <div className="mt-8 border-t border-line pt-6">
          {/* Mention imposée par les Minecraft Usage Guidelines — ne pas retirer. */}
          <p className="max-w-xl text-xs leading-relaxed text-muted">{legalDisclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
