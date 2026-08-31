import { z } from "zod";

import { slugPattern } from "@/lib/slug";

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(50, "50 caractères maximum."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Le slug est requis.")
    .max(50, "50 caractères maximum.")
    .regex(slugPattern, "Format invalide : lettres minuscules, chiffres et tirets uniquement."),
});

export type TagInput = z.infer<typeof tagSchema>;

export type TagFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof TagInput, string[]>>;
};

export const initialTagFormState: TagFormState = { status: "idle" };

export const attachTagSchema = z.object({
  tag_id: z.string().uuid("Sélectionne un tag dans la liste."),
});
