"use client";

import { type ConsentValue, setConsent, useConsent } from "@/lib/cookie-consent";

/**
 * Boutons Accepter/Refuser + statut actuel du choix. Un seul composant
 * partagé entre le bandeau de première visite et la page /cookies (lien
 * "Gérer les cookies") — jamais deux implémentations qui pourraient
 * diverger dans leur comportement de consentement.
 */
export function CookieConsentControls({
  onChoice,
}: {
  onChoice?: (value: ConsentValue) => void;
}) {
  const current = useConsent();

  function choose(value: ConsentValue) {
    setConsent(value);
    onChoice?.(value);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => choose("refused")}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-base transition-colors hover:bg-accent-strong"
        >
          Accepter
        </button>
      </div>
      {current && (
        <p className="text-xs text-muted">
          Choix actuel : mesure d&apos;audience{" "}
          {current === "accepted" ? "acceptée" : "refusée"}.
        </p>
      )}
    </div>
  );
}
