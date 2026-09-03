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

/**
 * Navigation principale. Pointe pour l'instant vers des ancres de la page
 * d'accueil (Constructions/Catégories) : les pages dédiées (/constructions,
 * /categorie/[slug]) arrivent aux étapes suivantes. Éviter des liens morts
 * en attendant plutôt que de faire pointer vers des routes qui n'existent
 * pas encore.
 */
export const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/#constructions", label: "Constructions" },
  { href: "/#categories", label: "Catégories" },
] as const;

/** Liens légaux affichés en pied de page (Étape 21). */
export const legalLinks = [
  { href: "/a-propos", label: "À propos" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
] as const;
