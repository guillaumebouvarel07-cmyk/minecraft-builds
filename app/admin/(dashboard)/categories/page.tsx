import type { Metadata } from "next";

import { CategoryCreateForm } from "@/components/admin/CategoryCreateForm";
import { CategoryRow } from "@/components/admin/CategoryRow";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Catégories" };

type CategoryWithCount = Category & { constructions: { count: number }[] };

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*, constructions(count)")
    .order("name")
    .returns<CategoryWithCount[]>();

  const categories = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Catégories</h1>
      <p className="mt-1 text-sm text-muted">
        Utilisées pour classer les constructions (une catégorie par construction).
      </p>

      <div className="mt-6">
        <CategoryCreateForm />
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          Erreur lors du chargement : {error.message}
        </p>
      )}

      {!error && categories.length === 0 && (
        <p className="mt-8 text-sm text-muted">Aucune catégorie pour l&apos;instant.</p>
      )}

      {categories.length > 0 && (
        <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              usageCount={category.constructions[0]?.count ?? 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
