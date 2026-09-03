/**
 * Informations utilisées par les pages légales (/mentions-legales,
 * /confidentialite, /contact) — Étape 21.
 *
 * `publisher` : identité légale réelle de l'éditeur du site. Ne peut pas
 * être inventée — chaque champ est un placeholder explicite tant que
 * l'information réelle n'a pas été fournie (voir le rapport de l'étape 21
 * pour la liste exacte à transmettre avant lancement).
 *
 * `host` et `dataProcessors` : faits vérifiés par recherche réelle (pas de
 * valeur inventée), sourcés individuellement ci-dessous.
 */

export const LEGAL_PLACEHOLDER = "[à compléter avant lancement]";

export const publisher = {
  /** Raison sociale, ou nom + prénom si personne physique (auto-entrepreneur, etc.). */
  name: LEGAL_PLACEHOLDER,
  /** Ex. "Personne physique (auto-entrepreneur)", "SASU au capital de...". */
  legalForm: LEGAL_PLACEHOLDER,
  address: LEGAL_PLACEHOLDER,
  /** SIRET/SIREN — laisser le placeholder si non applicable. */
  siret: LEGAL_PLACEHOLDER,
  email: LEGAL_PLACEHOLDER,
  /** Souvent la même personne que l'éditeur pour un petit site. */
  publicationDirector: LEGAL_PLACEHOLDER,
} as const;

/** Vérifié le 2026-09-03 sur vercel.com/legal/privacy-policy (section "Contact Us"). */
export const host = {
  name: "Vercel Inc.",
  address: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis",
  privacyUrl: "https://vercel.com/legal/privacy-policy",
} as const;

/**
 * Sous-traitants/destinataires connus des données, dans l'ordre où ils
 * interviennent réellement dans le site (voir /confidentialite pour le
 * détail des traitements). Chaque URL a été vérifiée individuellement.
 */
export const dataProcessors = [
  {
    name: "Vercel Inc.",
    role: "Hébergement du site, des pages et des fonctions serveur.",
    url: host.privacyUrl,
  },
  {
    name: "Supabase",
    role: "Base de données du catalogue (constructions, matériaux), stockage des images/fichiers, authentification du back-office (réservée à l'éditeur — aucun compte public).",
    url: "https://supabase.com/privacy",
  },
  {
    name: "Google Ireland Limited (Google Analytics 4)",
    role: "Mesure d'audience anonymisée, uniquement après consentement explicite (voir /cookies). Responsable pour les utilisateurs de l'UE/EEE/Suisse — Gordon House, 4 Barrow St, Dublin, D04 E5W5, Irlande.",
    url: "https://policies.google.com/privacy",
  },
] as const;
