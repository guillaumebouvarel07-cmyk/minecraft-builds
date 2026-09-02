import type { MetadataRoute } from "next";

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
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/recherche?"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
