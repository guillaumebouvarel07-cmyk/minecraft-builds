"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { categorySchema, type CategoryFormState } from "@/lib/validation/category";

function parseForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdminUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrige les champs invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "Ce slug est déjà utilisé par une autre catégorie.",
      fieldErrors: { slug: ["Ce slug est déjà utilisé."] },
    };
  }

  const { error } = await supabase.from("categories").insert(parsed.data);

  if (error) {
    return {
      status: "error",
      message: error.code === "23505" ? "Ce slug est déjà utilisé." : `Erreur : ${error.message}`,
    };
  }

  revalidatePath("/admin/categories");
  return { status: "success", message: "Catégorie créée." };
}

export async function updateCategory(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdminUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrige les champs invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.slug)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "Ce slug est déjà utilisé par une autre catégorie.",
      fieldErrors: { slug: ["Ce slug est déjà utilisé."] },
    };
  }

  const { error } = await supabase.from("categories").update(parsed.data).eq("id", id);

  if (error) {
    return {
      status: "error",
      message: error.code === "23505" ? "Ce slug est déjà utilisé." : `Erreur : ${error.message}`,
    };
  }

  revalidatePath("/admin/categories");
  return { status: "success", message: "Catégorie enregistrée." };
}

export async function deleteCategory(id: string): Promise<CategoryFormState> {
  await requireAdminUser();

  const supabase = createAdminClient();

  const { count } = await supabase
    .from("constructions")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return {
      status: "error",
      message: `Utilisée par ${count} construction${count > 1 ? "s" : ""} : impossible de la supprimer.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { status: "error", message: `Erreur : ${error.message}` };
  }

  revalidatePath("/admin/categories");
  return { status: "success", message: "Catégorie supprimée." };
}
