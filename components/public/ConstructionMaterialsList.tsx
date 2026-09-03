import Image from "next/image";

import { MATERIAL_CATEGORIES, type MaterialCategory } from "@/lib/types";

export type MaterialRow = {
  quantity: number;
  material: {
    name: string;
    minecraft_id: string | null;
    category: MaterialCategory | null;
    icon_url?: string | null;
  };
};

const categoryOrder = new Map(MATERIAL_CATEGORIES.map((c, i) => [c, i]));

export function ConstructionMaterialsList({ materials }: { materials: MaterialRow[] }) {
  if (materials.length === 0) {
    return <p className="text-sm text-muted">Aucun matériau renseigné pour l&apos;instant.</p>;
  }

  const sorted = [...materials].sort((a, b) => {
    const catDiff =
      (categoryOrder.get(a.material.category ?? "other") ?? 99) -
      (categoryOrder.get(b.material.category ?? "other") ?? 99);
    if (catDiff !== 0) return catDiff;
    return a.material.name.localeCompare(b.material.name, "fr");
  });

  const totalBlocks = materials.reduce((sum, m) => sum + m.quantity, 0);
  const distinctCount = materials.length;

  return (
    <div>
      <p className="text-sm text-muted">
        <span className="font-medium text-fg">{distinctCount}</span> type
        {distinctCount > 1 ? "s" : ""} de matériau{distinctCount > 1 ? "x" : ""} ·{" "}
        <span className="font-medium text-fg">{totalBlocks.toLocaleString("fr-FR")}</span> bloc
        {totalBlocks > 1 ? "s" : ""} au total
      </p>

      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">
        {sorted.map((row) => (
          <li
            key={`${row.material.name}-${row.material.minecraft_id ?? ""}`}
            className="flex items-center justify-between gap-3 bg-surface px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {row.material.icon_url ? (
                <Image
                  src={row.material.icon_url}
                  alt=""
                  width={24}
                  height={24}
                  className="shrink-0 rounded [image-rendering:pixelated]"
                />
              ) : (
                <span className="h-6 w-6 shrink-0 rounded bg-surface-2" aria-hidden />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-fg">{row.material.name}</p>
                {row.material.minecraft_id && (
                  <p className="truncate font-mono text-xs text-muted">{row.material.minecraft_id}</p>
                )}
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-fg">
              × {row.quantity.toLocaleString("fr-FR")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
