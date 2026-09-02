import { NextResponse } from "next/server";
import { z } from "zod";

import { isVerified, type ContentStatus } from "@/lib/content-status";
import { sanitizeDownloadFilename, type FileKind } from "@/lib/validation/construction-file";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Prépare un téléchargement public : le navigateur ne transmet qu'un
 * fileId, jamais un chemin Storage. Répond en JSON plutôt qu'en redirect
 * HTTP direct — le Client Component appelant (DownloadButton) a ainsi un
 * signal fiable de succès/échec AVANT de déclencher trackFileDownload et
 * la navigation réelle vers l'URL signée, pour ne jamais compter un
 * téléchargement refusé dans GA4 (voir le rapport de l'étape 17).
 *
 * Le bucket reste privé en permanence : cette route est le SEUL chemin
 * possible vers un fichier, et uniquement pour une construction publiée.
 */

const BUCKET = "construction-files";
const SIGNED_URL_TTL_SECONDS = 60;

const fileIdSchema = z.string().uuid();

type DownloadFileRow = {
  id: string;
  storage_path: string;
  original_filename: string;
  file_type: FileKind;
  construction_id: string;
  construction: { status: "brouillon" | "publie"; content_status: ContentStatus } | null;
};

function jsonNoStore(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

// Réponse strictement identique pour un fileId mal formé, un fichier
// inexistant et un fichier de brouillon : dans les trois cas, un visiteur
// ne doit pouvoir déduire aucune information.
function notFound() {
  return jsonNoStore({ error: "Fichier introuvable." }, 404);
}

function serverError() {
  return jsonNoStore({ error: "Impossible de préparer le téléchargement." }, 500);
}

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;

  const parsedId = fileIdSchema.safeParse(fileId);
  if (!parsedId.success) {
    // Format invalide : on s'arrête ici, aucune requête base/Storage.
    return notFound();
  }

  const supabase = createAdminClient();

  const { data: file, error: lookupError } = await supabase
    .from("construction_files")
    .select(
      "id, storage_path, original_filename, file_type, construction_id, construction:constructions(status, content_status)",
    )
    .eq("id", parsedId.data)
    .maybeSingle<DownloadFileRow>();

  if (lookupError) {
    console.error("[download] échec de la recherche du fichier", lookupError);
    return serverError();
  }

  // Même vérification explicite qu'ailleurs dans le projet, même si RLS
  // protège déjà côté anon : ici on utilise le client service_role
  // (nécessaire pour générer une URL signée sur un bucket privé), qui
  // contourne RLS — donc le contrôle "publié" DOIT être fait ici, en code.
  //
  // Étape 18 : le téléchargement public est réservé aux constructions
  // "verified" — un fichier de test interne rattaché à une fiche "demo"
  // (même publiée) ne doit jamais être présenté comme un véritable plan
  // vérifié. Réponse identique à "introuvable", comme pour un brouillon :
  // aucune information distincte n'est révélée.
  if (!file || file.construction?.status !== "publie" || !isVerified(file.construction.content_status)) {
    return notFound();
  }

  const filename = sanitizeDownloadFilename(file.original_filename, file.file_type);

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.storage_path, SIGNED_URL_TTL_SECONDS, { download: filename });

  if (signError || !signed) {
    console.error("[download] échec de génération de l'URL signée", signError);
    return serverError();
  }

  // Après succès, juste avant la réponse : mesure une DEMANDE de
  // téléchargement valide, pas la garantie que le transfert a réellement
  // abouti côté visiteur (voir le compromis documenté dans le rapport).
  const { error: incrementError } = await supabase.rpc("increment_download_count", {
    p_construction_id: file.construction_id,
  });
  if (incrementError) {
    // Un échec du compteur ne doit jamais priver le visiteur de son fichier.
    console.error("[download] échec de l'incrément download_count", incrementError);
  }

  return jsonNoStore({ url: signed.signedUrl, filename }, 200);
}
