// ============================================
// FILE: lib/api-wrapper.ts
// DESCRIPTION: Wrapper functions with comprehensive error handling
// ============================================

import { ApiError } from './api';
import * as api from './api';

/**
 * Safe wrapper for API calls that handles errors gracefully
 * Returns [data, error] tuple similar to Go-style error handling
 */
export async function safeApiCall<T>(
  apiFunction: () => Promise<T>
): Promise<[T | null, ApiError | Error | null]> {
  try {
    const data = await apiFunction();
    return [data, null];
  } catch (error) {
    // Ensure we always return a proper error object
    if (error instanceof ApiError || error instanceof Error) {
      return [null, error];
    }
    // Convert unknown errors to Error instances
    return [null, new Error(String(error))];
  }
}

/**
 * Safe service guide fetcher
 */
export async function getSafeServiceGuide(slug: string) {
  return safeApiCall(() => api.getServiceGuide(slug));
}

/**
 * Safe service fetcher
 */
export async function getSafeServiceBySlug(slug: string) {
  return safeApiCall(() => api.getServiceBySlug(slug));
}

/**
 * Safe categories fetcher
 */
export async function getSafeCategories() {
  return safeApiCall(() => api.getCategories());
}

/**
 * Safe offices fetcher
 */
export async function getSafeOffices(filters?: Parameters<typeof api.getOffices>[0]) {
  return safeApiCall(() => api.getOffices(filters));
}

/**
 * Generic safe wrapper for any API function
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<[Awaited<ReturnType<T>> | null, Error | null]> {
  return async (...args: Parameters<T>) => {
    return safeApiCall(() => fn(...args));
  };
}

// Export all original API functions
export * from './api';
