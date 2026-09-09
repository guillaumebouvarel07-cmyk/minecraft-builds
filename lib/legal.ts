/**
 * Informations utilisées par les pages légales (/mentions-legales,
 * /confidentialite, /contact).
 *
 * RÉGIME APPLICABLE : Blokprint est édité à titre NON PROFESSIONNEL par une
 * personne physique — aucune activité économique (pas de publicité, pas
 * d'affiliation, pas de dons, pas de vente, pas de contenu payant).
 *
 * L'article 1-1 de la LCEN (loi n°2004-575 du 21 juin 2004, dans sa
 * rédaction issue de la loi n°2024-449 du 21 mai 2024 — l'ancien article
 * 6-III est abrogé) permet à un éditeur non professionnel de ne rendre
 * publics que le nom et l'adresse de son hébergeur, dès lors qu'il a
 * communiqué ses éléments d'identification à celui-ci (compte Netlify).
 * C'est pourquoi ni adresse postale, ni téléphone, ni numéro
 * d'immatriculation ne figurent ici : ils ne sont pas requis.
 *
 * Le nom de l'éditeur est néanmoins affiché volontairement : le RGPD
 * impose d'identifier le responsable du traitement dans la politique de
 * confidentialité, et un nom + une adresse de contact y répondent
 * clairement.
 *
 * ⚠️ À METTRE À JOUR le jour où le site génère le moindre revenu
 * (AdSense, affiliation, dons, partenariats...) : l'activité économique,
 * même accessoire, fait basculer le site en régime PROFESSIONNEL, qui
 * impose alors de publier l'identité complète de l'éditeur — nom, prénoms,
 * domicile, téléphone, et numéro d'immatriculation le cas échéant.
 *
 * `host` et `dataProcessors` : faits vérifiés par recherche réelle (pas de
 * valeur inventée), sourcés individuellement ci-dessous.
 */

export const publisher = {
  name: "Guillaume Bouvarel",
  /** Mention affichée pour qualifier le régime (voir le bloc ci-dessus). */
  legalForm:
    "Site édité à titre personnel — éditeur non professionnel au sens de l'article 1-1 de la LCEN",
  email: "blokprint.fr@gmail.com",
  publicationDirector: "Guillaume Bouvarel",
} as const;

/** Vérifié le 2026-09-04 sur netlify.com/privacy (section "Contact Us") — hébergeur depuis la migration Netlify. */
export const host = {
  name: "Netlify, Inc.",
  address: "101 2nd Street, San Francisco, CA 94105, États-Unis",
  privacyUrl: "https://www.netlify.com/privacy/",
} as const;

/**
 * Sous-traitants/destinataires connus des données, dans l'ordre où ils
 * interviennent réellement dans le site (voir /confidentialite pour le
 * détail des traitements). Chaque URL a été vérifiée individuellement.
 */
export const dataProcessors = [
  {
    name: "Netlify, Inc.",
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
