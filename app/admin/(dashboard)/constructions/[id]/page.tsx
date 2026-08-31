import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateConstruction } from "@/actions/constructions";
import { ConstructionForm } from "@/components/admin/ConstructionForm";
import { DeleteConstructionButton } from "@/components/admin/DeleteConstructionButton";
import { ImageGallery } from "@/components/admin/ImageGallery";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MaterialPicker } from "@/components/admin/MaterialPicker";
import { MaterialsList } from "@/components/admin/MaterialsList";
import { StatusToggleButton } from "@/components/admin/StatusToggleButton";
import { TagBadgeList } from "@/components/admin/TagBadgeList";
import { TagPicker } from "@/components/admin/TagPicker";
import { formatDate } from "@/lib/constructions-labels";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Construction,
  ConstructionImage,
  ConstructionMaterial,
  ConstructionTag,
  Material,
  Tag,
} from "@/lib/types";

export const metadata: Metadata = { title: "Modifier une construction" };

export default async function EditConstructionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [
    { data: construction },
    { data: categories },
    { data: images },
    { data: constructionMaterials },
    { data: allMaterials },
    { data: constructionTags },
    { data: allTags },
  ] = await Promise.all([
    supabase.from("constructions").select("*").eq("id", id).maybeSingle<Construction>(),
    supabase.from("categories").select("id, name").order("name"),
    supabase
      .from("construction_images")
      .select("*")
      .eq("construction_id", id)
      .order("position", { ascending: true })
      .returns<ConstructionImage[]>(),
    supabase
      .from("construction_materials")
      .select(
        "construction_id, material_id, quantity, material:materials(id, name, minecraft_id, category)",
      )
      .eq("construction_id", id)
      .returns<ConstructionMaterial[]>(),
    supabase
      .from("materials")
      .select("id, name, minecraft_id, icon_url, category, version_added, is_building_block")
      .order("name")
      .returns<Material[]>(),
    supabase
      .from("construction_tags")
      .select("construction_id, tag_id, tag:tags(id, name, slug)")
      .eq("construction_id", id)
      .returns<ConstructionTag[]>(),
    supabase.from("tags").select("id, name, slug").order("name").returns<Tag[]>(),
  ]);

  if (!construction) {
    notFound();
  }

  const attachedMaterialIds = new Set((constructionMaterials ?? []).map((m) => m.material_id));
  const availableMaterials = (allMaterials ?? []).filter((m) => !attachedMaterialIds.has(m.id));

  const attachedTagIds = new Set((constructionTags ?? []).map((t) => t.tag_id));
  const availableTags = (allTags ?? []).filter((t) => !attachedTagIds.has(t.id));

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

      <div className="mt-10 border-t border-line pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Matériaux</h2>
        <p className="mt-1 text-sm text-muted">
          Les matériaux nécessaires à cette construction, avec leur quantité.
        </p>

        <div className="mt-4">
          <MaterialPicker constructionId={construction.id} availableMaterials={availableMaterials} />
        </div>

        <div className="mt-6">
          <MaterialsList constructionId={construction.id} materials={constructionMaterials ?? []} />
        </div>
      </div>

      <div className="mt-10 border-t border-line pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Tags</h2>
        <p className="mt-1 text-sm text-muted">
          Mots-clés libres pour affiner la découverte de cette construction.
        </p>

        <div className="mt-4">
          <TagPicker constructionId={construction.id} availableTags={availableTags} />
        </div>

        <div className="mt-6">
          <TagBadgeList constructionId={construction.id} tags={constructionTags ?? []} />
        </div>
      </div>
    </div>
  );
}
