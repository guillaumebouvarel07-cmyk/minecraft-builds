import { z } from "zod";

import { MATERIAL_CATEGORIES } from "@/lib/types";

export const quantitySchema = z.coerce
  .number({ message: "La quantité doit être un nombre." })
  .int("La quantité doit être un entier.")
  .positive("La quantité doit être supérieure à 0.");

export const attachMaterialSchema = z.object({
  material_id: z.string().uuid("Sélectionne un matériau dans la liste."),
  quantity: quantitySchema,
});

export const newMaterialSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(100, "100 caractères maximum."),
  minecraft_id: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(100).optional(),
  ),
  category: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.enum(MATERIAL_CATEGORIES).optional(),
  ),
  quantity: quantitySchema,
});

export const quantityOnlySchema = z.object({ quantity: quantitySchema });

export type MaterialActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialMaterialActionState: MaterialActionState = { status: "idle" };

/** ex: "Oak Planks" -> "minecraft:oak_planks", "minecraft:oak_planks" -> inchangé */
export function normalizeMinecraftId(raw: string): string {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (!cleaned) return cleaned;
  return cleaned.includes(":") ? cleaned : `minecraft:${cleaned}`;
}

/** Échappe les caractères spéciaux de ILIKE pour une comparaison "exacte" insensible à la casse. */
export function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, (match) => `\\${match}`);
}
