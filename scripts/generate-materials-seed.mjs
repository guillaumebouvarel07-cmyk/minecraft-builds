// Génère supabase/seed/materials-java-26-2.json à partir de la liste brute
// des blocs Minecraft (supabase/seed/source-minecraft-wiki-blocks-26.2.json),
// elle-même extraite de la page de référence officielle du wiki Minecraft :
// https://minecraft.wiki/w/Java_Edition_data_values/Blocks
//
// Ce script ne fait AUCUN appel réseau : il ne fait que filtrer/catégoriser
// la donnée déjà collectée. Pour régénérer la donnée source (ex: après une
// nouvelle version du jeu), il faut re-extraire manuellement le tableau de
// cette page wiki dans le même format (colonnes séparées par des tabulations :
// id, nom, forme d'item) et remplacer le fichier source.
//
// Règles de curation :
// - Exclut tout bloc marqué "[upcoming: JE 26.3]" sur le wiki (pas encore
//   sorti dans la version 26.2 ciblée).
// - Ne garde que les blocs réellement utilisables pour construire (bois,
//   pierre + variantes stairs/slab/wall, verre, béton, terre cuite, laine,
//   métaux, éléments naturels, éclairage, décoratif, fonctionnel) — exclut
//   les blocs techniques/créatif uniquement (barrier, jigsaw, command_block…),
//   les stades de pousse de culture (wheat, carrots…), les portails, etc.
// - `addVariants()` détecte automatiquement si _stairs/_slab/_wall existent
//   réellement pour un bloc de base plutôt que de les supposer, et gère le
//   cas particulier des blocs "..._bricks" (pluriel) dont les variantes sont
//   nommées au singulier ("..._brick_stairs").
//
// Usage : node scripts/generate-materials-seed.mjs

import { readFileSync, writeFileSync } from "fs";

const SOURCE_PATH = new URL(
  "../supabase/seed/source-minecraft-wiki-blocks-26.2.json",
  import.meta.url,
);
const OUTPUT_PATH = new URL("../supabase/seed/materials-java-26-2.json", import.meta.url);

const rows = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));

// Exclut tout ce qui n'existe pas encore réellement en 26.2 (marqué [upcoming: JE 26.3] sur le wiki).
const current = rows.filter((r) => !r.name.includes("upcoming"));

const byId = new Map(current.map((r) => [r.id, r.name.trim()]));
const has = (id) => byId.has(id);

const included = new Map(); // id -> { name, category, is_building_block }

function add(id, category, { building = true, nameOverride } = {}) {
  if (!has(id)) return false;
  included.set(id, {
    name: nameOverride ?? byId.get(id),
    category,
    is_building_block: building,
  });
  return true;
}

function addVariants(baseId, category, opts) {
  add(baseId, category, opts);
  // Particularité Minecraft : un bloc "..._bricks" (pluriel) a des variantes
  // nommées au singulier ("..._brick_stairs", pas "..._bricks_stairs").
  const variantRoot = baseId.endsWith("bricks") ? baseId.replace(/bricks$/, "brick") : baseId;
  for (const suffix of ["_stairs", "_slab", "_wall"]) {
    add(variantRoot + suffix, category, opts);
  }
}

// ---------------------------------------------------------------------
// WOOD — familles standards (planks/log/wood/stripped/leaves + formes)
// ---------------------------------------------------------------------
const WOOD_FAMILIES = ["oak", "spruce", "birch", "jungle", "acacia", "dark_oak", "mangrove", "cherry"];
const STEM_FAMILIES = ["crimson", "warped"]; // "stem"/"hyphae" au lieu de "log"/"wood"

for (const f of WOOD_FAMILIES) {
  add(`${f}_planks`, "wood");
  add(`${f}_log`, "wood");
  add(`stripped_${f}_log`, "wood");
  add(`${f}_wood`, "wood");
  add(`stripped_${f}_wood`, "wood");
  add(`${f}_leaves`, "wood");
  for (const suffix of ["_stairs", "_slab", "_fence", "_fence_gate", "_door", "_trapdoor"]) {
    add(`${f}${suffix}`, "wood");
  }
}
for (const f of STEM_FAMILIES) {
  add(`${f}_planks`, "wood");
  add(`${f}_stem`, "wood");
  add(`stripped_${f}_stem`, "wood");
  add(`${f}_hyphae`, "wood");
  add(`stripped_${f}_hyphae`, "wood");
  for (const suffix of ["_stairs", "_slab", "_fence", "_fence_gate", "_door", "_trapdoor"]) {
    add(`${f}${suffix}`, "wood");
  }
}
add("mangrove_roots", "wood");
add("muddy_mangrove_roots", "wood");
// Bambou : structure différente (bloc plutôt que bûche)
for (const id of [
  "bamboo_planks", "bamboo_block", "stripped_bamboo_block",
  "bamboo_mosaic", "bamboo_mosaic_stairs", "bamboo_mosaic_slab",
  "bamboo_stairs", "bamboo_slab", "bamboo_fence", "bamboo_fence_gate",
  "bamboo_door", "bamboo_trapdoor",
]) add(id, "wood");

// Shelf : variante par essence de bois, jamais ajoutée jusqu'ici (repérée en
// préparant la 1re construction verified — voir docs/verified-build-workflow.md).
// pale_oak_shelf/poplar_shelf sont marqués [upcoming: JE 26.3] dans la source,
// donc automatiquement exclus par has() sans traitement spécial.
for (const f of [...WOOD_FAMILIES, ...STEM_FAMILIES, "bamboo"]) {
  add(`${f}_shelf`, "wood");
}

// ---------------------------------------------------------------------
// STONE — matériau de base + variantes stairs/slab/wall si elles existent
// ---------------------------------------------------------------------
const STONE_BASES = [
  "stone", "cobblestone", "mossy_cobblestone", "stone_bricks", "mossy_stone_bricks",
  "smooth_stone", "granite", "polished_granite", "diorite", "polished_diorite",
  "andesite", "polished_andesite", "deepslate", "cobbled_deepslate", "polished_deepslate",
  "deepslate_bricks", "deepslate_tiles", "tuff", "polished_tuff", "tuff_bricks",
  "basalt", "polished_basalt", "blackstone", "polished_blackstone", "polished_blackstone_bricks",
  "sandstone", "smooth_sandstone", "red_sandstone", "smooth_red_sandstone",
  "prismarine", "prismarine_bricks", "dark_prismarine", "nether_bricks", "red_nether_bricks",
  "end_stone_bricks", "purpur_block", "quartz_block", "smooth_quartz", "resin_bricks",
  "mud_bricks", "cinnabar", "polished_cinnabar", "cinnabar_bricks", "sulfur", "polished_sulfur", "sulfur_bricks",
];
for (const base of STONE_BASES) addVariants(base, "stone");
for (const id of [
  "chiseled_stone_bricks", "cracked_stone_bricks", "chiseled_deepslate", "cracked_deepslate_bricks",
  "cracked_deepslate_tiles", "chiseled_tuff", "chiseled_tuff_bricks", "calcite", "dripstone_block",
  "smooth_basalt", "chiseled_polished_blackstone", "cracked_polished_blackstone_bricks", "gilded_blackstone",
  "chiseled_sandstone", "cut_sandstone", "chiseled_red_sandstone", "cut_red_sandstone",
  "chiseled_nether_bricks", "cracked_nether_bricks", "end_stone", "purpur_pillar",
  "chiseled_quartz_block", "quartz_bricks", "quartz_pillar", "obsidian", "crying_obsidian",
  "netherrack", "magma_block", "bone_block", "chiseled_resin_bricks", "packed_mud",
  "chiseled_cinnabar", "chiseled_sulfur", "potent_sulfur", "sulfur_spike",
]) add(id, "stone");

// ---------------------------------------------------------------------
// GLASS
// ---------------------------------------------------------------------
add("glass", "glass");
add("tinted_glass", "glass");
add("glass_pane", "glass");
const COLORS = [
  "white", "orange", "magenta", "light_blue", "yellow", "lime", "pink", "gray",
  "light_gray", "cyan", "purple", "blue", "brown", "green", "red", "black",
];
for (const c of COLORS) {
  add(`${c}_stained_glass`, "glass");
  add(`${c}_stained_glass_pane`, "glass");
}

// ---------------------------------------------------------------------
// CONCRETE
// ---------------------------------------------------------------------
for (const c of COLORS) {
  add(`${c}_concrete`, "concrete");
  add(`${c}_concrete_powder`, "concrete");
}

// ---------------------------------------------------------------------
// TERRACOTTA
// ---------------------------------------------------------------------
add("terracotta", "terracotta");
for (const c of COLORS) {
  add(`${c}_terracotta`, "terracotta");
  add(`${c}_glazed_terracotta`, "terracotta");
}

// ---------------------------------------------------------------------
// WOOL (les stairs/slab de laine arrivent seulement en 26.3, donc exclus ici)
// ---------------------------------------------------------------------
for (const c of COLORS) add(`${c}_wool`, "wool");

// ---------------------------------------------------------------------
// METAL — fer/or/cuivre (avec ses états d'oxydation et versions cirées)
// ---------------------------------------------------------------------
add("iron_block", "metal");
add("gold_block", "metal");
add("iron_bars", "metal");
add("iron_door", "metal");
add("iron_trapdoor", "metal");
// "chain" (sans préfixe) n'existe plus comme id réel dans la source — le
// bloc s'appelle "iron_chain" (repéré en préparant la 1re construction
// verified), cohérent avec copper_chain généré plus bas.
add("iron_chain", "metal");
add("lightning_rod", "metal");
add("bell", "metal");

const COPPER_PREFIXES = ["", "exposed_", "weathered_", "oxidized_"];
const COPPER_WAX = ["", "waxed_"];
for (const wax of COPPER_WAX) {
  for (const ox of COPPER_PREFIXES) {
    const p = `${wax}${ox}`;
    addVariants(`${p}copper_block`, "metal");
    addVariants(`${p}cut_copper`, "metal");
    for (const id of [
      `${p}chiseled_copper`, `${p}copper_bulb`, `${p}copper_door`, `${p}copper_trapdoor`,
      `${p}copper_grate`, `${p}copper_bars`, `${p}copper_chain`, `${p}copper_lantern`,
      `${p}copper_torch`, `${p}copper_wall_torch`, `${p}copper_chest`, `${p}copper_golem_statue`,
    ]) add(id, "metal");
  }
}

// ---------------------------------------------------------------------
// NATURAL — terrain, plantes, éléments naturels
// ---------------------------------------------------------------------
for (const id of [
  "dirt", "coarse_dirt", "dirt_path", "grass_block", "podzol", "mycelium", "rooted_dirt",
  "mud", "clay", "gravel", "sand", "red_sand", "suspicious_sand", "suspicious_gravel",
  "moss_block", "sculk", "snow", "snow_block", "powder_snow", "ice", "packed_ice", "blue_ice",
  "water", "lava", "seagrass", "tall_seagrass", "kelp_plant", "vine", "glow_lichen",
  "twisting_vines", "weeping_vines", "hanging_roots", "big_dripleaf", "small_dripleaf",
  "moss_carpet", "pale_moss_block", "pale_moss_carpet", "pale_hanging_moss",
  "azalea", "flowering_azalea", "azalea_leaves", "flowering_azalea_leaves",
  "coal_block", "coal_ore", "deepslate_coal_ore", "copper_ore", "deepslate_copper_ore",
  "iron_ore", "deepslate_iron_ore", "gold_ore", "nether_gold_ore", "deepslate_gold_ore",
  "diamond_block", "diamond_ore", "deepslate_diamond_ore", "emerald_block", "emerald_ore",
  "deepslate_emerald_ore", "lapis_block", "lapis_ore", "deepslate_lapis_ore",
  "redstone_block", "redstone_ore", "deepslate_redstone_ore", "ancient_debris",
  "raw_iron_block", "raw_copper_block", "raw_gold_block", "amethyst_block", "budding_amethyst",
  "amethyst_cluster", "hay_block", "sponge", "wet_sponge", "honeycomb_block", "honey_block",
  "melon", "pumpkin", "cactus", "cactus_flower", "bamboo", "sugar_cane",
  "crimson_nylium", "warped_nylium", "crimson_roots", "warped_roots", "crimson_fungus",
  "warped_fungus", "nether_wart_block", "warped_wart_block", "shroomlight",
  "brown_mushroom", "red_mushroom", "brown_mushroom_block", "red_mushroom_block",
  "mushroom_stem", "bee_nest", "beehive", "dead_bush", "fern", "large_fern",
  "grass", "tall_grass", "bush",
]) add(id, "natural");
for (const flower of [
  "dandelion", "poppy", "blue_orchid", "allium", "azure_bluet", "red_tulip", "orange_tulip",
  "white_tulip", "pink_tulip", "oxeye_daisy", "cornflower", "lily_of_the_valley",
  "sunflower", "lilac", "rose_bush", "peony", "wither_rose", "torchflower", "pitcher_plant",
  "spore_blossom", "lily_pad", "chorus_plant", "chorus_flower", "firefly_bush", "closed_eyeblossom", "open_eyeblossom",
]) add(flower, "natural");

// ---------------------------------------------------------------------
// LIGHTING
// ---------------------------------------------------------------------
for (const id of [
  "torch", "wall_torch", "soul_torch", "soul_wall_torch", "lantern", "soul_lantern",
  "glowstone", "sea_lantern", "redstone_lamp", "jack_o_lantern", "campfire", "soul_campfire",
  "end_rod", "ochre_froglight", "verdant_froglight", "pearlescent_froglight", "glow_item_frame",
]) add(id, "lighting");
for (const c of COLORS) add(`${c}_candle`, "lighting");
add("candle", "lighting");

// ---------------------------------------------------------------------
// DECORATIVE
// ---------------------------------------------------------------------
for (const id of [
  "bookshelf", "chiseled_bookshelf", "flower_pot", "item_frame", "painting",
  "armor_stand", "decorated_pot", "cobweb",
  "player_head", "creeper_head", "zombie_head", "skeleton_skull", "wither_skeleton_skull",
  "dragon_head", "piglin_head", "carved_pumpkin",
]) add(id, "decorative");

// Lits : jamais ajoutés jusqu'ici (repéré en préparant la 1re construction
// verified — voir docs/verified-build-workflow.md), une couleur par teinture.
for (const c of COLORS) add(`${c}_bed`, "functional");

// ---------------------------------------------------------------------
// FUNCTIONAL
// ---------------------------------------------------------------------
for (const id of [
  "crafting_table", "furnace", "blast_furnace", "smoker", "chest", "trapped_chest",
  "ender_chest", "barrel", "ladder", "scaffolding", "anvil", "chipped_anvil", "damaged_anvil",
  "enchanting_table", "brewing_stand", "cauldron", "composter", "beacon", "conduit",
  "lectern", "loom", "smithing_table", "stonecutter", "grindstone", "cartography_table",
  "fletching_table", "respawn_anchor", "lodestone", "note_block", "crafter",
]) add(id, "functional");

// ---------------------------------------------------------------------
const list = [...included.entries()]
  .map(([id, v]) => ({
    name: v.name,
    minecraft_id: `minecraft:${id}`,
    category: v.category,
    is_building_block: v.is_building_block,
    version_added: null,
  }))
  .sort((a, b) => a.minecraft_id.localeCompare(b.minecraft_id));

// Marquage version_added pour les entrées vérifiées comme récentes (26.2 - Chaos Cubed)
const CHAOS_CUBED_26_2 = new Set(
  list
    .filter((m) => m.minecraft_id.includes("cinnabar") || m.minecraft_id.includes("sulfur"))
    .map((m) => m.minecraft_id),
);
for (const m of list) {
  if (CHAOS_CUBED_26_2.has(m.minecraft_id)) m.version_added = "26.2";
}

console.log("Total curated:", list.length);
const byCategory = {};
for (const m of list) byCategory[m.category] = (byCategory[m.category] ?? 0) + 1;
console.log("Par catégorie:", byCategory);

writeFileSync(OUTPUT_PATH, JSON.stringify(list, null, 2) + "\n");
console.log(`\n✅ Écrit dans ${OUTPUT_PATH.pathname}`);
