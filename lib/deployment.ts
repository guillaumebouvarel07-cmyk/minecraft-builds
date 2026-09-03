/**
 * Détection d'environnement de déploiement — indépendante de la plateforme.
 *
 * Netlify fournit `CONTEXT` ("production" | "deploy-preview" | "branch-deploy"
 * | "dev"), l'équivalent de l'ancien `VERCEL_ENV` de Vercel. En dehors de
 * Netlify (dev local sans `netlify dev`), on retombe sur `NODE_ENV` — comme
 * avant la migration.
 *
 * Ne détermine PAS l'URL du site : `NEXT_PUBLIC_SITE_URL` (lib/site.ts)
 * reste la seule source canonique, volontairement indépendante de la
 * plateforme d'hébergement (voir étape 22bis).
 */
export function isProductionDeployment(): boolean {
  if (process.env.CONTEXT) {
    return process.env.CONTEXT === "production";
  }
  return process.env.NODE_ENV === "production";
}
