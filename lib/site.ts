/**
 * Configuration globale du site.
 *
 * Tout ce qui identifie le site est centralisé ici : nom, slogan, URL.
 * Changer le nom du projet = modifier ce seul fichier.
 *
 * ATTENTION (juridique) : d'après les Minecraft Usage Guidelines de Mojang,
 * le mot « Minecraft » ne doit pas être l'élément dominant du nom du site.
 * « Blokprint » est un nom provisoire qui respecte cette contrainte.
 */
export const site = {
  name: "Blokprint",
  tagline: "Trouvez la construction parfaite. Bloc par bloc.",
  description:
    "Recherchez et découvrez des constructions à bâtir : maisons, châteaux, fermes, tours et décorations, filtrables par style, dimensions, difficulté et matériaux.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "fr_FR",
} as const;

/**
 * Mention obligatoire de non-affiliation, affichée dans le pied de page
 * et sur la page mentions légales.
 */
export const legalDisclaimer =
  "Ce site n'est pas un produit officiel Minecraft. Il n'est ni approuvé par, ni associé à Mojang ou Microsoft.";
