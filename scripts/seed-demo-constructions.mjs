// Seed reproductible et idempotent d'un catalogue de démonstration : ~15
// constructions fictives (aucun contenu récupéré sur un site tiers),
// réparties sur 6 catégories et 11 tags, chacune avec une liste réaliste
// de matériaux puisée dans le catalogue existant (supabase/seed/materials-java-26-2.json).
//
// Idempotent : catégories et tags sont upsertés sur leur `slug`, les
// constructions sur leur `slug`, et les associations (tags, matériaux)
// sont entièrement remplacées à chaque exécution plutôt qu'accumulées —
// relancer ce script converge toujours vers exactement ce jeu de données,
// sans jamais créer de doublon.
//
// Usage : npm run seed:demo

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies.\n" +
      "Lance ce script avec : node --env-file=.env.local scripts/seed-demo-constructions.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

// ---------------------------------------------------------------------
const CATEGORIES = [
  { slug: "maisons", name: "Maisons", description: "Habitations, du refuge de survie à la résidence confortable." },
  { slug: "chateaux", name: "Châteaux", description: "Forteresses et places fortes, du petit fortin à la citadelle." },
  { slug: "fermes", name: "Fermes", description: "Structures agricoles et d'élevage, automatisées ou non." },
  { slug: "batiments-medievaux", name: "Bâtiments médiévaux", description: "Auberges, tours et constructions d'inspiration médiévale ou fantasy." },
  { slug: "batiments-modernes", name: "Bâtiments modernes", description: "Architecture contemporaine : béton, verre et lignes épurées." },
  { slug: "decorations", name: "Décorations", description: "Petites structures et aménagements décoratifs." },
];

const TAGS = [
  { slug: "survival", name: "Survival" },
  { slug: "starter", name: "Starter" },
  { slug: "medieval", name: "Medieval" },
  { slug: "modern", name: "Modern" },
  { slug: "fantasy", name: "Fantasy" },
  { slug: "small", name: "Small" },
  { slug: "large", name: "Large" },
  { slug: "easy", name: "Easy" },
  { slug: "detailed", name: "Detailed" },
  { slug: "java", name: "Java" },
  { slug: "bedrock", name: "Bedrock" },
];

// ---------------------------------------------------------------------
const CONSTRUCTIONS = [
  {
    slug: "petite-maison-debutant",
    name: "Petite Maison de Débutant",
    description:
      "Une maison simple et efficace, parfaite pour démarrer une partie en survie. Structure compacte en bois et pierre, avec un espace de rangement et un coin artisanat déjà prévus.",
    category_slug: "maisons",
    style: "Rustique",
    difficulty: "facile",
    edition: "java",
    min_version: "1.20",
    max_version: null,
    width: 7,
    length: 9,
    height: 6,
    tags: ["starter", "small", "easy", "survival"],
    materials: [
      ["minecraft:oak_planks", 128],
      ["minecraft:oak_log", 32],
      ["minecraft:cobblestone", 96],
      ["minecraft:glass_pane", 12],
      ["minecraft:oak_door", 1],
      ["minecraft:torch", 8],
      ["minecraft:crafting_table", 1],
      ["minecraft:chest", 2],
      ["minecraft:furnace", 1],
    ],
  },
  {
    slug: "cottage-champetre",
    name: "Cottage Champêtre",
    description:
      "Un cottage chaleureux au toit de chaume évoqué en laine, entouré d'un petit jardin. Idéal pour un début de village ou une résidence secondaire discrète.",
    category_slug: "maisons",
    style: "Rustique médiéval",
    difficulty: "moyen",
    edition: "both",
    min_version: "1.20",
    max_version: "1.21.4",
    width: 10,
    length: 12,
    height: 8,
    tags: ["medieval", "small", "detailed"],
    materials: [
      ["minecraft:spruce_planks", 96],
      ["minecraft:cobblestone", 64],
      ["minecraft:oak_fence", 24],
      ["minecraft:glass_pane", 16],
      ["minecraft:hay_block", 20],
      ["minecraft:oak_door", 2],
      ["minecraft:lantern", 6],
      ["minecraft:flower_pot", 4],
    ],
  },
  {
    slug: "villa-moderne-bord-de-mer",
    name: "Villa Moderne en Bord de Mer",
    description:
      "Une villa à étages avec larges baies vitrées, terrasse et piscine, pensée pour un rendu épuré en béton et verre. Un projet ambitieux pour un survivant établi.",
    category_slug: "batiments-modernes",
    style: "Moderne",
    difficulty: "difficile",
    edition: "java",
    min_version: "1.21",
    max_version: "1.21.4",
    width: 18,
    length: 22,
    height: 12,
    tags: ["modern", "large", "detailed"],
    materials: [
      ["minecraft:white_concrete", 256],
      ["minecraft:light_gray_concrete", 128],
      ["minecraft:glass", 96],
      ["minecraft:quartz_block", 64],
      ["minecraft:sea_lantern", 8],
      ["minecraft:iron_bars", 20],
      ["minecraft:oak_stairs", 40],
      ["minecraft:smooth_quartz", 48],
    ],
  },
  {
    slug: "cube-minimaliste",
    name: "Cube Minimaliste",
    description:
      "Une petite habitation cubique au style épuré, rapide à construire et facile à agrandir. Un bon point de départ pour expérimenter l'architecture moderne.",
    category_slug: "batiments-modernes",
    style: "Minimaliste",
    difficulty: "facile",
    edition: "both",
    min_version: "1.20",
    max_version: null,
    width: 8,
    length: 8,
    height: 6,
    tags: ["modern", "small", "easy"],
    materials: [
      ["minecraft:white_concrete", 64],
      ["minecraft:black_concrete", 16],
      ["minecraft:glass", 32],
      ["minecraft:smooth_quartz", 24],
      ["minecraft:iron_door", 1],
    ],
  },
  {
    slug: "chateau-fort-medieval",
    name: "Château Fort Médiéval",
    description:
      "Une forteresse imposante avec remparts crénelés, quatre tours d'angle et une cour intérieure. Un chantier de longue haleine qui demande beaucoup de pierre et de patience.",
    category_slug: "chateaux",
    style: "Médiéval",
    difficulty: "expert",
    edition: "java",
    min_version: "1.20.4",
    max_version: null,
    width: 32,
    length: 32,
    height: 20,
    tags: ["medieval", "large", "detailed", "java"],
    materials: [
      ["minecraft:stone_bricks", 512],
      ["minecraft:cobblestone", 256],
      ["minecraft:mossy_cobblestone", 128],
      ["minecraft:oak_log", 64],
      ["minecraft:iron_bars", 32],
      ["minecraft:torch", 40],
      ["minecraft:oak_door", 4],
      ["minecraft:cobblestone_wall", 96],
    ],
  },
  {
    slug: "petit-fortin-garnison",
    name: "Petit Fortin de Garnison",
    description:
      "Un petit poste fortifié pensé pour défendre une frontière ou surveiller un territoire. Suffisamment compact pour être bâti en une session de jeu.",
    category_slug: "chateaux",
    style: "Médiéval",
    difficulty: "moyen",
    edition: "java",
    min_version: "1.21",
    max_version: null,
    width: 14,
    length: 14,
    height: 10,
    tags: ["medieval", "small"],
    materials: [
      ["minecraft:cobblestone", 192],
      ["minecraft:stone_bricks", 96],
      ["minecraft:oak_planks", 64],
      ["minecraft:ladder", 8],
      ["minecraft:torch", 16],
      ["minecraft:chest", 2],
    ],
  },
  {
    slug: "tour-du-mage",
    name: "Tour du Mage",
    description:
      "Une tour élancée à l'allure mystique, avec un sommet en spirale et des touches de violet pour évoquer la magie. Parfaite comme repaire d'enchanteur ou point de repère.",
    category_slug: "batiments-medievaux",
    style: "Fantasy",
    difficulty: "moyen",
    edition: "both",
    min_version: "1.21",
    max_version: "1.21.4",
    width: 9,
    length: 9,
    height: 18,
    tags: ["fantasy", "medieval", "detailed"],
    materials: [
      ["minecraft:cobblestone", 128],
      ["minecraft:andesite", 64],
      ["minecraft:purple_stained_glass", 24],
      ["minecraft:lantern", 10],
      ["minecraft:bookshelf", 12],
      ["minecraft:end_rod", 6],
      ["minecraft:cauldron", 1],
    ],
  },
  {
    slug: "auberge-du-voyageur",
    name: "Auberge du Voyageur",
    description:
      "Une auberge accueillante avec salle commune, cheminée et chambres à l'étage. Un lieu idéal pour donner vie à un village ou une route marchande.",
    category_slug: "batiments-medievaux",
    style: "Médiéval",
    difficulty: "moyen",
    edition: "java",
    min_version: "1.20",
    max_version: null,
    width: 12,
    length: 16,
    height: 9,
    tags: ["medieval", "survival"],
    materials: [
      ["minecraft:oak_planks", 160],
      ["minecraft:cobblestone", 80],
      ["minecraft:oak_stairs", 48],
      ["minecraft:glass_pane", 20],
      ["minecraft:campfire", 1],
      ["minecraft:oak_door", 3],
      ["minecraft:barrel", 4],
      ["minecraft:lantern", 8],
    ],
  },
  {
    slug: "ferme-automatique-ble",
    name: "Ferme Automatique à Blé",
    description:
      "Une ferme de blé semi-automatique utilisant de l'eau pour la récolte, avec un système de collecte centralisé. Une bonne introduction aux mécanismes appliqués à l'agriculture.",
    category_slug: "fermes",
    style: "Fonctionnel",
    difficulty: "difficile",
    edition: "java",
    min_version: "1.21",
    max_version: null,
    width: 16,
    length: 16,
    height: 6,
    tags: ["survival", "detailed", "java"],
    materials: [
      ["minecraft:oak_planks", 48],
      ["minecraft:water", 8],
      ["minecraft:chest", 4],
      ["minecraft:composter", 2],
      ["minecraft:glass", 16],
      ["minecraft:redstone_lamp", 4],
      ["minecraft:oak_fence", 32],
    ],
  },
  {
    slug: "ferme-animaux-simple",
    name: "Ferme d'Animaux Simple",
    description:
      "Un enclos simple avec abri et clôtures pour élever vos premiers animaux. Rapide à construire, pensé pour les débuts de partie en survie.",
    category_slug: "fermes",
    style: "Fonctionnel",
    difficulty: "facile",
    edition: "both",
    min_version: "1.19",
    max_version: null,
    width: 12,
    length: 12,
    height: 5,
    tags: ["survival", "starter", "easy", "bedrock"],
    materials: [
      ["minecraft:oak_fence", 64],
      ["minecraft:oak_planks", 32],
      ["minecraft:hay_block", 12],
      ["minecraft:torch", 8],
      ["minecraft:water", 4],
      ["minecraft:chest", 1],
    ],
  },
  {
    slug: "serre-botanique",
    name: "Serre Botanique",
    description:
      "Une serre lumineuse en verre et métal, pensée pour cultiver et exposer diverses plantes. Un bon exercice de construction en structures vitrées.",
    category_slug: "fermes",
    style: "Moderne",
    difficulty: "moyen",
    edition: "java",
    min_version: "1.20",
    max_version: null,
    width: 14,
    length: 10,
    height: 7,
    tags: ["modern", "detailed"],
    materials: [
      ["minecraft:glass", 128],
      ["minecraft:iron_bars", 32],
      ["minecraft:glowstone", 8],
      ["minecraft:moss_block", 16],
      ["minecraft:azalea", 6],
      ["minecraft:dirt", 32],
      ["minecraft:water", 4],
    ],
  },
  {
    slug: "jardin-japonais",
    name: "Jardin Japonais",
    description:
      "Un jardin paisible avec pont de bois, bassin et arrangements végétaux, inspiré des jardins japonais traditionnels. Idéal pour décorer les abords d'un village.",
    category_slug: "decorations",
    style: "Zen",
    difficulty: "moyen",
    edition: "both",
    min_version: "1.20.1",
    max_version: null,
    width: 16,
    length: 16,
    height: 5,
    tags: ["detailed", "small"],
    materials: [
      ["minecraft:cherry_planks", 48],
      ["minecraft:gravel", 64],
      ["minecraft:water", 24],
      ["minecraft:moss_block", 32],
      ["minecraft:lantern", 6],
      ["minecraft:bamboo", 16],
      ["minecraft:dark_oak_log", 12],
    ],
  },
  {
    slug: "phare-cotier",
    name: "Phare Côtier",
    description:
      "Un phare élancé en pierre blanche, avec une lanterne au sommet visible de loin. Un repère pratique pour orienter une base côtière.",
    category_slug: "decorations",
    style: "Maritime",
    difficulty: "facile",
    edition: "java",
    min_version: "1.21",
    max_version: null,
    width: 8,
    length: 8,
    height: 22,
    tags: ["small", "easy"],
    materials: [
      ["minecraft:white_concrete", 96],
      ["minecraft:white_terracotta", 32],
      ["minecraft:glowstone", 4],
      ["minecraft:sea_lantern", 2],
      ["minecraft:iron_bars", 12],
      ["minecraft:white_wool", 8],
    ],
  },
  {
    slug: "loft-urbain",
    name: "Loft Urbain",
    description:
      "Un loft sur deux niveaux au style industriel, mêlant béton brut, métal et grandes ouvertures. Pensé pour un quartier urbain moderne.",
    category_slug: "batiments-modernes",
    style: "Industriel",
    difficulty: "moyen",
    edition: "java",
    min_version: "1.21",
    max_version: "1.21.4",
    width: 12,
    length: 14,
    height: 9,
    tags: ["modern", "detailed"],
    materials: [
      ["minecraft:gray_concrete", 96],
      ["minecraft:black_concrete", 48],
      ["minecraft:iron_bars", 24],
      ["minecraft:glass", 64],
      ["minecraft:smooth_quartz", 32],
      ["minecraft:lantern", 6],
    ],
  },
  {
    slug: "base-survie-discrete",
    name: "Base de Survie Discrète",
    description:
      "Une base fonctionnelle et peu voyante, pensée pour les premières nuits de survie. Regroupe l'essentiel : stockage, artisanat et un peu de confort.",
    category_slug: "maisons",
    style: "Survie",
    difficulty: "facile",
    edition: "java",
    min_version: "1.20",
    max_version: null,
    width: 9,
    length: 9,
    height: 5,
    tags: ["survival", "starter"],
    materials: [
      ["minecraft:cobblestone", 96],
      ["minecraft:oak_planks", 48],
      ["minecraft:torch", 12],
      ["minecraft:chest", 3],
      ["minecraft:crafting_table", 1],
      ["minecraft:furnace", 2],
      ["minecraft:oak_door", 1],
    ],
  },
];

// ---------------------------------------------------------------------
async function upsertCategories() {
  const { error } = await supabase.from("categories").upsert(CATEGORIES, { onConflict: "slug" });
  if (error) throw new Error(`Catégories : ${error.message}`);
  console.log(`✅ ${CATEGORIES.length} catégories upsertées.`);
}

async function upsertTags() {
  const { error } = await supabase.from("tags").upsert(TAGS, { onConflict: "slug" });
  if (error) throw new Error(`Tags : ${error.message}`);
  console.log(`✅ ${TAGS.length} tags upsertés.`);
}

async function resolveIdsBySlugOrId(table, column, values) {
  const { data, error } = await supabase.from(table).select(`id, ${column}`).in(column, values);
  if (error) throw new Error(`${table} : ${error.message}`);
  const map = new Map(data.map((row) => [row[column], row.id]));
  return map;
}

async function upsertConstructions() {
  const categoryIds = await resolveIdsBySlugOrId(
    "categories",
    "slug",
    CATEGORIES.map((c) => c.slug),
  );
  const tagIds = await resolveIdsBySlugOrId(
    "tags",
    "slug",
    TAGS.map((t) => t.slug),
  );

  const allMinecraftIds = [...new Set(CONSTRUCTIONS.flatMap((c) => c.materials.map(([id]) => id)))];
  const materialIds = await resolveIdsBySlugOrId("materials", "minecraft_id", allMinecraftIds);

  const missingMaterials = allMinecraftIds.filter((id) => !materialIds.has(id));
  if (missingMaterials.length > 0) {
    console.warn(`⚠️  Matériaux introuvables dans le catalogue (ignorés) : ${missingMaterials.join(", ")}`);
  }

  let constructionsDone = 0;
  let tagLinksDone = 0;
  let materialLinksDone = 0;

  for (const item of CONSTRUCTIONS) {
    const categoryId = categoryIds.get(item.category_slug);
    if (!categoryId) {
      console.warn(`⚠️  Catégorie "${item.category_slug}" introuvable pour "${item.slug}", ignorée.`);
      continue;
    }

    const { data: construction, error: constructionError } = await supabase
      .from("constructions")
      .upsert(
        {
          slug: item.slug,
          name: item.name,
          description: item.description,
          category_id: categoryId,
          style: item.style,
          difficulty: item.difficulty,
          edition: item.edition,
          min_version: item.min_version,
          max_version: item.max_version,
          width: item.width,
          length: item.length,
          height: item.height,
          status: "publie",
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (constructionError || !construction) {
      console.warn(`⚠️  Construction "${item.slug}" : ${constructionError?.message}`);
      continue;
    }
    constructionsDone += 1;

    // Remplace entièrement les tags associés (idempotent, pas d'accumulation).
    await supabase.from("construction_tags").delete().eq("construction_id", construction.id);
    const tagRows = item.tags
      .map((slug) => tagIds.get(slug))
      .filter(Boolean)
      .map((tagId) => ({ construction_id: construction.id, tag_id: tagId }));
    if (tagRows.length > 0) {
      const { error } = await supabase.from("construction_tags").insert(tagRows);
      if (error) console.warn(`⚠️  Tags de "${item.slug}" : ${error.message}`);
      else tagLinksDone += tagRows.length;
    }

    // Remplace entièrement les matériaux associés.
    await supabase.from("construction_materials").delete().eq("construction_id", construction.id);
    const materialRows = item.materials
      .filter(([mcId]) => materialIds.has(mcId))
      .map(([mcId, quantity]) => ({
        construction_id: construction.id,
        material_id: materialIds.get(mcId),
        quantity,
      }));
    if (materialRows.length > 0) {
      const { error } = await supabase.from("construction_materials").insert(materialRows);
      if (error) console.warn(`⚠️  Matériaux de "${item.slug}" : ${error.message}`);
      else materialLinksDone += materialRows.length;
    }
  }

  console.log(`✅ ${constructionsDone}/${CONSTRUCTIONS.length} constructions upsertées.`);
  console.log(`✅ ${tagLinksDone} associations tag<->construction créées.`);
  console.log(`✅ ${materialLinksDone} associations matériau<->construction créées.`);
}

await upsertCategories();
await upsertTags();
await upsertConstructions();
