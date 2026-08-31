"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  validateConstructionFile,
  type FileActionState,
} from "@/lib/validation/construction-file";

const BUCKET = "construction-files";

export async function uploadConstructionFiles(
  constructionId: string,
  _prevState: FileActionState,
  formData: FormData,
): Promise<FileActionState> {
  await requireAdminUser();

  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return { status: "error", message: "Aucun fichier sélectionné." };
  }

  const supabase = createAdminClient();
  const errors: string[] = [];
  let uploaded = 0;

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await validateConstructionFile(file.name, file.size, bytes);

    if (!result.ok) {
      errors.push(result.message);
      continue;
    }

    // Chemin Storage entièrement généré côté serveur (UUID + extension issue
    // de notre propre whitelist) — jamais dérivé du nom fourni par l'utilisateur.
    const path = `${constructionId}/${crypto.randomUUID()}.${result.fileType}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "application/octet-stream", upsert: false });

    if (uploadError) {
      errors.push(`${file.name} : ${uploadError.message}`);
      continue;
    }

    const { error: insertError } = await supabase.from("construction_files").insert({
      construction_id: constructionId,
      storage_path: path,
      original_filename: file.name.slice(0, 255),
      file_type: result.fileType,
      file_size: file.size,
    });

    if (insertError) {
      // On retire le fichier orphelin du Storage si l'écriture en base échoue.
      await supabase.storage.from(BUCKET).remove([path]);
      errors.push(`${file.name} : ${insertError.message}`);
      continue;
    }

    uploaded += 1;
  }

  revalidatePath(`/admin/constructions/${constructionId}`);

  if (uploaded === 0) {
    return { status: "error", message: errors.join(" ") || "Échec de l'upload." };
  }

  if (errors.length > 0) {
    return {
      status: "success",
      message: `${uploaded} fichier(s) ajouté(s). ${errors.join(" ")}`,
    };
  }

  return { status: "success", message: `${uploaded} fichier(s) ajouté(s).` };
}

export async function deleteConstructionFile(id: string, constructionId: string) {
  await requireAdminUser();

  const supabase = createAdminClient();
  const { data: file } = await supabase
    .from("construction_files")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (file?.storage_path) {
    await supabase.storage.from(BUCKET).remove([file.storage_path]);
  }

  await supabase.from("construction_files").delete().eq("id", id);
  revalidatePath(`/admin/constructions/${constructionId}`);
}

/**
 * Génère une URL signée temporaire pour que l'admin puisse télécharger/tester
 * un fichier depuis l'écran d'édition. Le bucket est privé : sans cette URL
 * signée (ou la clé service_role), le fichier n'est récupérable par personne.
 */
export async function getFileDownloadUrl(id: string): Promise<{ url: string } | { error: string }> {
  await requireAdminUser();

  const supabase = createAdminClient();
  const { data: file } = await supabase
    .from("construction_files")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (!file) {
    return { error: "Fichier introuvable." };
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.storage_path, 300);

  if (error || !data) {
    return { error: error?.message ?? "Impossible de générer le lien." };
  }

  return { url: data.signedUrl };
}
