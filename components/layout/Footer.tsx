import { legalDisclaimer, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 sm:px-6">
        <p className="text-sm font-medium">{site.name}</p>
        {/* Mention imposée par les Minecraft Usage Guidelines — ne pas retirer. */}
        <p className="max-w-xl text-xs leading-relaxed text-muted">
          {legalDisclaimer}
        </p>
      </div>
    </footer>
  );
}
