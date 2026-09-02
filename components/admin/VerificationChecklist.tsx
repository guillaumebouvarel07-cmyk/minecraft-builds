import type { ContentStatus, VerificationChecklistItem } from "@/lib/content-status";

/**
 * Purement informatif — le vrai blocage a lieu côté serveur
 * (actions/constructions.ts) au moment de l'enregistrement. Cette
 * checklist permet juste de voir d'un coup d'œil ce qu'il reste à faire
 * avant de pouvoir basculer en "vérifiée".
 */
export function VerificationChecklist({
  checklist,
  contentStatus,
}: {
  checklist: VerificationChecklistItem[];
  contentStatus: ContentStatus;
}) {
  const missingRequired = checklist.filter((item) => item.required && !item.done);

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-fg">Checklist de vérification</h2>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            contentStatus === "verified"
              ? "border-accent/30 bg-accent-dim text-accent"
              : "border-line text-muted"
          }`}
        >
          {contentStatus === "verified" ? "Vérifiée" : "Démonstration"}
        </span>
      </div>

      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-start gap-1.5 text-sm">
            <span aria-hidden className={item.done ? "text-accent" : "text-muted"}>
              {item.done ? "✓" : "✗"}
            </span>
            <span className={item.done ? "text-fg" : "text-muted"}>
              {item.label}
              {!item.required && " (optionnel)"}
            </span>
          </li>
        ))}
      </ul>

      {contentStatus !== "verified" && missingRequired.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          {missingRequired.length} élément{missingRequired.length > 1 ? "s" : ""} requis manquant
          {missingRequired.length > 1 ? "s" : ""} avant de pouvoir passer en « Vérifiée ».
        </p>
      )}
    </div>
  );
}
