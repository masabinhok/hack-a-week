// ============================================
// FILE: lib/utils.ts
// DESCRIPTION: Utility functions for Setu platform
// ============================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Nepali Rupees
 */
export function formatCurrency(amount: number): string {
  return `रु ${amount.toLocaleString("ne-NP")}`;
}

/**
 * Format a number as NPR (English)
 */
export function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString("en-IN")}`;
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Truncate text to a specific length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Format a date string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date in Nepali format
 */
export function formatDateNepali(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("ne-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
}

/**
 * Parse working hours string
 */
export function parseWorkingHours(hours: string): { open: string; close: string } | null {
  const match = hours.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (match) {
    return { open: match[1], close: match[2] };
  }
  return null;
}

/**
 * Check if an office is currently open
 */
export function isOfficeOpen(workingHours: Array<{ day: string; openTime: string; closeTime: string; isHoliday: boolean }>): boolean {
  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todayHours = workingHours.find((h) => h.day === currentDay);
  if (!todayHours || todayHours.isHoliday) return false;

  const [openHour, openMin] = todayHours.openTime.split(":").map(Number);
  const [closeHour, closeMin] = todayHours.closeTime.split(":").map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Get day name in Nepali
 */
export function getDayNameNepali(day: string): string {
  const days: Record<string, string> = {
    SUNDAY: "आइतबार",
    MONDAY: "सोमबार",
    TUESDAY: "मंगलबार",
    WEDNESDAY: "बुधबार",
    THURSDAY: "बिहिबार",
    FRIDAY: "शुक्रबार",
    SATURDAY: "शनिबार",
  };
  return days[day.toUpperCase()] || day;
}

/**
 * Generate Google Maps URL
 */
export function getGoogleMapsUrl(address: string, lat?: number, lng?: number): string {
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Generate phone call URL
 */
export function getPhoneUrl(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

/**
 * Generate email URL
 */
export function getEmailUrl(email: string, subject?: string): string {
  const base = `mailto:${email}`;
  if (subject) {
    return `${base}?subject=${encodeURIComponent(subject)}`;
  }
  return base;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if running on client side
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get browser locale
 */
export function getBrowserLocale(): string {
  if (!isClient()) return "en";
  return navigator.language.split("-")[0] || "en";
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isClient()) return false;
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Calculate total fees from an array
 */
export function calculateTotalFees(fees: Array<{ feeAmount: number }>): number {
  return fees.reduce((sum, fee) => sum + fee.feeAmount, 0);
}

/**
 * Group items by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort items alphabetically by a key
 */
export function sortAlphabetically<T>(array: T[], key: keyof T): T[] {
  return [...array].sort((a, b) => {
    const aVal = String(a[key]).toLowerCase();
    const bVal = String(b[key]).toLowerCase();
    return aVal.localeCompare(bVal);
  });
}

/**
 * Filter out null and undefined values
 */
export function filterNullish<T>(array: (T | null | undefined)[]): T[] {
  return array.filter((item): item is T => item != null);
}
