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
