"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getVerificationChecklist, isChecklistComplete } from "@/lib/content-status";
import { requireAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  constructionSchema,
  type ConstructionFormState,
  type ConstructionInput,
} from "@/lib/validation/construction";

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
    content_status: formData.get("content_status"),
    creator_name: formData.get("creator_name"),
    source_type: formData.get("source_type"),
    source_url: formData.get("source_url"),
    license: formData.get("license"),
    permission_note: formData.get("permission_note"),
    rights_confirmed: formData.get("rights_confirmed"),
  });
}

/**
 * Complétude relationnelle avant de laisser passer content_status=verified
 * (images/matériaux/tags — pas exprimable en contrainte SQL simple). Même
 * fonction que la checklist affichée dans l'admin (lib/content-status.ts) :
 * ne peut pas diverger entre "ce qui bloque" et "ce qui s'affiche".
 */
async function checkVerificationOrError(
  supabase: ReturnType<typeof createAdminClient>,
  constructionId: string,
  data: ConstructionInput,
): Promise<string | null> {
  const [{ count: imageCount }, { count: materialCount }, { count: tagCount }, { count: fileCount }] =
    await Promise.all([
      supabase
        .from("construction_images")
        .select("id", { count: "exact", head: true })
        .eq("construction_id", constructionId),
      supabase
        .from("construction_materials")
        .select("construction_id", { count: "exact", head: true })
        .eq("construction_id", constructionId),
      supabase
        .from("construction_tags")
        .select("construction_id", { count: "exact", head: true })
        .eq("construction_id", constructionId),
      supabase
        .from("construction_files")
        .select("id", { count: "exact", head: true })
        .eq("construction_id", constructionId),
    ]);

  const checklist = getVerificationChecklist({
    description: data.description,
    category_id: data.category_id,
    width: data.width ?? null,
    length: data.length ?? null,
    height: data.height ?? null,
    creator_name: data.creator_name ?? null,
    source_type: data.source_type ?? null,
    rights_confirmed: data.rights_confirmed,
    imageCount: imageCount ?? 0,
    materialCount: materialCount ?? 0,
    tagCount: tagCount ?? 0,
    fileCount: fileCount ?? 0,
  });

  if (isChecklistComplete(checklist)) return null;

  const missing = checklist.filter((item) => item.required && !item.done).map((item) => item.label);
  return `Fiche incomplète pour passer en "vérifiée" : ${missing.join(" · ")}.`;
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

  // Une construction tout juste créée n'a par définition ni image, ni
  // matériau, ni tag — la checklist "verified" échouerait toujours. Plutôt
  // qu'un message d'erreur à la création, on force "demo" silencieusement :
  // le passage en verified se fait naturellement plus tard, à l'édition,
  // une fois le contenu réellement renseigné (voir le workflow du rapport).
  const insertData = { ...parsed.data, content_status: "demo" as const };

  const { data: created, error } = await supabase
    .from("constructions")
    .insert(insertData)
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

  if (parsed.data.content_status === "verified") {
    const verificationError = await checkVerificationOrError(supabase, id, parsed.data);
    if (verificationError) {
      return {
        status: "error",
        message: verificationError,
        fieldErrors: { content_status: [verificationError] },
      };
    }
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
