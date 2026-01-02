// ============================================
// FILE: components/shared/OfficeTypeBadge.tsx
// DESCRIPTION: Office type indicator badge
// ============================================

import {
  Building,
  Building2,
  Landmark,
  Map,
  Compass,
  Plane,
  Car,
  Banknote,
  Scale,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OfficeType } from "@/lib/types";

interface OfficeTypeBadgeProps {
  type: OfficeType;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const OFFICE_CONFIG: Record<
  OfficeType,
  {
    label: string;
    labelNepali: string;
    icon: LucideIcon;
    className: string;
  }
> = {
  WARD_OFFICE: {
    label: "Ward Office",
    labelNepali: "वडा कार्यालय",
    icon: Building,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  MUNICIPALITY: {
    label: "Municipality",
    labelNepali: "नगरपालिका",
    icon: Building2,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  DISTRICT_ADMIN_OFFICE: {
    label: "District Admin Office",
    labelNepali: "जिल्ला प्रशासन",
    icon: Landmark,
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  LAND_REVENUE: {
    label: "Land Revenue",
    labelNepali: "मालपोत",
    icon: Map,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  SURVEY_OFFICE: {
    label: "Survey Office",
    labelNepali: "नापी",
    icon: Compass,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  PASSPORT_OFFICE: {
    label: "Passport Office",
    labelNepali: "राहदानी",
    icon: Plane,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  TRANSPORT_OFFICE: {
    label: "Transport Office",
    labelNepali: "यातायात",
    icon: Car,
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  BANK: {
    label: "Bank",
    labelNepali: "बैंक",
    icon: Banknote,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  COURT: {
    label: "Court",
    labelNepali: "अदालत",
    icon: Scale,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  POLICE: {
    label: "Police Station",
    labelNepali: "प्रहरी",
    icon: Shield,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  OTHER: {
    label: "Other Office",
    labelNepali: "अन्य",
    icon: Building,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export function OfficeTypeBadge({
  type,
  showIcon = true,
  showLabel = true,
  size = "default",
  className,
}: OfficeTypeBadgeProps) {
  const config = OFFICE_CONFIG[type] || OFFICE_CONFIG.OTHER;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2.5 py-0.5",
        config.className,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      )}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export default OfficeTypeBadge;
