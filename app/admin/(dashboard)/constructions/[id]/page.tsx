import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateConstruction } from "@/actions/constructions";
import { ConstructionForm } from "@/components/admin/ConstructionForm";
import { DeleteConstructionButton } from "@/components/admin/DeleteConstructionButton";
import { ImageGallery } from "@/components/admin/ImageGallery";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { StatusToggleButton } from "@/components/admin/StatusToggleButton";
import { formatDate } from "@/lib/constructions-labels";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Construction, ConstructionImage } from "@/lib/types";

export const metadata: Metadata = { title: "Modifier une construction" };

export default async function EditConstructionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: construction }, { data: categories }, { data: images }] = await Promise.all([
    supabase.from("constructions").select("*").eq("id", id).maybeSingle<Construction>(),
    supabase.from("categories").select("id, name").order("name"),
    supabase
      .from("construction_images")
      .select("*")
      .eq("construction_id", id)
      .order("position", { ascending: true })
      .returns<ConstructionImage[]>(),
  ]);

  if (!construction) {
    notFound();
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{construction.name}</h1>
          <p className="mt-1 text-sm text-muted">
            Dernière modification : {formatDate(construction.updated_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusToggleButton
            id={construction.id}
            status={construction.status}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg transition-colors hover:border-accent/40"
          />
          <DeleteConstructionButton id={construction.id} name={construction.name} />
        </div>
      </div>

      <div className="mt-8">
        <ConstructionForm
          mode="edit"
          action={updateConstruction.bind(null, construction.id)}
          categories={categories ?? []}
          construction={construction}
        />
      </div>

      <div className="mt-10 border-t border-line pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Images</h2>
        <p className="mt-1 text-sm text-muted">
          La première image de la liste est utilisée comme image principale.
        </p>

        <div className="mt-4">
          <ImageUploader constructionId={construction.id} />
        </div>

        <div className="mt-6">
          <ImageGallery constructionId={construction.id} images={images ?? []} />
        </div>
      </div>
    </div>
  );
}
