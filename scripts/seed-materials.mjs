// Seed reproductible et idempotent du catalogue `materials`.
//
// Source des données : supabase/seed/materials-java-26-2.json — une liste de
// blocs Minecraft Java Edition pertinents pour la construction, curée à
// partir de la page officielle de référence du wiki Minecraft
// (https://minecraft.wiki/w/Java_Edition_data_values/Blocks), filtrée pour
// exclure tout ce qui n'est pas encore sorti en 26.2 (marqué "upcoming: JE
// 26.3" sur le wiki au moment de la génération) et pour ne garder que les
// blocs réellement utilisables dans une construction (voir la logique de
// tri dans l'historique de génération : familles de bois, pierres et leurs
// variantes stairs/slab/wall, verre, béton, terre cuite, laine, métaux,
// éléments naturels, éclairage, décoratif, fonctionnel).
//
// Idempotent : upsert sur `minecraft_id` (contrainte UNIQUE), donc relancer
// ce script ne crée jamais de doublon — il met simplement à jour les lignes
// existantes si la source a changé.
//
// Usage : npm run seed:materials

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies.\n" +
      "Lance ce script avec : node --env-file=.env.local scripts/seed-materials.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

const materials = JSON.parse(
  readFileSync(new URL("../supabase/seed/materials-java-26-2.json", import.meta.url), "utf8"),
);

console.log(`Seed de ${materials.length} matériaux depuis materials-java-26-2.json…`);

const BATCH_SIZE = 200;
let upserted = 0;

for (let i = 0; i < materials.length; i += BATCH_SIZE) {
  const batch = materials.slice(i, i + BATCH_SIZE);
  const { error, count } = await supabase
    .from("materials")
    .upsert(batch, { onConflict: "minecraft_id", count: "exact" });

  if (error) {
    console.error(`Erreur sur le batch ${i}-${i + batch.length} :`, error.message);
    process.exit(1);
  }

  upserted += count ?? batch.length;
  console.log(`  ${Math.min(i + BATCH_SIZE, materials.length)}/${materials.length}`);
}

console.log(`\n✅ ${upserted} matériaux upsertés avec succès.`);
