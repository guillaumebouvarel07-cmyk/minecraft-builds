"use client";

import { useActionState, useMemo, useState } from "react";

import { attachMaterial, createMaterialAndAttach } from "@/actions/materials";
import { DeleteMaterialButton } from "@/components/admin/DeleteMaterialButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { materialCategoryLabels } from "@/lib/material-labels";
import { initialMaterialActionState } from "@/lib/validation/material";
import { MATERIAL_CATEGORIES, type Material } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm text-fg outline-none focus-visible:border-accent";

export function MaterialPicker({
  constructionId,
  availableMaterials,
}: {
  constructionId: string;
  availableMaterials: Material[];
}) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Material | null>(null);

  const attachAction = attachMaterial.bind(null, constructionId);
  const [attachState, attachFormAction] = useActionState(attachAction, initialMaterialActionState);

  const createAction = createMaterialAndAttach.bind(null, constructionId);
  const [createState, createFormAction] = useActionState(createAction, initialMaterialActionState);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return availableMaterials
      .filter(
        (m) => m.name.toLowerCase().includes(q) || m.minecraft_id?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, availableMaterials]);

  const activeState = mode === "existing" ? attachState : createState;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`rounded-lg px-3 py-1.5 ${
            mode === "existing" ? "bg-accent-dim text-accent" : "text-muted hover:text-fg"
          }`}
        >
          Matériau existant
        </button>
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`rounded-lg px-3 py-1.5 ${
            mode === "new" ? "bg-accent-dim text-accent" : "text-muted hover:text-fg"
          }`}
        >
          Nouveau matériau
        </button>
      </div>

      {mode === "existing" && (
        <div className="mt-3 space-y-3">
          {/* En dehors du <form> ci-dessous : le bouton de suppression du
              catalogue est lui-même un <form>, et un <form> ne peut pas être
              imbriqué dans un autre <form> (HTML invalide). */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un matériau (nom ou minecraft_id)…"
              value={selected ? selected.name : query}
              onChange={(e) => {
                setSelected(null);
                setQuery(e.target.value);
              }}
              className={inputClass}
              autoComplete="off"
            />
            {!selected && matches.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface-2 shadow-lg">
                {matches.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-surface">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(m);
                        setQuery("");
                      }}
                      className="flex min-w-0 flex-1 flex-col items-start text-left text-sm"
                    >
                      <span>{m.name}</span>
                      {m.minecraft_id && (
                        <span className="font-mono text-xs text-muted">{m.minecraft_id}</span>
                      )}
                    </button>
                    <DeleteMaterialButton materialId={m.id} materialName={m.name} />
                  </li>
                ))}
              </ul>
            )}
            {!selected && query.trim() && matches.length === 0 && (
              <p className="mt-1.5 text-xs text-muted">
                Aucun résultat — utilise l&apos;onglet &laquo;&nbsp;Nouveau matériau&nbsp;&raquo;.
              </p>
            )}
          </div>

          <form action={attachFormAction} className="space-y-3">
            <input type="hidden" name="material_id" value={selected?.id ?? ""} />

            <div className="flex items-end gap-3">
              <div className="w-28">
                <label htmlFor="attach-quantity" className="block text-xs font-medium text-muted">
                  Quantité
                </label>
                <input
                  id="attach-quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  step={1}
                  defaultValue={1}
                  required
                  className={`${inputClass} mt-1`}
                />
              </div>
              <SubmitButton
                pendingLabel="Ajout…"
                className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-base transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Ajouter
              </SubmitButton>
            </div>

            {!selected && (
              <p className="text-xs text-muted">Sélectionne un matériau dans la liste ci-dessus.</p>
            )}
          </form>
        </div>
      )}

      {mode === "new" && (
        <form action={createFormAction} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="new-name" className="block text-xs font-medium text-muted">
                Nom
              </label>
              <input id="new-name" name="name" required className={`${inputClass} mt-1`} />
            </div>
            <div>
              <label htmlFor="new-minecraft-id" className="block text-xs font-medium text-muted">
                minecraft_id (optionnel)
              </label>
              <input
                id="new-minecraft-id"
                name="minecraft_id"
                placeholder="ex : oak_planks"
                className={`${inputClass} mt-1 font-mono`}
              />
            </div>
            <div>
              <label htmlFor="new-category" className="block text-xs font-medium text-muted">
                Catégorie
              </label>
              <select id="new-category" name="category" defaultValue="other" className={`${inputClass} mt-1`}>
                {MATERIAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {materialCategoryLabels[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="w-28">
              <label htmlFor="new-quantity" className="block text-xs font-medium text-muted">
                Quantité
              </label>
              <input
                id="new-quantity"
                name="quantity"
                type="number"
                min={1}
                step={1}
                defaultValue={1}
                required
                className={`${inputClass} mt-1`}
              />
            </div>
            <SubmitButton
              pendingLabel="Création…"
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-base transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Créer et ajouter
            </SubmitButton>
          </div>
        </form>
      )}

      {activeState.status !== "idle" && activeState.message && (
        <p
          role="alert"
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            activeState.status === "success"
              ? "border-accent/40 bg-accent-dim text-accent"
              : "border-red-900/50 bg-red-950/40 text-red-300"
          }`}
        >
          {activeState.message}
        </p>
      )}
    </div>
  );
}
