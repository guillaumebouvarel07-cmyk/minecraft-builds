"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  attachMaterialSchema,
  escapeLike,
  newMaterialSchema,
  normalizeMinecraftId,
  quantityOnlySchema,
  type MaterialActionState,
} from "@/lib/validation/material";

type AdminClient = ReturnType<typeof createAdminClient>;

async function attachExistingMaterial(
  supabase: AdminClient,
  constructionId: string,
  materialId: string,
  quantity: number,
): Promise<MaterialActionState> {
  const { data: existingLink } = await supabase
    .from("construction_materials")
    .select("material_id")
    .eq("construction_id", constructionId)
    .eq("material_id", materialId)
    .maybeSingle();

  if (existingLink) {
    return {
      status: "error",
      message: "Ce matériau est déjà associé à cette construction — modifie plutôt sa quantité.",
    };
  }

  const { error } = await supabase.from("construction_materials").insert({
    construction_id: constructionId,
    material_id: materialId,
    quantity,
  });

  if (error) {
    // Filet de sécurité si deux requêtes concurrentes passaient le check ci-dessus :
    // la contrainte PRIMARY KEY (construction_id, material_id) l'empêche en base.
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Ce matériau est déjà associé à cette construction.",
      };
    }
    return { status: "error", message: `Erreur : ${error.message}` };
  }

  return { status: "success", message: "Matériau ajouté." };
}

export async function attachMaterial(
  constructionId: string,
  _prevState: MaterialActionState,
  formData: FormData,
): Promise<MaterialActionState> {
  await requireAdminUser();

  const parsed = attachMaterialSchema.safeParse({
    material_id: formData.get("material_id"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrige les champs invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();
  const result = await attachExistingMaterial(
    supabase,
    constructionId,
    parsed.data.material_id,
    parsed.data.quantity,
  );

  revalidatePath(`/admin/constructions/${constructionId}`);
  return result;
}

export async function createMaterialAndAttach(
  constructionId: string,
  _prevState: MaterialActionState,
  formData: FormData,
): Promise<MaterialActionState> {
  await requireAdminUser();

  const parsed = newMaterialSchema.safeParse({
    name: formData.get("name"),
    minecraft_id: formData.get("minecraft_id"),
    category: formData.get("category"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrige les champs invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, quantity, category } = parsed.data;
  const minecraftId = parsed.data.minecraft_id ? normalizeMinecraftId(parsed.data.minecraft_id) : null;
  const supabase = createAdminClient();

  // Évite de créer un doublon : réutilise un matériau existant si son
  // minecraft_id (identité la plus fiable) ou son nom correspond déjà.
  let materialId: string | null = null;

  if (minecraftId) {
    const { data } = await supabase
      .from("materials")
      .select("id")
      .eq("minecraft_id", minecraftId)
      .maybeSingle();
    materialId = data?.id ?? null;
  }

  if (!materialId) {
    const { data } = await supabase
      .from("materials")
      .select("id")
      .ilike("name", escapeLike(name))
      .maybeSingle();
    materialId = data?.id ?? null;
  }

  if (!materialId) {
    const { data: created, error: createError } = await supabase
      .from("materials")
      .insert({ name, minecraft_id: minecraftId, category: category ?? "other" })
      .select("id")
      .single();

    if (createError || !created) {
      // Filet de sécurité : contrainte UNIQUE(minecraft_id) si une requête
      // concurrente a créé le même matériau entre le check et l'insert.
      if (createError?.code === "23505") {
        const { data: raceWinner } = await supabase
          .from("materials")
          .select("id")
          .eq("minecraft_id", minecraftId)
          .maybeSingle();
        if (raceWinner) {
          materialId = raceWinner.id;
        } else {
          return { status: "error", message: "Ce minecraft_id est déjà utilisé." };
        }
      } else {
        return {
          status: "error",
          message: `Erreur lors de la création du matériau : ${createError?.message ?? "inconnue"}`,
        };
      }
    } else {
      materialId = created.id;
    }
  }

  if (!materialId) {
    return { status: "error", message: "Impossible de déterminer le matériau à associer." };
  }

  const result = await attachExistingMaterial(supabase, constructionId, materialId, quantity);
  revalidatePath(`/admin/constructions/${constructionId}`);
  return result;
}

export async function updateMaterialQuantity(
  constructionId: string,
  materialId: string,
  _prevState: MaterialActionState,
  formData: FormData,
): Promise<MaterialActionState> {
  await requireAdminUser();

  const parsed = quantityOnlySchema.safeParse({ quantity: formData.get("quantity") });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.flatten().fieldErrors.quantity?.[0] ?? "Quantité invalide.",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("construction_materials")
    .update({ quantity: parsed.data.quantity })
    .eq("construction_id", constructionId)
    .eq("material_id", materialId);

  revalidatePath(`/admin/constructions/${constructionId}`);

  if (error) {
    return { status: "error", message: `Erreur : ${error.message}` };
  }

  return { status: "success", message: "Quantité mise à jour." };
}

export async function removeMaterialFromConstruction(constructionId: string, materialId: string) {
  await requireAdminUser();

  const supabase = createAdminClient();
  // Ne supprime que l'association : la table materials (catalogue global)
  // n'est jamais touchée par cette action.
  await supabase
    .from("construction_materials")
    .delete()
    .eq("construction_id", constructionId)
    .eq("material_id", materialId);

  revalidatePath(`/admin/constructions/${constructionId}`);
}

/**
 * Supprime un matériau du catalogue GLOBAL (table materials), pas d'une
 * simple construction. Refusé s'il est encore utilisé par au moins une
 * construction, pour ne jamais casser une association existante — il faut
 * d'abord le retirer de chaque construction via removeMaterialFromConstruction.
 */
export async function deleteMaterialFromCatalog(materialId: string): Promise<MaterialActionState> {
  await requireAdminUser();

  const supabase = createAdminClient();

  const { count, error: countError } = await supabase
    .from("construction_materials")
    .select("*", { count: "exact", head: true })
    .eq("material_id", materialId);

  if (countError) {
    return { status: "error", message: `Erreur : ${countError.message}` };
  }

  if (count && count > 0) {
    return {
      status: "error",
      message: `Utilisé par ${count} construction${count > 1 ? "s" : ""} : retire-le d'abord de ${count > 1 ? "chacune" : "celle-ci"} avant de le supprimer du catalogue.`,
    };
  }

  const { error } = await supabase.from("materials").delete().eq("id", materialId);

  if (error) {
    return { status: "error", message: `Erreur lors de la suppression : ${error.message}` };
  }

  return { status: "success", message: "Matériau supprimé du catalogue." };
}
