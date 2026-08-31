import { z } from "zod";

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

export const constructionSchema = z.object({
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
});

export type ConstructionInput = z.infer<typeof constructionSchema>;

export type ConstructionFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof ConstructionInput, string[]>>;
};

export const initialConstructionFormState: ConstructionFormState = { status: "idle" };
