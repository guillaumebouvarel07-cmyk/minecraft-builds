"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { constructionSchema, type ConstructionFormState } from "@/lib/validation/construction";

function parseForm(formData: FormData) {
  return constructionSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    style: formData.get("style"),
    difficulty: formData.get("difficulty"),
    edition: formData.get("edition"),
    min_version: formData.get("min_version"),
    max_version: formData.get("max_version"),
    width: formData.get("width"),
    length: formData.get("length"),
    height: formData.get("height"),
    status: formData.get("status"),
  });
}

export async function createConstruction(
  _prevState: ConstructionFormState,
  formData: FormData,
): Promise<ConstructionFormState> {
  await requireAdminUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrige les champs invalides ci-dessous.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("constructions")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "Ce slug est déjà utilisé par une autre construction.",
      fieldErrors: { slug: ["Ce slug est déjà utilisé."] },
    };
  }

  const { data: created, error } = await supabase
    .from("constructions")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !created) {
    return {
      status: "error",
      message: `Erreur lors de la création : ${error?.message ?? "inconnue"}`,
    };
  }

  revalidatePath("/admin/constructions");
  redirect(`/admin/constructions/${created.id}`);
}

export async function updateConstruction(
  id: string,
  _prevState: ConstructionFormState,
  formData: FormData,
): Promise<ConstructionFormState> {
  await requireAdminUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrige les champs invalides ci-dessous.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("constructions")
    .select("id")
    .eq("slug", parsed.data.slug)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "Ce slug est déjà utilisé par une autre construction.",
      fieldErrors: { slug: ["Ce slug est déjà utilisé."] },
    };
  }

  const { error } = await supabase.from("constructions").update(parsed.data).eq("id", id);

  if (error) {
    return { status: "error", message: `Erreur lors de l'enregistrement : ${error.message}` };
  }

  revalidatePath("/admin/constructions");
  revalidatePath(`/admin/constructions/${id}`);
  return { status: "success", message: "Modifications enregistrées." };
}

export async function deleteConstruction(id: string) {
  await requireAdminUser();

  const supabase = createAdminClient();
  const { error } = await supabase.from("constructions").delete().eq("id", id);

  if (error) {
    throw new Error(`Erreur lors de la suppression : ${error.message}`);
  }

  revalidatePath("/admin/constructions");
}

export async function toggleConstructionStatus(
  id: string,
  nextStatus: "brouillon" | "publie",
) {
  await requireAdminUser();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("constructions")
    .update({ status: nextStatus })
    .eq("id", id);

  if (error) {
    throw new Error(`Erreur lors du changement de statut : ${error.message}`);
  }

  revalidatePath("/admin/constructions");
  revalidatePath(`/admin/constructions/${id}`);
}
