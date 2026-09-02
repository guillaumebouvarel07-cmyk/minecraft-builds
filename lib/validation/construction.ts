import { z } from "zod";

import { SOURCE_TYPES } from "@/lib/content-status";
import { slugPattern } from "@/lib/slug";

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional(),
  );

const optionalPositiveInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().int().positive().optional(),
);

const checkboxBoolean = z.preprocess((v) => v === "on" || v === true || v === "true", z.boolean());

export const constructionSchema = z
  .object({
    name: z.string().trim().min(1, "Le nom est requis.").max(200, "200 caractères maximum."),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Le slug est requis.")
      .max(200, "200 caractères maximum.")
      .regex(slugPattern, "Format invalide : lettres minuscules, chiffres et tirets uniquement."),
    description: z.string().trim().min(1, "La description est requise."),
    category_id: z.preprocess(
      (v) => (v === "" || v == null ? null : v),
      z.string().uuid("Catégorie invalide.").nullable(),
    ),
    style: optionalText(100),
    difficulty: z.enum(["facile", "moyen", "difficile", "expert"], {
      message: "Difficulté invalide.",
    }),
    edition: z.enum(["java", "bedrock", "both"], { message: "Édition invalide." }),
    min_version: z.string().trim().min(1, "La version minimale est requise.").max(20),
    max_version: optionalText(20),
    width: optionalPositiveInt,
    length: optionalPositiveInt,
    height: optionalPositiveInt,
    status: z.enum(["brouillon", "publie"], { message: "Statut invalide." }),
    content_status: z.enum(["demo", "verified"], { message: "Statut de contenu invalide." }),
    creator_name: optionalText(200),
    source_type: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.enum(SOURCE_TYPES).optional(),
    ),
    source_url: optionalText(500),
    license: optionalText(200),
    permission_note: optionalText(2000),
    rights_confirmed: checkboxBoolean,
  })
  // Garde-fou applicatif miroir de la contrainte SQL verified_requires_provenance
  // (voir la migration) : même vérification, exprimée deux fois pour donner
  // une erreur de formulaire claire plutôt qu'un rejet SQL brut. La
  // complétude relationnelle (images/matériaux/tags) n'est pas exprimable
  // ici — voir lib/content-status.ts, vérifiée dans actions/constructions.ts.
  .refine(
    (data) =>
      data.content_status !== "verified" ||
      (Boolean(data.creator_name) && data.source_type != null && data.rights_confirmed),
    {
      message:
        "Une fiche vérifiée nécessite un créateur, une provenance et la confirmation du droit de publier.",
      path: ["content_status"],
    },
  );

export type ConstructionInput = z.infer<typeof constructionSchema>;

export type ConstructionFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof ConstructionInput, string[]>>;
};

export const initialConstructionFormState: ConstructionFormState = { status: "idle" };
