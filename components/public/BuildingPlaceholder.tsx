/**
 * Placeholder visuel pour une construction sans image — motif géométrique
 * généré en SVG (aucune image externe, aucun contenu généré par IA).
 * Réutilise le même repère cube que le logo pour rester cohérent.
 */
export function BuildingPlaceholder({ className = "" }: { className?: string }) {
  const patternId = "building-placeholder-grid";

  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label="Aucune image disponible pour cette construction"
    >
      <defs>
        <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M0 28 28 0"
            className="stroke-line"
            strokeWidth="1"
            fill="none"
          />
        </pattern>
      </defs>

      <rect width="400" height="300" className="fill-surface-2" />
      <rect width="400" height="300" fill={`url(#${patternId})`} opacity="0.5" />

      <g transform="translate(200 150)" className="text-muted">
        <path
          d="M0 -46 40 -23 40 23 0 46 -40 23 -40 -23Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M0 -46 0 0 40 23" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M0 0 -40 23" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
