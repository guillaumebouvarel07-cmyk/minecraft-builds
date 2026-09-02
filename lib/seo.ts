import { site } from "@/lib/site";

/**
 * URL du site sans slash final. NEXT_PUBLIC_SITE_URL peut être renseignée
 * avec ou sans slash final selon comment l'utilisateur l'a saisie — cette
 * fonction normalise pour que la concaténation manuelle (sitemap.ts,
 * robots.ts, JSON-LD) ne produise jamais de double slash.
 *
 * Pour les metadata Next.js (`alternates.canonical`, images OG relatives),
 * pas besoin de cette fonction : `metadataBase` + un chemin relatif sont
 * résolus correctement par Next quel que soit le slash final.
 */
export function getSiteUrl(): string {
  return site.url.replace(/\/+$/, "");
}

/** Construit une URL absolue à partir d'un chemin commençant par "/". */
export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path}`;
}

/**
 * Troncature "propre" pour une meta description : coupe au dernier espace
 * avant la limite plutôt qu'en plein milieu d'un mot.
 */
export function truncateDescription(text: string, maxLength = 155): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Props à spreader sur un <script type="application/ld+json">. Échappe les
 * "<" pour éviter qu'une valeur contenant "</script>" ne casse la page
 * (recommandation officielle Next.js pour le JSON-LD).
 */
export function jsonLdScriptProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  } as const;
}
