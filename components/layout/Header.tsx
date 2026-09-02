import Link from "next/link";

import { MobileNav } from "@/components/layout/MobileNav";
import { navLinks, site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-base">
            <svg
              viewBox="0 0 24 24"
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 3 7v10l9 5 9-5V7z" />
              <path d="m3 7 9 5 9-5" />
              <path d="M12 12v10" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight">{site.name}</span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#recherche"
            aria-label="Aller à la recherche"
            className="ml-1 grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:text-fg"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
        </nav>

        <MobileNav links={[...navLinks, { href: "#recherche", label: "Recherche" }]} />
      </div>
    </header>
  );
}
