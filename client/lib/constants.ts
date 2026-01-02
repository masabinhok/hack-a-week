// ============================================
// FILE: lib/constants.ts
// DESCRIPTION: Constants and configuration for Setu platform
// ============================================

// ==================== Site Configuration ====================

export const SITE_CONFIG = {
  name: "Setu",
  nameNepali: "सेतु",
  tagline: "Nepal's Government Services Guide",
  taglineNepali: "नेपालको सरकारी सेवा मार्गदर्शक",
  description:
    "Navigate Nepal's government services with ease. Find offices, understand procedures, and complete your tasks efficiently.",
  descriptionNepali:
    "नेपालको सरकारी सेवाहरू सजिलै पहुँच गर्नुहोस्। कार्यालयहरू खोज्नुहोस्, प्रक्रियाहरू बुझ्नुहोस्, र आफ्ना कार्यहरू प्रभावकारी रूपमा सम्पन्न गर्नुहोस्।",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://setu.gov.np",
  locale: "en_NP",
  twitterHandle: "@setunepal",
} as const;

// ==================== Navigation ====================

export const NAV_ITEMS = [
  { label: "Home", labelNepali: "गृहपृष्ठ", href: "/" },
  { label: "Services", labelNepali: "सेवाहरू", href: "/services" },
  { label: "Categories", labelNepali: "वर्गहरू", href: "/categories" },
  { label: "Offices", labelNepali: "कार्यालयहरू", href: "/offices" },
  { label: "About", labelNepali: "हाम्रोबारे", href: "/about" },
] as const;

export const FOOTER_LINKS = {
  services: [
    { label: "All Services", href: "/services" },
    { label: "Citizenship", href: "/services/citizenship" },
    { label: "Passport", href: "/services/passport" },
    { label: "Driving License", href: "/services/driving-license" },
    { label: "Land Registration", href: "/services/land-registration" },
  ],
  resources: [
    { label: "Find Offices", href: "/offices" },
    { label: "FAQ", href: "/faq" },
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
} as const;

// ==================== Colors ====================

export const COLORS = {
  // Nepal National Colors
  nepalCrimson: "#DC143C",
  nepalCrimsonDark: "#B91030",
  nepalCrimsonLight: "#E84368",
  nepalBlue: "#003893",
  nepalBlueDark: "#002D75",
  nepalBlueLight: "#1A4FA8",

  // Status Colors
  success: "#059669",
  warning: "#D97706",
  error: "#DC2626",
  info: "#0284C7",

  // Priority Colors
  priorityHigh: "#DC2626",
  priorityMedium: "#D97706",
  priorityLow: "#059669",
} as const;

// ==================== Category Icons ====================

export const CATEGORY_ICONS: Record<string, string> = {
  citizenship: "IdCard",
  passport: "Plane",
  "driving-license": "Car",
  "land-registration": "MapPin",
  "vital-registration": "FileText",
  education: "GraduationCap",
  health: "Heart",
  business: "Building2",
  taxation: "Receipt",
  social: "Users",
  default: "FileText",
};

// ==================== Category Colors ====================

export const CATEGORY_COLORS: Record<string, string> = {
  citizenship: "bg-blue-500",
  passport: "bg-indigo-500",
  "driving-license": "bg-green-500",
  "land-registration": "bg-amber-500",
  "vital-registration": "bg-purple-500",
  education: "bg-cyan-500",
  health: "bg-red-500",
  business: "bg-orange-500",
  taxation: "bg-emerald-500",
  social: "bg-pink-500",
  default: "bg-gray-500",
};

// ==================== Office Types ====================

export const OFFICE_TYPES = {
  WARD_OFFICE: {
    label: "Ward Office",
    labelNepali: "वडा कार्यालय",
    icon: "Building",
    color: "bg-blue-100 text-blue-700",
  },
  MUNICIPALITY: {
    label: "Municipality Office",
    labelNepali: "नगरपालिका कार्यालय",
    icon: "Building2",
    color: "bg-purple-100 text-purple-700",
  },
  DISTRICT_ADMIN_OFFICE: {
    label: "District Administration Office",
    labelNepali: "जिल्ला प्रशासन कार्यालय",
    icon: "Landmark",
    color: "bg-indigo-100 text-indigo-700",
  },
  LAND_REVENUE: {
    label: "Land Revenue Office",
    labelNepali: "मालपोत कार्यालय",
    icon: "Map",
    color: "bg-amber-100 text-amber-700",
  },
  SURVEY_OFFICE: {
    label: "Survey Office",
    labelNepali: "नापी कार्यालय",
    icon: "Compass",
    color: "bg-green-100 text-green-700",
  },
  PASSPORT_OFFICE: {
    label: "Passport Office",
    labelNepali: "राहदानी कार्यालय",
    icon: "Plane",
    color: "bg-red-100 text-red-700",
  },
  TRANSPORT_OFFICE: {
    label: "Transport Office",
    labelNepali: "यातायात कार्यालय",
    icon: "Car",
    color: "bg-cyan-100 text-cyan-700",
  },
  BANK: {
    label: "Bank",
    labelNepali: "बैंक",
    icon: "DollarSign",
    color: "bg-emerald-100 text-emerald-700",
  },
  COURT: {
    label: "Court",
    labelNepali: "अदालत",
    icon: "Scale",
    color: "bg-gray-100 text-gray-700",
  },
  POLICE: {
    label: "Police Station",
    labelNepali: "प्रहरी कार्यालय",
    icon: "Shield",
    color: "bg-slate-100 text-slate-700",
  },
  OTHER: {
    label: "Other Office",
    labelNepali: "अन्य कार्यालय",
    icon: "Building",
    color: "bg-gray-100 text-gray-700",
  },
} as const;

// ==================== Document Types ====================

export const DOCUMENT_TYPES = {
  ORIGINAL: { label: "Original", labelNepali: "मूल" },
  PHOTOCOPY: { label: "Photocopy", labelNepali: "फोटोकपी" },
  CERTIFIED_COPY: { label: "Certified Copy", labelNepali: "प्रमाणित प्रतिलिपि" },
  SELF_ATTESTED: { label: "Self Attested", labelNepali: "स्व-प्रमाणित" },
  NOTARIZED: { label: "Notarized", labelNepali: "नोटरी गरिएको" },
  PHOTO: { label: "Photograph", labelNepali: "फोटो" },
  FORM: { label: "Form", labelNepali: "फारम" },
  OTHER: { label: "Other", labelNepali: "अन्य" },
} as const;

// ==================== Fee Types ====================

export const FEE_TYPES = {
  APPLICATION: { label: "Application Fee", labelNepali: "आवेदन शुल्क" },
  PROCESSING: { label: "Processing Fee", labelNepali: "प्रशोधन शुल्क" },
  STAMP: { label: "Stamp Fee", labelNepali: "टिकट शुल्क" },
  SERVICE_CHARGE: { label: "Service Charge", labelNepali: "सेवा शुल्क" },
  PENALTY: { label: "Penalty", labelNepali: "जरिवाना" },
  TAX: { label: "Tax", labelNepali: "कर" },
  OTHER: { label: "Other", labelNepali: "अन्य" },
} as const;

// ==================== Priority Levels ====================

export const PRIORITY_LEVELS = {
  HIGH: {
    label: "High Priority",
    labelNepali: "उच्च प्राथमिकता",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "AlertTriangle",
  },
  MEDIUM: {
    label: "Medium Priority",
    labelNepali: "मध्यम प्राथमिकता",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "AlertCircle",
  },
  LOW: {
    label: "Low Priority",
    labelNepali: "कम प्राथमिकता",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: "CheckCircle",
  },
} as const;

// ==================== Days of Week ====================

export const DAYS_OF_WEEK = [
  { key: "SUNDAY", label: "Sunday", labelNepali: "आइतबार" },
  { key: "MONDAY", label: "Monday", labelNepali: "सोमबार" },
  { key: "TUESDAY", label: "Tuesday", labelNepali: "मंगलबार" },
  { key: "WEDNESDAY", label: "Wednesday", labelNepali: "बुधबार" },
  { key: "THURSDAY", label: "Thursday", labelNepali: "बिहिबार" },
  { key: "FRIDAY", label: "Friday", labelNepali: "शुक्रबार" },
  { key: "SATURDAY", label: "Saturday", labelNepali: "शनिबार" },
] as const;

// ==================== Statistics ====================

export const PLATFORM_STATS = [
  { label: "Services", value: "100+", icon: "FileText" },
  { label: "Ward Offices", value: "6,743", icon: "Building" },
  { label: "Districts", value: "77", icon: "Map" },
  { label: "Updated", value: "2026", icon: "Calendar" },
] as const;

// ==================== How It Works Steps ====================

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Choose Your Service",
    titleNepali: "आफ्नो सेवा छान्नुहोस्",
    description:
      "Browse through categories or search for the specific government service you need.",
    descriptionNepali:
      "वर्गहरू मार्फत हेर्नुहोस् वा तपाईंलाई चाहिने विशेष सरकारी सेवा खोज्नुहोस्।",
    icon: "Search",
  },
  {
    title: "Find Your Office",
    titleNepali: "आफ्नो कार्यालय खोज्नुहोस्",
    description:
      "Locate the nearest government office based on your ward, municipality, or district.",
    descriptionNepali:
      "आफ्नो वडा, नगरपालिका, वा जिल्लाको आधारमा नजिकको सरकारी कार्यालय पत्ता लगाउनुहोस्।",
    icon: "MapPin",
  },
  {
    title: "Follow the Guide",
    titleNepali: "गाइड पालना गर्नुहोस्",
    description:
      "Get step-by-step instructions, required documents, fees, and timelines for your service.",
    descriptionNepali:
      "तपाईंको सेवाको लागि चरण-दर-चरण निर्देशनहरू, आवश्यक कागजातहरू, शुल्कहरू, र समयरेखाहरू प्राप्त गर्नुहोस्।",
    icon: "CheckSquare",
  },
] as const;

// ==================== SEO Defaults ====================

export const SEO_DEFAULTS = {
  titleTemplate: "%s | Setu - Nepal Government Services",
  defaultTitle: "Setu - Nepal's Government Services Guide",
  description:
    "Navigate Nepal's government services with ease. Find offices, understand procedures, required documents, fees, and timelines for citizenship, passport, licenses, and more.",
  keywords: [
    "nepal",
    "government services",
    "citizenship",
    "passport",
    "driving license",
    "land registration",
    "sarkari seva",
    "government office",
    "nepal government",
  ],
  openGraph: {
    type: "website",
    locale: "en_NP",
    siteName: "Setu",
  },
} as const;

// ==================== Breakpoints ====================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// ==================== Animation Variants ====================

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
} as const;
