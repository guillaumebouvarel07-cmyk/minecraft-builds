import { z } from "zod";

const toArray = (v: unknown): string[] => {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v as string];
};

export const SEARCH_PAGE_SIZE = 24;

export const sortOptions = ["recent", "name", "easiest"] as const;
export type SortOption = (typeof sortOptions)[number];

export const searchParamsSchema = z.object({
  q: z
    .string()
    .trim()
    .max(200)
    .optional()
    .catch(undefined),
  difficulty: z
    .enum(["facile", "moyen", "difficile", "expert"])
    .optional()
    .catch(undefined),
  edition: z.enum(["java", "bedrock", "both"]).optional().catch(undefined),
  category: z.string().trim().max(100).optional().catch(undefined),
  tag: z.string().trim().max(100).optional().catch(undefined),
  material: z.preprocess(toArray, z.array(z.string().trim().max(100))).catch([]),
  widthMax: z.coerce.number().int().positive().max(100000).optional().catch(undefined),
  lengthMax: z.coerce.number().int().positive().max(100000).optional().catch(undefined),
  heightMax: z.coerce.number().int().positive().max(100000).optional().catch(undefined),
  version: z.string().trim().max(20).optional().catch(undefined),
  sort: z.enum(sortOptions).optional().catch("recent"),
  page: z.coerce.number().int().positive().max(10000).optional().catch(1),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

/** Parse défensif : des valeurs invalides sont ignorées plutôt que de faire planter la page. */
export function parseSearchParams(raw: Record<string, string | string[] | undefined>): SearchParams {
  const result = searchParamsSchema.safeParse(raw);
  return result.success ? result.data : { material: [] };
}
