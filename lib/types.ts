export type DifficultyLevel = "facile" | "moyen" | "difficile" | "expert";
export type EditionType = "java" | "bedrock" | "both";
export type ConstructionStatus = "brouillon" | "publie";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Construction = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string | null;
  style: string | null;
  difficulty: DifficultyLevel;
  edition: EditionType;
  min_version: string;
  max_version: string | null;
  width: number | null;
  length: number | null;
  height: number | null;
  status: ConstructionStatus;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
};

export type ConstructionWithCategory = Construction & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export type ConstructionImage = {
  id: string;
  construction_id: string;
  url: string;
  alt_text: string | null;
  position: number;
};

export const MATERIAL_CATEGORIES = [
  "wood",
  "stone",
  "glass",
  "concrete",
  "terracotta",
  "wool",
  "metal",
  "natural",
  "lighting",
  "decorative",
  "functional",
  "other",
] as const;
export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number];

export type Material = {
  id: string;
  name: string;
  minecraft_id: string | null;
  icon_url: string | null;
  category: MaterialCategory | null;
  version_added: string | null;
  is_building_block: boolean;
};

export type ConstructionMaterial = {
  construction_id: string;
  material_id: string;
  quantity: number;
  material: Pick<Material, "id" | "name" | "minecraft_id" | "category">;
};
