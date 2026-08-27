import { site } from "@/lib/site";

/**
 * Page d'accueil TEMPORAIRE (étape 0).
 *
 * Son seul rôle est de vérifier que Next.js, TypeScript et Tailwind CSS
 * fonctionnent correctement ensemble. Elle donne aussi un premier aperçu
 * de la direction visuelle : sombre, moderne, une seule couleur d'accent.
 *
 * Elle sera entièrement remplacée à l'étape 11.
 */

const checks = [
  { label: "Next.js 16 · App Router", detail: "Cette page est un Server Component." },
  { label: "TypeScript", detail: "Types stricts activés dans tsconfig.json." },
  { label: "Tailwind CSS v4", detail: "Couleurs et polices définies dans globals.css." },
  { label: "Design mobile-first", detail: "Réduis la fenêtre : la mise en page suit." },
];

const nextSteps = [
  "Connecter Supabase et créer le schéma de base de données",
  "Mettre en place l'authentification et l'interface d'administration",
  "Construire les pages publiques et la recherche",
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Projet initialisé
        </p>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {site.tagline}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {site.description}
        </p>

        <p className="mt-8 inline-block rounded-lg border border-line bg-surface px-4 py-2 font-mono text-sm text-muted">
          Le catalogue arrive. Rien n&apos;est encore connecté à une base de données.
        </p>
      </section>

      {/* Vérifications techniques */}
      <section className="border-t border-line py-12 sm:py-16">
        <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">
          Vérification de l&apos;installation
        </h2>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {checks.map((check) => (
            <li
              key={check.label}
              className="flex gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40"
            >
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
              <span>
                <span className="block text-sm font-medium">{check.label}</span>
                <span className="mt-0.5 block text-sm text-muted">
                  {check.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Prochaines étapes */}
      <section className="border-t border-line py-12 sm:py-16">
        <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">
          Prochaines étapes
        </h2>

        <ol className="mt-6 space-y-3">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 font-mono text-xs text-muted">
                {index + 1}
              </span>
              <span className="text-sm text-muted">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
