// ============================================
// FILE: components/shared/PriorityBadge.tsx
// DESCRIPTION: Priority indicator badge
// ============================================

import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

interface PriorityBadgeProps {
  priority: Priority;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string;
    labelNepali: string;
    icon: LucideIcon;
    variant: "priority-high" | "priority-medium" | "priority-low" | "priority-urgent";
  }
> = {
  URGENT: {
    label: "Urgent",
    labelNepali: "अत्यावश्यक",
    icon: AlertTriangle,
    variant: "priority-urgent",
  },
  HIGH: {
    label: "High Priority",
    labelNepali: "उच्च प्राथमिकता",
    icon: AlertTriangle,
    variant: "priority-high",
  },
  MEDIUM: {
    label: "Medium Priority",
    labelNepali: "मध्यम प्राथमिकता",
    icon: AlertCircle,
    variant: "priority-medium",
  },
  LOW: {
    label: "Low Priority",
    labelNepali: "कम प्राथमिकता",
    icon: CheckCircle,
    variant: "priority-low",
  },
};

export function PriorityBadge({
  priority,
  showIcon = true,
  showLabel = true,
  size = "default",
  className,
}: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "gap-1",
        size === "sm" && "text-[10px] px-1.5 py-0",
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      )}
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}

export default PriorityBadge;
