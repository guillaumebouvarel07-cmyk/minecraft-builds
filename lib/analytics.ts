import { sendGAEvent } from "@next/third-parties/google";

import { getStoredConsent } from "@/lib/cookie-consent";

/**
 * Point d'entrée unique pour tout événement GA4 envoyé par le site public.
 * Aucun composant n'appelle `sendGAEvent`/`gtag` directement — ça garde les
 * noms d'événements et leurs paramètres cohérents à un seul endroit, et ça
 * évite de disperser des chaînes magiques dans toute la codebase.
 *
 * Étape 21 : chaque fonction vérifie le consentement mémorisé avant
 * d'appeler `sendGAEvent` — aucun événement n'est envoyé avant acceptation
 * explicite, même si `sendGAEvent` lui-même ne ferait rien de dangereux
 * sans GA chargé (il logue juste un avertissement console et s'arrête).
 *
 * Aucune donnée personnelle n'est envoyée par ce module : uniquement des
 * identifiants de contenu (slug, catégorie, difficulté...) et des termes
 * de recherche saisis volontairement par l'utilisateur dans le champ
 * recherche — jamais d'email, d'IP, ou d'identifiant de session admin.
 */

function hasAnalyticsConsent(): boolean {
  return getStoredConsent() === "accepted";
}

/** Recherche réellement lancée (homepage ou /recherche) avec un terme non vide. */
export function trackSearch(searchTerm: string): void {
  if (!hasAnalyticsConsent()) return;

  const trimmed = searchTerm.trim();
  if (!trimmed) return;

  sendGAEvent("event", "search", { search_term: trimmed });
}

/**
 * Un filtre appliqué dans /recherche. `filterType` est le nom du filtre
 * (difficulty, edition, category, tag, material...), `filterValue` sa
 * valeur (facile, java, minecraft:oak_planks...) — jamais de données
 * utilisateur, uniquement des valeurs de filtre prédéfinies par l'UI.
 */
export function trackFilterUsed(filterType: string, filterValue: string): void {
  if (!hasAnalyticsConsent()) return;

  sendGAEvent("event", "filter_used", { filter_type: filterType, filter_value: filterValue });
}

export type ConstructionViewParams = {
  constructionId: string;
  constructionSlug: string;
  category: string | null;
  difficulty: string;
  edition: string;
};

/**
 * Consultation réelle d'une fiche construction. À appeler uniquement
 * depuis un Client Component monté dans le navigateur (jamais depuis le
 * Server Component de la page, qui ne s'exécute qu'au build/à la
 * revalidation ISR — pas à chaque visite).
 */
export function trackConstructionView(params: ConstructionViewParams): void {
  if (!hasAnalyticsConsent()) return;

  sendGAEvent("event", "construction_view", {
    construction_id: params.constructionId,
    construction_slug: params.constructionSlug,
    ...(params.category ? { category: params.category } : {}),
    difficulty: params.difficulty,
    edition: params.edition,
  });
}

export type FileDownloadParams = {
  constructionId: string;
  constructionSlug: string;
  fileId: string;
  fileType: string;
};

/**
 * À appeler uniquement après confirmation serveur qu'un téléchargement est
 * réellement accordé (voir components/public/DownloadButton.tsx) — jamais
 * de façon optimiste avant de savoir si /api/download a réussi, pour ne
 * jamais compter un téléchargement refusé (brouillon, fileId invalide,
 * erreur serveur) dans GA4.
 */
export function trackFileDownload(params: FileDownloadParams): void {
  if (!hasAnalyticsConsent()) return;

  sendGAEvent("event", "file_download", {
    construction_id: params.constructionId,
    construction_slug: params.constructionSlug,
    file_id: params.fileId,
    file_type: params.fileType,
  });
}
