import type { Metadata } from "next";

import { TagCreateForm } from "@/components/admin/TagCreateForm";
import { TagRow } from "@/components/admin/TagRow";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tag } from "@/lib/types";

export const metadata: Metadata = { title: "Tags" };

type TagWithCount = Tag & { construction_tags: { count: number }[] };

export default async function AdminTagsPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*, construction_tags(count)")
    .order("name")
    .returns<TagWithCount[]>();

  const tags = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
      <p className="mt-1 text-sm text-muted">
        Utilisés pour classer les constructions (plusieurs tags par construction).
      </p>

      <div className="mt-6">
        <TagCreateForm />
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          Erreur lors du chargement : {error.message}
        </p>
      )}

      {!error && tags.length === 0 && (
        <p className="mt-8 text-sm text-muted">Aucun tag pour l&apos;instant.</p>
      )}

      {tags.length > 0 && (
        <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} usageCount={tag.construction_tags[0]?.count ?? 0} />
          ))}
        </ul>
      )}
    </div>
  );
}
