/**
 * Étape 18 : distinction contenu de démonstration / contenu vérifié.
 *
 * "verified" ne doit jamais être atteignable pour une fiche manifestement
 * incomplète. Deux niveaux de garde-fous, volontairement pas redondants :
 *
 * - les champs de provenance SUR LA MÊME LIGNE (creator_name, source_type,
 *   rights_confirmed) sont vérifiables par une simple contrainte SQL CHECK
 *   (voir la migration) — donc garantis même en cas de bug applicatif ;
 * - la complétude RELATIONNELLE (au moins une image, un matériau, un tag)
 *   nécessite des requêtes sur d'autres tables, qu'un CHECK Postgres ne
 *   peut pas exprimer proprement pour du relationnel un-vers-plusieurs.
 *   Cette partie reste donc purement applicative : `getVerificationChecklist`
 *   ci-dessous est LA fonction unique utilisée à la fois pour bloquer le
 *   passage en verified (actions/constructions.ts) et pour l'affichage de
 *   la checklist admin (page d'édition) — impossible que les deux divergent.
 */

export const CONTENT_STATUSES = ["demo", "verified"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export function isVerified(contentStatus: ContentStatus): boolean {
  return contentStatus === "verified";
}

export const SOURCE_TYPES = ["interne", "autorisation_createur", "licence_compatible"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const sourceTypeLabels: Record<SourceType, string> = {
  interne: "Créée par nous",
  autorisation_createur: "Fournie par un créateur avec autorisation",
  licence_compatible: "Contenu sous licence compatible",
};

export type VerificationChecklistInput = {
  description: string;
  category_id: string | null;
  width: number | null;
  length: number | null;
  height: number | null;
  creator_name: string | null;
  source_type: SourceType | null;
  rights_confirmed: boolean;
  imageCount: number;
  materialCount: number;
  tagCount: number;
  fileCount: number;
};

export type VerificationChecklistItem = {
  key: string;
  label: string;
  done: boolean;
  /** Bloque le passage en "verified" si non satisfait. Les critères non
   * requis (ex : fichier téléchargeable, "si applicable") restent purement
   * informatifs dans la checklist. */
  required: boolean;
};

const MIN_DESCRIPTION_LENGTH = 30;

export function getVerificationChecklist(input: VerificationChecklistInput): VerificationChecklistItem[] {
  return [
    {
      key: "description",
      label: `Description utile (${MIN_DESCRIPTION_LENGTH} caractères minimum)`,
      done: input.description.trim().length >= MIN_DESCRIPTION_LENGTH,
      required: true,
    },
    { key: "category", label: "Catégorie renseignée", done: input.category_id !== null, required: true },
    {
      key: "dimensions",
      label: "Dimensions renseignées (largeur, longueur, hauteur)",
      done: input.width !== null && input.length !== null && input.height !== null,
      required: true,
    },
    { key: "materials", label: "Au moins un matériau", done: input.materialCount > 0, required: true },
    { key: "image", label: "Au moins une image", done: input.imageCount > 0, required: true },
    { key: "tags", label: "Au moins un tag", done: input.tagCount > 0, required: true },
    {
      key: "provenance",
      label: "Créateur et provenance renseignés",
      done: Boolean(input.creator_name?.trim()) && input.source_type !== null,
      required: true,
    },
    {
      key: "rights",
      label: "Droit de publier ce contenu confirmé",
      done: input.rights_confirmed,
      required: true,
    },
    {
      key: "file",
      label: "Fichier téléchargeable (.litematic/.schem/.schematic), si applicable",
      done: input.fileCount > 0,
      required: false,
    },
  ];
}

export function isChecklistComplete(checklist: VerificationChecklistItem[]): boolean {
  return checklist.filter((item) => item.required).every((item) => item.done);
}
