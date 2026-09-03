"use client";

import { useSyncExternalStore } from "react";

import { CookieConsentControls } from "@/components/analytics/CookieConsentControls";
import { useConsent } from "@/lib/cookie-consent";

const noopSubscribe = () => () => {};

/**
 * true uniquement après le montage côté client. Nécessaire séparément de
 * useConsent() : sans ça, une page pré-rendue (ISR) enverrait le bandeau
 * dans le HTML statique pour TOUT visiteur (le serveur ne peut pas savoir
 * qu'un choix est déjà mémorisé), causant un flash visible du bandeau à
 * chaque chargement même pour quelqu'un ayant déjà répondu.
 */
function useHasMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Bandeau affiché uniquement tant qu'aucun choix valide n'est mémorisé
 * (voir lib/cookie-consent.ts pour l'expiration à ~6 mois). Monté depuis
 * app/(site)/layout.tsx uniquement — jamais dans /admin, qui a son propre
 * root layout séparé.
 */
export function CookieConsentBanner() {
  const hasMounted = useHasMounted();
  const consent = useConsent();

  if (!hasMounted || consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Blokprint utilise Google Analytics pour mesurer l&apos;audience du site, uniquement si
          vous l&apos;acceptez.{" "}
          <a href="/cookies" className="underline hover:text-fg">
            En savoir plus
          </a>
          .
        </p>
        <CookieConsentControls />
      </div>
    </div>
  );
}
