/**
 * Stockage du choix de consentement à la mesure d'audience (GA4) — Étape 21.
 *
 * localStorage plutôt qu'un cookie : le choix n'a besoin d'être lu que
 * côté client (le chargement de GA4 est lui-même entièrement client-side
 * via ConsentGate) — pas besoin qu'il soit lisible côté serveur. Pas de
 * CMP externe : un seul choix binaire (GA4 oui/non, aucun autre traceur
 * non essentiel sur ce site), une solution maison suffit.
 *
 * Durée de mémorisation : ~6 mois, conformément à la recommandation de la
 * CNIL ("une durée de six mois, tant pour le consentement que le refus,
 * est en général appropriée" —
 * cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/comment-mettre-mon-site-web-en-conformite).
 * Passé ce délai, le choix est considéré comme expiré et le bandeau
 * réapparaît.
 */

import { useSyncExternalStore } from "react";

export const CONSENT_STORAGE_KEY = "blokprint_cookie_consent";
export const CONSENT_CHANGE_EVENT = "blokprint:consent-change";
const CONSENT_MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000; // ~6 mois

export type ConsentValue = "accepted" | "refused";

type StoredConsent = { value: ConsentValue; ts: number };

function isConsentValue(value: unknown): value is ConsentValue {
  return value === "accepted" || value === "refused";
}

/** Choix actuellement mémorisé et encore valide, ou null si absent/expiré/corrompu. */
export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (!isConsentValue(parsed.value) || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > CONSENT_MAX_AGE_MS) return null;

    return parsed.value;
  } catch {
    return null;
  }
}

/**
 * Enregistre le choix et prévient les composants déjà montés (bandeau,
 * ConsentGate, page /cookies) via un événement custom — un `storage` event
 * natif ne se déclenche pas dans l'onglet qui a lui-même écrit la valeur.
 */
export function setConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;

  const stored: StoredConsent = { value, ts: Date.now() };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));

  if (value === "refused") {
    clearGoogleAnalyticsCookies();
  }

  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_CHANGE_EVENT, { detail: value }));
}

function subscribeToConsentChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Lit le choix de consentement et se met à jour automatiquement quand il
 * change (autre onglet via l'event `storage`, ou `setConsent()` dans cet
 * onglet via CONSENT_CHANGE_EVENT). Snapshot serveur = null (inconnu avant
 * hydration) : ConsentGate traite ça comme "pas accepté" (défaut sûr côté
 * GA4) ; CookieConsentBanner gère séparément le cas "pas encore monté" pour
 * ne pas afficher le bandeau en HTML statique à un visiteur qui a déjà
 * répondu.
 */
export function useConsent(): ConsentValue | null {
  return useSyncExternalStore(subscribeToConsentChanges, getStoredConsent, () => null);
}

/**
 * Best-effort : supprime les cookies GA4 first-party (_ga, _ga_<id>) posés
 * sur ce domaine par le navigateur courant.
 *
 * Limite documentée en page /cookies : ceci ne peut pas effacer les
 * données déjà transmises aux serveurs de Google, ni un cookie que GA
 * aurait posé sur un autre domaine/sous-domaine.
 */
export function clearGoogleAnalyticsCookies(): void {
  if (typeof document === "undefined") return;

  const gaCookiePattern = /^_ga/;

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name && gaCookiePattern.test(name)) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}
