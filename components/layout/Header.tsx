import Link from "next/link";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-base"
          >
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
          <span className="text-lg font-semibold tracking-tight">
            {site.name}
          </span>
        </Link>

        <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
          Étape 0
        </span>
      </div>
    </header>
  );
}
