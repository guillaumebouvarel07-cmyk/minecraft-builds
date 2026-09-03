"use client";

import { GoogleAnalytics } from "@next/third-parties/google";

import { useConsent } from "@/lib/cookie-consent";

/**
 * Ne monte <GoogleAnalytics> qu'après consentement explicite ET en
 * environnement de production (voir `enabled`, calculé dans
 * app/(site)/layout.tsx). useConsent() se met à jour en direct sur un clic
 * Accepter/Refuser (voir lib/cookie-consent.ts) : accepter charge GA4 tout
 * de suite, refuser (y compris après avoir accepté) le retire du DOM
 * immédiatement, sans recharger la page.
 */
export function ConsentGate({ gaId, enabled }: { gaId: string | undefined; enabled: boolean }) {
  const consent = useConsent();

  if (!enabled || !gaId || consent !== "accepted") return null;

  return <GoogleAnalytics gaId={gaId} />;
}
