import { z } from "zod";

import { slugPattern } from "@/lib/slug";

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional(),
  );

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(100, "100 caractères maximum."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Le slug est requis.")
    .max(100, "100 caractères maximum.")
    .regex(slugPattern, "Format invalide : lettres minuscules, chiffres et tirets uniquement."),
  description: optionalText(500),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export type CategoryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof CategoryInput, string[]>>;
};

export const initialCategoryFormState: CategoryFormState = { status: "idle" };
