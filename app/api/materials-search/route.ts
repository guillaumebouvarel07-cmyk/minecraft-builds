import { NextResponse, type NextRequest } from "next/server";

import { createPublicClient } from "@/lib/supabase/public";
import { escapeLike } from "@/lib/validation/material";

/**
 * Recherche de matériaux pour l'autocomplétion du filtre de recherche
 * publique. Ne renvoie que quelques résultats pertinents (jamais les 758
 * matériaux) — la liste complète n'est jamais chargée côté client.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ materials: [] });
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("materials")
    .select("minecraft_id, name")
    .not("minecraft_id", "is", null)
    .ilike("name", `%${escapeLike(q)}%`)
    .order("name")
    .limit(8);

  if (error) {
    return NextResponse.json({ materials: [] }, { status: 500 });
  }

  return NextResponse.json({ materials: data ?? [] });
}
