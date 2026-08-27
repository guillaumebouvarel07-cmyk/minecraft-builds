"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  extensionForMimeType,
  sniffImageMimeType,
  type ImageActionState,
} from "@/lib/validation/image";

const BUCKET = "construction-images";

function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

async function nextPosition(
  supabase: ReturnType<typeof createAdminClient>,
  constructionId: string,
) {
  const { data } = await supabase
    .from("construction_images")
    .select("position")
    .eq("construction_id", constructionId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.position ?? -1) + 1;
}

export async function uploadConstructionImages(
  constructionId: string,
  _prevState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  await requireAdminUser();

  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return { status: "error", message: "Aucun fichier sélectionné." };
  }

  const supabase = createAdminClient();
  let position = await nextPosition(supabase, constructionId);
  const errors: string[] = [];
  let uploaded = 0;

  for (const file of files) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      errors.push(`${file.name} : dépasse 5 Mo.`);
      continue;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const sniffedType = sniffImageMimeType(bytes);

    if (!sniffedType || !ALLOWED_IMAGE_MIME_TYPES.includes(sniffedType)) {
      errors.push(`${file.name} : format non reconnu (JPEG, PNG ou WebP uniquement).`);
      continue;
    }

    const path = `${constructionId}/${crypto.randomUUID()}.${extensionForMimeType(sniffedType)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: sniffedType, upsert: false });

    if (uploadError) {
      errors.push(`${file.name} : ${uploadError.message}`);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: insertError } = await supabase.from("construction_images").insert({
      construction_id: constructionId,
      url: publicUrl,
      alt_text: null,
      position,
    });

    if (insertError) {
      // On retire le fichier orphelin du Storage si l'écriture en base échoue.
      await supabase.storage.from(BUCKET).remove([path]);
      errors.push(`${file.name} : ${insertError.message}`);
      continue;
    }

    position += 1;
    uploaded += 1;
  }

  revalidatePath(`/admin/constructions/${constructionId}`);

  if (uploaded === 0) {
    return { status: "error", message: errors.join(" ") || "Échec de l'upload." };
  }

  if (errors.length > 0) {
    return {
      status: "success",
      message: `${uploaded} image(s) ajoutée(s). ${errors.join(" ")}`,
    };
  }

  return { status: "success", message: `${uploaded} image(s) ajoutée(s).` };
}

export async function deleteConstructionImage(id: string, constructionId: string) {
  await requireAdminUser();

  const supabase = createAdminClient();
  const { data: image } = await supabase
    .from("construction_images")
    .select("url")
    .eq("id", id)
    .maybeSingle();

  if (image?.url) {
    const path = storagePathFromPublicUrl(image.url);
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
  }

  await supabase.from("construction_images").delete().eq("id", id);
  revalidatePath(`/admin/constructions/${constructionId}`);
}

export async function updateImageAltText(id: string, constructionId: string, formData: FormData) {
  await requireAdminUser();

  const altText = String(formData.get("alt_text") ?? "").trim();
  const supabase = createAdminClient();

  await supabase
    .from("construction_images")
    .update({ alt_text: altText || null })
    .eq("id", id);

  revalidatePath(`/admin/constructions/${constructionId}`);
}

export async function moveConstructionImage(
  id: string,
  constructionId: string,
  direction: "up" | "down",
) {
  await requireAdminUser();

  const supabase = createAdminClient();
  const { data: images } = await supabase
    .from("construction_images")
    .select("id, position")
    .eq("construction_id", constructionId)
    .order("position", { ascending: true });

  if (!images) return;

  const index = images.findIndex((image) => image.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= images.length) {
    return;
  }

  const current = images[index];
  const swap = images[swapIndex];

  await supabase
    .from("construction_images")
    .update({ position: swap.position })
    .eq("id", current.id);
  await supabase
    .from("construction_images")
    .update({ position: current.position })
    .eq("id", swap.id);

  revalidatePath(`/admin/constructions/${constructionId}`);
}
