import type { ConstructionStatus, DifficultyLevel, EditionType } from "@/lib/types";

export const difficultyLabels: Record<DifficultyLevel, string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
  expert: "Expert",
};

export const editionLabels: Record<EditionType, string> = {
  java: "Java",
  bedrock: "Bedrock",
  both: "Java + Bedrock",
};

export const statusLabels: Record<ConstructionStatus, string> = {
  brouillon: "Brouillon",
  publie: "Publié",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
