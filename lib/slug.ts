export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/** Génère un slug propre (minuscules, tirets) à partir d'un texte libre. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}
