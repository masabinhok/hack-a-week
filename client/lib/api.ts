// ============================================
// FILE: lib/api.ts
// DESCRIPTION: Comprehensive API client for Setu platform
// ============================================

import type {
  ApiResponse,
  Category,
  Service,
  ServiceWithGuide,
  ServiceBreadcrumb,
  Province,
  District,
  Municipality,
  Ward,
  Office,
  OfficeForService,
  SearchResult,
  OfficeType,
} from "./types";

// ==================== Configuration ====================

// Use internal Docker network URL for server-side requests, public URL for client-side
const getApiBaseUrl = () => {
  // Server-side: use internal Docker network or fallback
  if (typeof window === 'undefined') {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  }
  // Client-side: use public URL
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

// Default cache times (in seconds)
const CACHE_TIMES = {
  LOCATIONS: 86400, // 24 hours - locations rarely change
  CATEGORIES: 3600, // 1 hour
  SERVICES: 3600, // 1 hour
  OFFICES: 1800, // 30 minutes
  SEARCH: 0, // No cache for search
} as const;

// ==================== Base Fetch Utility ====================

interface FetchOptions extends RequestInit {
  revalidate?: number;
  tags?: string[];
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate = 3600, tags, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      next: {
        revalidate,
        tags,
      },
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error [${response.status}]: ${errorText}`);
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const json: ApiResponse<T> = await response.json();

    if (!json.success) {
      throw new Error(json.message || "API request failed");
    }

    return json.data as T;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

// ==================== Location API Functions ====================

/**
 * Get all provinces of Nepal
 */
export async function getProvinces(): Promise<Province[]> {
  const result = await fetchAPI<{ provinces: Province[] }>("/locations/provinces", {
    revalidate: CACHE_TIMES.LOCATIONS,
    tags: ["provinces"],
  });
  return result.provinces.map(p => ({
    ...p,
    nameNepali: (p as any).nameNep || p.nameNepali,
  }));
}

/**
 * Get all districts in a province
 */
export async function getDistrictsByProvince(
  provinceId: number
): Promise<District[]> {
  const result = await fetchAPI<{ province: any; districts: District[] }>(`/locations/provinces/${provinceId}/districts`, {
    revalidate: CACHE_TIMES.LOCATIONS,
    tags: ["districts", `province-${provinceId}`],
  });
  return result.districts.map(d => ({
    ...d,
    nameNepali: (d as any).nameNep || d.nameNepali,
  }));
}

/**
 * Get all municipalities in a district
 */
export async function getMunicipalitiesByDistrict(
  districtId: number
): Promise<Municipality[]> {
  const result = await fetchAPI<{ district: any; municipalities: Municipality[] }>(
    `/locations/districts/${districtId}/municipalities`,
    {
      revalidate: CACHE_TIMES.LOCATIONS,
      tags: ["municipalities", `district-${districtId}`],
    }
  );
  return result.municipalities.map(m => ({
    ...m,
    nameNepali: (m as any).nameNep || m.nameNepali,
  }));
}

/**
 * Get all wards in a municipality
 */
export async function getWardsByMunicipality(
  municipalityId: number
): Promise<Ward[]> {
  const result = await fetchAPI<{ municipality: any; wards: Ward[] }>(
    `/locations/municipalities/${municipalityId}/wards`,
    {
      revalidate: CACHE_TIMES.LOCATIONS,
      tags: ["wards", `municipality-${municipalityId}`],
    }
  );
  return result.wards;
}

// ==================== Category API Functions ====================

/**
 * Categories response from API
 */
interface CategoriesResponse {
  categories: Category[];
  total: number;
}

/**
 * Get all service categories
 */
export async function getCategories(): Promise<Category[]> {
  const result = await fetchAPI<CategoriesResponse>("/categories", {
    revalidate: CACHE_TIMES.CATEGORIES,
    tags: ["categories"],
  });
  return result.categories;
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  return fetchAPI<Category>(`/categories/${slug}`, {
    revalidate: CACHE_TIMES.CATEGORIES,
    tags: ["categories", `category-${slug}`],
  });
}

/**
 * Get all services in a category
 */
interface ServicesByCategoryResponse {
  category: { id: string; name: string; slug: string };
  services: Service[];
  total: number;
}

export async function getServicesByCategory(
  categorySlug: string
): Promise<Service[]> {
  const result = await fetchAPI<ServicesByCategoryResponse>(`/categories/${categorySlug}/services`, {
    revalidate: CACHE_TIMES.SERVICES,
    tags: ["services", `category-${categorySlug}`],
  });
  return result.services;
}

// ==================== Service API Functions ====================

/**
 * Root services response from API
 */
interface RootServicesResponse {
  services: Service[];
  total: number;
}

/**
 * Get all root services (level 0)
 */
export async function getRootServices(): Promise<Service[]> {
  const result = await fetchAPI<RootServicesResponse>("/services", {
    revalidate: CACHE_TIMES.SERVICES,
    tags: ["services", "root-services"],
  });
  return result.services;
}

/**
 * Get a service by slug with its children
 */
export async function getServiceBySlug(slug: string): Promise<Service> {
  return fetchAPI<Service>(`/services/${slug}`, {
    revalidate: CACHE_TIMES.SERVICES,
    tags: ["services", `service-${slug}`],
  });
}

/**
 * Get complete step-by-step guide for a leaf service
 */
export async function getServiceGuide(slug: string): Promise<ServiceWithGuide> {
  return fetchAPI<ServiceWithGuide>(`/services/${slug}/guide`, {
    revalidate: CACHE_TIMES.SERVICES,
    tags: ["services", "guides", `guide-${slug}`],
  });
}

/**
 * Get breadcrumb hierarchy for a service
 */
export async function getServiceBreadcrumb(
  slug: string
): Promise<ServiceBreadcrumb[]> {
  const result = await fetchAPI<{ breadcrumb: ServiceBreadcrumb[] }>(`/services/${slug}/breadcrumb`, {
    revalidate: CACHE_TIMES.SERVICES,
    tags: ["services", `breadcrumb-${slug}`],
  });
  return result.breadcrumb;
  }

/**
 * Search services response from API
 */
interface SearchServicesResponse {
  services: Service[];
  total: number;
  query: string;
}

/**
 * Search services by keyword
 */
export async function searchServices(query: string): Promise<Service[]> {
  const encodedQuery = encodeURIComponent(query);
  const result = await fetchAPI<SearchServicesResponse>(`/services/search?q=${encodedQuery}`, {
    revalidate: CACHE_TIMES.SEARCH,
  });
  return result.services;
}

// ==================== Office API Functions ====================

/**
 * Get offices for a service based on location
 */
export async function getOfficesForService(
  serviceSlug: string,
  options?: {
    wardId?: number;
    municipalityId?: number;
    districtId?: number;
  }
): Promise<OfficeForService[]> {
  const params = new URLSearchParams();
  if (options?.wardId) params.append("wardId", options.wardId.toString());
  if (options?.municipalityId)
    params.append("municipalityId", options.municipalityId.toString());
  if (options?.districtId)
    params.append("districtId", options.districtId.toString());

  const queryString = params.toString();
  const endpoint = `/offices/for-service/${serviceSlug}${queryString ? `?${queryString}` : ""}`;

  return fetchAPI<OfficeForService[]>(endpoint, {
    revalidate: CACHE_TIMES.OFFICES,
    tags: ["offices", `offices-${serviceSlug}`],
  });
}

/**
 * Get office by ID
 */
export async function getOfficeById(officeId: string): Promise<Office> {
  return fetchAPI<Office>(`/offices/${officeId}`, {
    revalidate: CACHE_TIMES.OFFICES,
    tags: ["offices", `office-${officeId}`],
  });
}

/**
 * Offices response from API
 */
interface OfficesResponse {
  offices: Office[];
  total: number;
}

/**
 * Get offices by location
 */
export async function getOffices(filters?: {
  provinceId?: number;
  districtId?: number;
  municipalityId?: number;
  wardId?: number;
  locationCode?: string;
}): Promise<Office[]> {
  const params = new URLSearchParams();
  if (filters?.provinceId)
    params.append("provinceId", filters.provinceId.toString());
  if (filters?.districtId)
    params.append("districtId", filters.districtId.toString());
  if (filters?.municipalityId)
    params.append("municipalityId", filters.municipalityId.toString());
  if (filters?.wardId) params.append("wardId", filters.wardId.toString());
  if (filters?.locationCode) params.append("locationCode", filters.locationCode);

  const queryString = params.toString();
  
  // If no filters, return empty array (API requires at least one location param)
  if (!queryString) {
    return [];
  }
  
  const endpoint = `/offices/by-location?${queryString}`;

  const result = await fetchAPI<OfficesResponse>(endpoint, {
    revalidate: CACHE_TIMES.OFFICES,
    tags: ["offices"],
  });
  return result.offices;
}

/**
 * Get office types
 */
export async function getOfficeTypes(): Promise<{ type: string; count: number }[]> {
  const result = await fetchAPI<{ types: { type: string; count: number }[] }>("/offices/types", {
    revalidate: CACHE_TIMES.OFFICES,
    tags: ["office-types"],
  });
  return result.types;
}

/**
 * Search offices
 */
export async function searchOffices(
  query: string,
  options?: { type?: string; limit?: number }
): Promise<Office[]> {
  const params = new URLSearchParams({ q: query });
  if (options?.type) params.append("type", options.type);
  if (options?.limit) params.append("limit", options.limit.toString());

  const result = await fetchAPI<OfficesResponse>(`/offices/search?${params}`, {
    revalidate: CACHE_TIMES.SEARCH,
    tags: ["offices-search"],
  });
  return result.offices;
}

// ==================== Search API Functions ====================

/**
 * Global search across services, categories, and offices
 */
export async function globalSearch(query: string): Promise<SearchResult> {
  // Parallel search across different endpoints
  const [services] = await Promise.all([
    searchServices(query).catch(() => [] as Service[]),
  ]);

  return {
    services,
    categories: [],
    offices: [],
  };
}

// ==================== Utility Functions ====================

/**
 * Format Nepali currency
 */
export function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

/**
 * Get priority color class
 */
export function getPriorityColor(
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW"
): string {
  const colors = {
    URGENT: "bg-purple-100 text-purple-800 border-purple-200",
    HIGH: "bg-red-100 text-red-700 border-red-200",
    MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
    LOW: "bg-green-100 text-green-700 border-green-200",
  };
  return colors[priority] || colors.LOW;
}

/**
 * Get office type display name
 */
export function getOfficeTypeName(type: OfficeType): string {
  const names: Record<OfficeType, string> = {
    // District Level
    DISTRICT_ADMINISTRATION_OFFICE: "District Administration Office (DAO)",
    LAND_REVENUE_OFFICE: "Land Revenue Office",
    DISTRICT_EDUCATION_OFFICE: "District Education Office",
    // Transport
    TRANSPORT_MANAGEMENT_OFFICE: "Transport Management Office",
    DRIVING_LICENSE_OFFICE: "Driving License Office",
    // Local Government
    MUNICIPALITY_OFFICE: "Municipality Office",
    RURAL_MUNICIPALITY_OFFICE: "Rural Municipality Office",
    // Ward Level
    WARD_OFFICE: "Ward Office",
    // Travel & Immigration
    PASSPORT_OFFICE: "Passport Office",
    IMMIGRATION_OFFICE: "Immigration Office",
    // Business Registration
    OFFICE_OF_COMPANY_REGISTRAR: "Office of Company Registrar (OCR)",
    COTTAGE_SMALL_INDUSTRY_OFFICE: "Cottage & Small Industry Office",
    INLAND_REVENUE_OFFICE: "Inland Revenue Office",
    // Social Services
    LABOUR_OFFICE: "Labour Office",
  };
  return names[type] || type;
}

/**
 * Get office type display name in Nepali
 */
export function getOfficeTypeNameNepali(type: OfficeType): string {
  const names: Record<OfficeType, string> = {
    // District Level
    DISTRICT_ADMINISTRATION_OFFICE: "जिल्ला प्रशासन कार्यालय",
    LAND_REVENUE_OFFICE: "मालपोत कार्यालय",
    DISTRICT_EDUCATION_OFFICE: "जिल्ला शिक्षा कार्यालय",
    // Transport
    TRANSPORT_MANAGEMENT_OFFICE: "यातायात व्यवस्थापन कार्यालय",
    DRIVING_LICENSE_OFFICE: "सवारी चालक अनुमतिपत्र कार्यालय",
    // Local Government
    MUNICIPALITY_OFFICE: "नगरपालिका कार्यालय",
    RURAL_MUNICIPALITY_OFFICE: "गाउँपालिका कार्यालय",
    // Ward Level
    WARD_OFFICE: "वडा कार्यालय",
    // Travel & Immigration
    PASSPORT_OFFICE: "राहदानी कार्यालय",
    IMMIGRATION_OFFICE: "अध्यागमन कार्यालय",
    // Business Registration
    OFFICE_OF_COMPANY_REGISTRAR: "कम्पनी रजिस्ट्रारको कार्यालय",
    COTTAGE_SMALL_INDUSTRY_OFFICE: "घरेलु तथा साना उद्योग कार्यालय",
    INLAND_REVENUE_OFFICE: "आन्तरिक राजस्व कार्यालय",
    // Social Services
    LABOUR_OFFICE: "श्रम कार्यालय",
  };
  return names[type] || type;
}

/**
 * Format time duration for display
 */
export function formatDuration(duration: string): string {
  // Convert ISO duration or time string to readable format
  return duration;
}

// ==================== Re-export types ====================

export type {
  ApiResponse,
  Category,
  Service,
  ServiceWithGuide,
  ServiceBreadcrumb,
  Province,
  District,
  Municipality,
  Ward,
  Office,
  OfficeForService,
  SearchResult,
  OfficeType,
} from "./types";
