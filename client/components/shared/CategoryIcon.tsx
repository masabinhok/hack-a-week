// ============================================
// FILE: components/shared/CategoryIcon.tsx
// DESCRIPTION: Dynamic icon based on category
// ============================================

import {
  IdCard,
  Plane,
  Car,
  MapPin,
  FileText,
  GraduationCap,
  Heart,
  Building2,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  categorySlug: string;
  size?: "sm" | "default" | "lg" | "xl";
  className?: string;
  showBackground?: boolean;
  color?: string;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  citizenship: IdCard,
  "citizenship-certificate": IdCard,
  passport: Plane,
  "passport-services": Plane,
  "driving-license": Car,
  "vehicle-registration": Car,
  transport: Car,
  "land-registration": MapPin,
  "land-services": MapPin,
  property: MapPin,
  "vital-registration": FileText,
  "birth-registration": FileText,
  "death-registration": FileText,
  marriage: FileText,
  education: GraduationCap,
  scholarship: GraduationCap,
  health: Heart,
  medical: Heart,
  business: Building2,
  "company-registration": Building2,
  taxation: Receipt,
  tax: Receipt,
  social: Users,
  "social-security": Users,
  pension: Users,
};

const CATEGORY_COLORS: Record<string, string> = {
  citizenship: "bg-blue-500",
  "citizenship-certificate": "bg-blue-500",
  passport: "bg-indigo-500",
  "passport-services": "bg-indigo-500",
  "driving-license": "bg-green-500",
  transport: "bg-green-500",
  "land-registration": "bg-amber-500",
  "land-services": "bg-amber-500",
  "vital-registration": "bg-purple-500",
  education: "bg-cyan-500",
  health: "bg-red-500",
  business: "bg-orange-500",
  taxation: "bg-emerald-500",
  social: "bg-pink-500",
};

const SIZE_CLASSES = {
  sm: {
    icon: "w-4 h-4",
    container: "w-8 h-8",
  },
  default: {
    icon: "w-5 h-5",
    container: "w-10 h-10",
  },
  lg: {
    icon: "w-6 h-6",
    container: "w-12 h-12",
  },
  xl: {
    icon: "w-8 h-8",
    container: "w-16 h-16",
  },
};

export function CategoryIcon({
  categorySlug,
  size = "default",
  className,
  showBackground = true,
  color,
}: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[categorySlug] || FileText;
  const bgColor = color || CATEGORY_COLORS[categorySlug] || "bg-gray-500";
  const sizeConfig = SIZE_CLASSES[size];

  if (showBackground) {
    return (
      <div
        className={cn(
          "rounded-xl flex items-center justify-center text-white",
          bgColor,
          sizeConfig.container,
          className
        )}
      >
        <Icon className={sizeConfig.icon} />
      </div>
    );
  }

  return <Icon className={cn(sizeConfig.icon, className)} />;
}

export default CategoryIcon;
