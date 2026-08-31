"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { attachTagSchema, tagSchema, type TagFormState } from "@/lib/validation/tag";

function parseTagForm(formData: FormData) {
  return tagSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
}

// ---------------------------------------------------------------------
// Catalogue global (/admin/tags)
// ---------------------------------------------------------------------

export async function createTag(
  _prevState: TagFormState,
  formData: FormData,
): Promise<TagFormState> {
  await requireAdminUser();

  const parsed = parseTagForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrige les champs invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "Ce slug est déjà utilisé par un autre tag.",
      fieldErrors: { slug: ["Ce slug est déjà utilisé."] },
    };
  }

  const { error } = await supabase.from("tags").insert(parsed.data);

  if (error) {
    return {
      status: "error",
      message: error.code === "23505" ? "Ce slug est déjà utilisé." : `Erreur : ${error.message}`,
    };
  }

  revalidatePath("/admin/tags");
  return { status: "success", message: "Tag créé." };
}

export async function updateTag(
  id: string,
  _prevState: TagFormState,
  formData: FormData,
): Promise<TagFormState> {
  await requireAdminUser();

  const parsed = parseTagForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrige les champs invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", parsed.data.slug)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "Ce slug est déjà utilisé par un autre tag.",
      fieldErrors: { slug: ["Ce slug est déjà utilisé."] },
    };
  }

  const { error } = await supabase.from("tags").update(parsed.data).eq("id", id);

  if (error) {
    return {
      status: "error",
      message: error.code === "23505" ? "Ce slug est déjà utilisé." : `Erreur : ${error.message}`,
    };
  }

  revalidatePath("/admin/tags");
  return { status: "success", message: "Tag enregistré." };
}

export async function deleteTag(id: string): Promise<TagFormState> {
  await requireAdminUser();

  const supabase = createAdminClient();

  const { count } = await supabase
    .from("construction_tags")
    .select("*", { count: "exact", head: true })
    .eq("tag_id", id);

  if (count && count > 0) {
    return {
      status: "error",
      message: `Utilisé par ${count} construction${count > 1 ? "s" : ""} : retire-le d'abord de ${count > 1 ? "chacune" : "celle-ci"}.`,
    };
  }

  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    return { status: "error", message: `Erreur : ${error.message}` };
  }

  revalidatePath("/admin/tags");
  return { status: "success", message: "Tag supprimé." };
}

// ---------------------------------------------------------------------
// Association à une construction (/admin/constructions/[id])
// ---------------------------------------------------------------------

export async function attachTag(
  constructionId: string,
  _prevState: TagFormState,
  formData: FormData,
): Promise<TagFormState> {
  await requireAdminUser();

  const parsed = attachTagSchema.safeParse({ tag_id: formData.get("tag_id") });
  if (!parsed.success) {
    return { status: "error", message: "Sélectionne un tag dans la liste." };
  }

  const supabase = createAdminClient();

  const { data: existingLink } = await supabase
    .from("construction_tags")
    .select("tag_id")
    .eq("construction_id", constructionId)
    .eq("tag_id", parsed.data.tag_id)
    .maybeSingle();

  if (existingLink) {
    return { status: "error", message: "Ce tag est déjà associé à cette construction." };
  }

  const { error } = await supabase.from("construction_tags").insert({
    construction_id: constructionId,
    tag_id: parsed.data.tag_id,
  });

  revalidatePath(`/admin/constructions/${constructionId}`);

  if (error) {
    if (error.code === "23505") {
      return { status: "error", message: "Ce tag est déjà associé à cette construction." };
    }
    return { status: "error", message: `Erreur : ${error.message}` };
  }

  return { status: "success", message: "Tag ajouté." };
}

export async function createTagAndAttach(
  constructionId: string,
  _prevState: TagFormState,
  formData: FormData,
): Promise<TagFormState> {
  await requireAdminUser();

  const parsed = parseTagForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrige les champs invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  // Réutilise un tag existant avec le même slug plutôt que d'en créer un doublon.
  const { data: existingTag } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  let tagId = existingTag?.id ?? null;

  if (!tagId) {
    const { data: created, error: createError } = await supabase
      .from("tags")
      .insert(parsed.data)
      .select("id")
      .single();

    if (createError || !created) {
      if (createError?.code === "23505") {
        const { data: raceWinner } = await supabase
          .from("tags")
          .select("id")
          .eq("slug", parsed.data.slug)
          .maybeSingle();
        if (!raceWinner) {
          return { status: "error", message: "Ce slug est déjà utilisé." };
        }
        tagId = raceWinner.id;
      } else {
        return {
          status: "error",
          message: `Erreur lors de la création du tag : ${createError?.message ?? "inconnue"}`,
        };
      }
    } else {
      tagId = created.id;
    }
  }

  const { data: existingLink } = await supabase
    .from("construction_tags")
    .select("tag_id")
    .eq("construction_id", constructionId)
    .eq("tag_id", tagId)
    .maybeSingle();

  if (existingLink) {
    return { status: "error", message: "Ce tag est déjà associé à cette construction." };
  }

  const { error } = await supabase
    .from("construction_tags")
    .insert({ construction_id: constructionId, tag_id: tagId });

  revalidatePath(`/admin/constructions/${constructionId}`);
  revalidatePath("/admin/tags");

  if (error) {
    return { status: "error", message: `Erreur : ${error.message}` };
  }

  return { status: "success", message: "Tag créé et ajouté." };
}

export async function removeTagFromConstruction(constructionId: string, tagId: string) {
  await requireAdminUser();

  const supabase = createAdminClient();
  // Ne supprime que l'association : la table tags (catalogue global) n'est
  // jamais touchée par cette action.
  await supabase
    .from("construction_tags")
    .delete()
    .eq("construction_id", constructionId)
    .eq("tag_id", tagId);

  revalidatePath(`/admin/constructions/${constructionId}`);
}
