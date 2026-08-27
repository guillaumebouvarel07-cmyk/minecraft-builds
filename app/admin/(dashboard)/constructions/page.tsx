import Link from "next/link";
import type { Metadata } from "next";

import { DeleteConstructionButton } from "@/components/admin/DeleteConstructionButton";
import { StatusToggleButton } from "@/components/admin/StatusToggleButton";
import { difficultyLabels, editionLabels, formatDate } from "@/lib/constructions-labels";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ConstructionWithCategory } from "@/lib/types";

export const metadata: Metadata = { title: "Constructions" };

const badgeClass =
  "inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-muted";

export default async function AdminConstructionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("constructions")
    .select("*, category:categories(id, name, slug)")
    .order("updated_at", { ascending: false });

  if (status === "publie" || status === "brouillon") {
    query = query.eq("status", status);
  }
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query.returns<ConstructionWithCategory[]>();
  const constructions = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Constructions</h1>
        <Link
          href="/admin/constructions/nouveau"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-base transition-opacity hover:opacity-90"
        >
          + Nouvelle construction
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label htmlFor="q" className="block text-xs font-medium text-muted">
            Recherche par nom
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="ex : maison…"
            className="mt-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg outline-none focus-visible:border-accent"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-xs font-medium text-muted">
            Statut
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg outline-none focus-visible:border-accent"
          >
            <option value="">Tous</option>
            <option value="publie">Publié</option>
            <option value="brouillon">Brouillon</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg transition-colors hover:border-accent/40"
        >
          Filtrer
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          Erreur lors du chargement : {error.message}
        </p>
      )}

      {!error && constructions.length === 0 && (
        <p className="mt-8 text-sm text-muted">Aucune construction ne correspond à ces critères.</p>
      )}

      {constructions.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-xs text-muted uppercase">
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Difficulté</th>
                <th className="px-4 py-3 font-medium">Édition</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Modifié</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {constructions.map((construction) => (
                <tr key={construction.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/constructions/${construction.id}`}
                      className="hover:text-accent"
                    >
                      {construction.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{construction.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={badgeClass}>{difficultyLabels[construction.difficulty]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={badgeClass}>{editionLabels[construction.edition]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        construction.status === "publie"
                          ? "inline-flex items-center rounded-full bg-accent-dim px-2.5 py-0.5 text-xs text-accent"
                          : badgeClass
                      }
                    >
                      {construction.status === "publie" ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(construction.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/constructions/${construction.id}`}
                        className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg transition-colors hover:border-accent/40"
                      >
                        Modifier
                      </Link>
                      <StatusToggleButton
                        id={construction.id}
                        status={construction.status}
                        className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/40 hover:text-fg"
                      />
                      <DeleteConstructionButton id={construction.id} name={construction.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
