import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 && <span aria-hidden>/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-fg">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-fg" : ""}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
