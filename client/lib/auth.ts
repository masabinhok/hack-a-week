// ============================================
// FILE: lib/auth.ts
// DESCRIPTION: Authentication API and utilities for citizen users
// ============================================

import { ApiError } from "./api";

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// ==================== Types ====================

export interface User {
  id: string;
  phoneNumber: string;
  phoneVerified: boolean;
  email: string | null;
  emailVerified: boolean;
  fullName: string | null;
  nationalId: string | null;
  permanentProvinceId: number | null;
  permanentDistrictId: number | null;
  permanentMunicipalityId: number | null;
  permanentWardId: number | null;
  convenientProvinceId: number | null;
  convenientDistrictId: number | null;
  convenientMunicipalityId: number | null;
  convenientWardId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  email: string | null;
  isNewUser?: boolean;
}

export interface SavedService {
  id: string;
  userId: string;
  serviceId: string;
  progress: Record<string, unknown> | null;
  notes: string | null;
  status: "saved" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    serviceId: string;
    name: string;
    slug: string;
    description: string | null;
    priority: string | null;
    isOnlineEnabled: boolean;
  };
}

export interface UserContribution {
  id: string;
  userId: string;
  serviceId: string | null;
  officeId: string | null;
  type: "feedback" | "correction" | "suggestion";
  content: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

// ==================== API Functions ====================

async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Include cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new ApiError(
      responseData.errorCode || "UNKNOWN_ERROR",
      response.status,
      responseData.message || "An error occurred",
      responseData.messageNepali
    );
  }

  // Unwrap the response envelope - API wraps responses in { success, statusCode, message, data }
  return responseData.data as T;
}

// ==================== Auth API ====================

export async function sendOtp(
  phoneNumber: string
): Promise<{ message: string; expiresIn: number }> {
  return authFetch("/users/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phoneNumber }),
  });
}

export async function verifyOtp(
  phoneNumber: string,
  otp: string
): Promise<{ user: AuthUser; message: string }> {
  return authFetch("/users/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phoneNumber, otp }),
  });
}

export async function registerUser(data: {
  phoneNumber: string;
  fullName?: string;
  email?: string;
}): Promise<AuthUser> {
  return authFetch("/users/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshTokens(): Promise<{ message: string }> {
  return authFetch("/users/auth/refresh", {
    method: "POST",
  });
}

export async function logout(): Promise<{ message: string }> {
  return authFetch("/users/auth/logout", {
    method: "POST",
  });
}

// ==================== Profile API ====================

export async function getProfile(): Promise<User> {
  return authFetch("/users/profile");
}

export async function updateProfile(data: {
  fullName?: string;
  email?: string;
  nationalId?: string;
  permanentProvinceId?: number;
  permanentDistrictId?: number;
  permanentMunicipalityId?: number;
  permanentWardId?: number;
  convenientProvinceId?: number;
  convenientDistrictId?: number;
  convenientMunicipalityId?: number;
  convenientWardId?: number;
}): Promise<User> {
  return authFetch("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ==================== Saved Services API ====================

export async function getSavedServices(): Promise<SavedService[]> {
  return authFetch("/users/saved-services");
}

export async function saveService(
  serviceId: string,
  notes?: string
): Promise<SavedService> {
  return authFetch("/users/saved-services", {
    method: "POST",
    body: JSON.stringify({ serviceId, notes }),
  });
}

export async function updateSavedService(
  savedServiceId: string,
  data: {
    notes?: string;
    status?: "saved" | "in-progress" | "completed";
    progress?: Record<string, unknown>;
  }
): Promise<SavedService> {
  return authFetch(`/users/saved-services/${savedServiceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function removeSavedService(
  savedServiceId: string
): Promise<{ message: string }> {
  return authFetch(`/users/saved-services/${savedServiceId}`, {
    method: "DELETE",
  });
}

// ==================== Contributions API ====================

export async function getContributions(): Promise<UserContribution[]> {
  return authFetch("/users/contributions");
}

export async function createContribution(data: {
  serviceId?: string;
  officeId?: string;
  type: "feedback" | "correction" | "suggestion";
  content: string;
}): Promise<UserContribution> {
  return authFetch("/users/contributions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==================== Validation Helpers ====================

export function isValidNepaliPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/^\+977/, "");
  return /^9[78]\d{8}$/.test(cleanPhone);
}

export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/^\+977/, "");
  if (cleanPhone.length === 10) {
    return `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  }
  return phone;
}
