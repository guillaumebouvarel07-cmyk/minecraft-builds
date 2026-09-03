import type { MetadataRoute } from "next";

import { isProductionDeployment } from "@/lib/deployment";
import { absoluteUrl } from "@/lib/seo";

/**
 * /admin est bloqué ici pour l'hygiène de crawl (rien à y indexer, et tout
 * est déjà protégé par l'authentification — robots.txt n'est jamais la
 * sécurité elle-même, seulement une réduction de bruit pour les crawlers).
 *
 * /recherche n'est PAS bloqué en entier : seules les URLs avec query string
 * ("/recherche?...") le sont. La page nue reste crawlable pour que Google
 * puisse lire son <meta name="robots" content="noindex, follow"> et suivre
 * les liens qu'elle contient vers de vraies pages indexables — un Disallow
 * total sur /recherche empêcherait justement de découvrir ce noindex et de
 * suivre ces liens, ce qui irait à l'encontre du but recherché.
 *
 * Migration Netlify : un Deploy Preview / Branch deploy sert exactement le
 * même code que la production, y compris les pages dont le <meta robots>
 * dit "index" (ex. une fiche construction verified) — ce <meta> ne suffit
 * donc pas à empêcher l'indexation d'une URL de preview qui serait
 * découverte/liée par accident. Un Disallow total ici est un signal
 * indépendant du HTML de chaque page, qui s'applique uniformément sans
 * toucher à la logique per-page existante (inchangée en production).
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/recherche?"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
