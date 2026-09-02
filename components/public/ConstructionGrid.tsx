import { ConstructionCard, type ConstructionCardData } from "@/components/public/ConstructionCard";
import { LinkButton } from "@/components/ui/Button";

export function ConstructionGrid({
  constructions,
  emptyMessage,
}: {
  constructions: ConstructionCardData[];
  emptyMessage: string;
}) {
  if (constructions.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center">
        <p className="text-sm text-muted">{emptyMessage}</p>
        <LinkButton href="/" variant="secondary" size="sm" className="mt-4">
          Retour à l&apos;accueil
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {constructions.map((construction) => (
        <ConstructionCard key={construction.slug} construction={construction} />
      ))}
    </div>
  );
}
