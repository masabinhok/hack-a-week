// ============================================
// FILE: components/shared/OfficeTypeBadge.tsx
// DESCRIPTION: Office type indicator badge
// ============================================

import {
  Building,
  Building2,
  Landmark,
  Map,
  Plane,
  Car,
  Banknote,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OfficeType } from "@/lib/types";

interface OfficeTypeBadgeProps {
  type: OfficeType;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const OFFICE_CONFIG: Partial<
  Record<
    OfficeType,
    {
      label: string;
      labelNepali: string;
      icon: LucideIcon;
      className: string;
    }
  >
> = {
  WARD_OFFICE: {
    label: "Ward Office",
    labelNepali: "वडा कार्यालय",
    icon: Building,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  MUNICIPALITY_OFFICE: {
    label: "Municipality",
    labelNepali: "नगरपालिका",
    icon: Building2,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  RURAL_MUNICIPALITY_OFFICE: {
    label: "Rural Municipality",
    labelNepali: "गाउँपालिका",
    icon: Building2,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  DISTRICT_ADMINISTRATION_OFFICE: {
    label: "District Admin Office",
    labelNepali: "जिल्ला प्रशासन",
    icon: Landmark,
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  LAND_REVENUE_OFFICE: {
    label: "Land Revenue",
    labelNepali: "मालपोत",
    icon: Map,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  DISTRICT_EDUCATION_OFFICE: {
    label: "Education Office",
    labelNepali: "शिक्षा",
    icon: Building,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  PASSPORT_OFFICE: {
    label: "Passport Office",
    labelNepali: "राहदानी",
    icon: Plane,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  IMMIGRATION_OFFICE: {
    label: "Immigration Office",
    labelNepali: "अध्यागमन",
    icon: Plane,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  TRANSPORT_MANAGEMENT_OFFICE: {
    label: "Transport Office",
    labelNepali: "यातायात",
    icon: Car,
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  DRIVING_LICENSE_OFFICE: {
    label: "License Office",
    labelNepali: "सवारी चालक",
    icon: Car,
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  OFFICE_OF_COMPANY_REGISTRAR: {
    label: "Company Registrar",
    labelNepali: "कम्पनी रजिष्ट्रार",
    icon: Building2,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  COTTAGE_SMALL_INDUSTRY_OFFICE: {
    label: "Industry Office",
    labelNepali: "उद्योग",
    icon: Building2,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  INLAND_REVENUE_OFFICE: {
    label: "Revenue Office",
    labelNepali: "राजस्व",
    icon: Banknote,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  LABOUR_OFFICE: {
    label: "Labour Office",
    labelNepali: "श्रम",
    icon: Building,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  NATIONAL_ID_CENTER: {
    label: "National ID Center",
    labelNepali: "राष्ट्रिय परिचयपत्र",
    icon: Landmark,
    className: "bg-teal-100 text-teal-700 border-teal-200",
  },
};

const DEFAULT_OFFICE_CONFIG = {
  label: "Office",
  labelNepali: "कार्यालय",
  icon: Building,
  className: "bg-gray-100 text-gray-600 border-gray-200",
};

export function OfficeTypeBadge({
  type,
  showIcon = true,
  showLabel = true,
  size = "default",
  className,
}: OfficeTypeBadgeProps) {
  const config = OFFICE_CONFIG[type] || DEFAULT_OFFICE_CONFIG;
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
