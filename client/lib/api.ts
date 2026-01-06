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
} from "./types";
import type { ErrorResponse } from "./error-types";
import { ErrorCode } from "./error-types";

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

/**
 * Custom API error class that includes bilingual messages
 */
export class ApiError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly statusCode: number;
  public readonly messageNepali?: string;
  public readonly details?: Record<string, any>;

  constructor(
    errorCode: ErrorCode,
    statusCode: number,
    message: string,
    messageNepali?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.messageNepali = messageNepali;
    this.details = details;
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toErrorResponse(): ErrorResponse {
    return {
      success: false,
      message: this.message,
      messageNepali: this.messageNepali,
      errorCode: this.errorCode,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString(),
      details: this.details,
    };
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate = 3600, tags, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  // ...existing code...

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
      // Try to parse error response from backend
      try {
        const errorData: ErrorResponse = await response.json();
        
        // Backend returned structured error
        if (errorData.errorCode && errorData.message) {
          throw new ApiError(
            errorData.errorCode,
            errorData.statusCode,
            errorData.message,
            errorData.messageNepali,
            errorData.details
          );
        }
      } catch (parseError) {
        // If parsing fails or error is not structured, create generic error
        if (parseError instanceof ApiError) {
          throw parseError;
        }
      }

      // Fallback for non-JSON or unexpected errors
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        response.status,
        `API Error: ${response.status} - ${response.statusText}`,
        'एपीआई त्रुटि भयो। कृपया पछि पुन: प्रयास गर्नुहोस्।'
      );
    }

    const json: ApiResponse<T> = await response.json();

    if (!json.success) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST,
        400,
        json.message || "API request failed",
        'अनुरोध असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।'
      );
    }

    return json.data as T;
  } catch (error) {
    // Network errors (fetch failures)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        ErrorCode.NETWORK_ERROR,
        0,
        'Network error. Please check your connection.',
        'नेटवर्क त्रुटि। कृपया आफ्नो जडान जाँच गर्नुहोस्।'
      );
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Log unexpected errors
    console.error(`Failed to fetch ${url}:`, error);
    
    // Wrap unknown errors
    throw new ApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      500,
      error instanceof Error ? error.message : 'An unexpected error occurred',
      'अप्रत्याशित त्रुटि भयो। कृपया पछि पुन: प्रयास गर्नुहोस्।'
    );
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
 * Search offices
 */
export async function searchOffices(
  query: string,
  options?: { categoryId?: string; limit?: number }
): Promise<Office[]> {
  const params = new URLSearchParams({ q: query });
  if (options?.categoryId) params.append("categoryId", options.categoryId);
  if (options?.limit) params.append("limit", options.limit.toString());

  const result = await fetchAPI<OfficesResponse>(`/offices/search?${params}`, {
    revalidate: CACHE_TIMES.SEARCH,
    tags: ["offices-search"],
  });
  return result.offices;
}

/**
 * Office service (claimed) type
 */
interface OfficeClaimedService {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  description?: string;
  priority?: string;
  isOnlineEnabled: boolean;
  categories: { id: string; name: string; slug: string }[];
  customFees?: Record<string, any>;
  customRequirements?: string[];
  notes?: string;
  claimedAt: string;
}

interface OfficeServicesResponse {
  services: OfficeClaimedService[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  office: {
    id: string;
    officeId: string;
    name: string;
    nameNepali?: string;
  };
}

/**
 * Get services claimed/offered by an office
 */
export async function getOfficeServices(
  officeId: string,
  page: number = 1,
  limit: number = 20
): Promise<OfficeServicesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return fetchAPI<OfficeServicesResponse>(`/offices/${officeId}/services?${params}`, {
    revalidate: CACHE_TIMES.OFFICES,
    tags: ["office-services", `office-${officeId}-services`],
  });
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
 * Format time duration for display
 */
export function formatDuration(duration: string): string {
  // Convert ISO duration or time string to readable format
  return duration;
}

// ==================== User API Functions ====================

export interface UserLocations {
  id: string;
  permanentProvinceId?: number;
  permanentDistrictId?: number;
  permanentMunicipalityId?: number;
  permanentWardId?: number;
  convenientProvinceId?: number;
  convenientDistrictId?: number;
  convenientMunicipalityId?: number;
  convenientWardId?: number;
}

export interface UserLocationsWithDetails extends UserLocations {
  permanent: {
    province?: Province;
    district?: District;
    municipality?: Municipality;
    ward?: Ward;
  };
  convenient: {
    province?: Province;
    district?: District;
    municipality?: Municipality;
    ward?: Ward;
  };
}

export interface UpdateUserLocationsDto {
  permanentProvinceId?: number;
  permanentDistrictId?: number;
  permanentMunicipalityId?: number;
  permanentWardId?: number;
  convenientProvinceId?: number;
  convenientDistrictId?: number;
  convenientMunicipalityId?: number;
  convenientWardId?: number;
}

/**
 * Get user locations with full details
 */
export async function getUserLocations(
  userId: string
): Promise<UserLocationsWithDetails> {
  return fetchAPI<UserLocationsWithDetails>(`/users/${userId}/locations`, {
    revalidate: 0, // Don't cache user data
  });
}

/**
 * Update user locations
 */
export async function updateUserLocations(
  userId: string,
  locations: UpdateUserLocationsDto
): Promise<UserLocations> {
  return fetchAPI<UserLocations>(`/users/${userId}/locations`, {
    method: "PUT",
    body: JSON.stringify(locations),
    revalidate: 0,
  });
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
  SearchResult} from "./types";
export type { ErrorResponse } from "./error-types";


