// ============================================
// FILE: components/shared/BreadcrumbTrail.tsx
// DESCRIPTION: Breadcrumb navigation component
// ============================================

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  labelNepali?: string;
  href?: string;
}

interface BreadcrumbTrailProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function BreadcrumbTrail({
  items,
  showHome = true,
  className,
}: BreadcrumbTrailProps) {
  const allItems = showHome
    ? [{ label: "Home", href: "/" }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center", className)}
    >
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0 && showHome;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-1 text-foreground-muted" />
              )}
              {isLast ? (
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 text-foreground-muted hover:text-nepal-blue transition-colors",
                    isFirst && "text-nepal-blue"
                  )}
                >
                  {isFirst && <Home className="w-4 h-4" />}
                  <span className={cn(isFirst && "sr-only sm:not-sr-only")}>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span className="text-foreground-muted">
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

export default BreadcrumbTrail;
