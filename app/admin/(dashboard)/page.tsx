import Link from "next/link";

import { getAdminUser } from "@/lib/auth/admin";

export default async function AdminDashboardPage() {
  const user = await getAdminUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
        <span
          aria-hidden
          className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-dim text-accent"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-medium">Authentification fonctionnelle</p>
          <p className="mt-0.5 text-sm text-muted">Connecté en tant que {user?.email}.</p>
        </div>
      </div>

      <Link
        href="/admin/constructions"
        className="mt-6 inline-block rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent/40"
      >
        Gérer les constructions →
      </Link>

      <p className="mt-6 text-sm text-muted">
        Images, matériaux, tags et fichiers schematic/litematic arrivent à une étape suivante.
      </p>
    </div>
  );
}
