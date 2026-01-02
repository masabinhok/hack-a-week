// ============================================
// FILE: components/ui/badge.tsx
// DESCRIPTION: Badge component with variants
// ============================================

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-nepal-blue focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-nepal-blue text-white",
        secondary:
          "border-transparent bg-background-secondary text-foreground-secondary",
        destructive:
          "border-transparent bg-error text-white",
        success:
          "border-transparent bg-success text-white",
        warning:
          "border-transparent bg-warning text-white",
        info:
          "border-transparent bg-info text-white",
        outline:
          "border-border text-foreground",
        // Priority variants
        "priority-urgent":
          "border-purple-200 bg-purple-100 text-purple-800",
        "priority-high":
          "border-red-200 bg-red-100 text-red-700",
        "priority-medium":
          "border-amber-200 bg-amber-100 text-amber-700",
        "priority-low":
          "border-green-200 bg-green-100 text-green-700",
        // Office type variants
        "office-ward":
          "border-blue-200 bg-blue-100 text-blue-700",
        "office-municipality":
          "border-purple-200 bg-purple-100 text-purple-700",
        "office-district":
          "border-indigo-200 bg-indigo-100 text-indigo-700",
        // Status variants
        "status-active":
          "border-green-200 bg-green-100 text-green-700",
        "status-inactive":
          "border-gray-200 bg-gray-100 text-gray-600",
        "status-online":
          "border-emerald-200 bg-emerald-100 text-emerald-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
