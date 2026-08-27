"use client";

import { toggleConstructionStatus } from "@/actions/constructions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { ConstructionStatus } from "@/lib/types";

export function StatusToggleButton({
  id,
  status,
  className,
}: {
  id: string;
  status: ConstructionStatus;
  className?: string;
}) {
  const nextStatus: ConstructionStatus = status === "publie" ? "brouillon" : "publie";
  const label = status === "publie" ? "Dépublier" : "Publier";
  const pendingLabel = status === "publie" ? "Dépublication…" : "Publication…";

  return (
    <form action={toggleConstructionStatus.bind(null, id, nextStatus)}>
      <SubmitButton pendingLabel={pendingLabel} className={className}>
        {label}
      </SubmitButton>
    </form>
  );
}
