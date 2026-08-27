import type { Metadata } from "next";

import { createConstruction } from "@/actions/constructions";
import { ConstructionForm } from "@/components/admin/ConstructionForm";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Nouvelle construction" };

export default async function NewConstructionPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nouvelle construction</h1>
      <p className="mt-1 text-sm text-muted">
        Créée en brouillon par défaut — publie-la quand elle est prête.
      </p>

      <div className="mt-8">
        <ConstructionForm mode="create" action={createConstruction} categories={categories ?? []} />
      </div>
    </div>
  );
}
