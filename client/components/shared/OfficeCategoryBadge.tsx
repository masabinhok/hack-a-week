// ============================================
// FILE: components/shared/OfficeCategoryBadge.tsx
// DESCRIPTION: Office category indicator badge
// ============================================

import { Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfficeCategoryBadgeProps {
  name: string;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function OfficeCategoryBadge({
  name,
  showIcon = true,
  showLabel = true,
  size = "default",
  className,
}: OfficeCategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2.5 py-0.5",
        "bg-blue-100 text-blue-700 border-blue-200",
        className
      )}
    >
      {showIcon && (
        <Building className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      )}
      {showLabel && <span>{name}</span>}
    </span>
  );
}

export default OfficeCategoryBadge;
