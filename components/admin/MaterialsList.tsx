import { QuantityEditForm } from "@/components/admin/QuantityEditForm";
import { RemoveMaterialButton } from "@/components/admin/RemoveMaterialButton";
import { materialCategoryLabels } from "@/lib/material-labels";
import { MATERIAL_CATEGORIES, type ConstructionMaterial } from "@/lib/types";

const categoryOrder = new Map(MATERIAL_CATEGORIES.map((c, i) => [c, i]));

export function MaterialsList({
  constructionId,
  materials,
}: {
  constructionId: string;
  materials: ConstructionMaterial[];
}) {
  if (materials.length === 0) {
    return <p className="text-sm text-muted">Aucun matériau pour l&apos;instant.</p>;
  }

  // Trié par catégorie (dans l'ordre défini), puis par nom au sein de chaque catégorie.
  const sorted = [...materials].sort((a, b) => {
    const catDiff =
      (categoryOrder.get(a.material.category ?? "other") ?? 99) -
      (categoryOrder.get(b.material.category ?? "other") ?? 99);
    if (catDiff !== 0) return catDiff;
    return a.material.name.localeCompare(b.material.name, "fr");
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-surface text-left text-xs text-muted uppercase">
            <th className="px-4 py-3 font-medium">Nom</th>
            <th className="px-4 py-3 font-medium">Catégorie</th>
            <th className="px-4 py-3 font-medium">minecraft_id</th>
            <th className="px-4 py-3 font-medium">Quantité</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item.material_id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-medium">{item.material.name}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-muted">
                  {materialCategoryLabels[item.material.category ?? "other"]}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted">
                {item.material.minecraft_id ?? "—"}
              </td>
              <td className="px-4 py-3">
                <QuantityEditForm
                  constructionId={constructionId}
                  materialId={item.material_id}
                  quantity={item.quantity}
                />
              </td>
              <td className="px-4 py-3">
                <RemoveMaterialButton constructionId={constructionId} materialId={item.material_id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
