import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted">
      {all.map((crumb, i) => {
        const isLast = i === all.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="hover:text-ink">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? "text-ink" : undefined}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
