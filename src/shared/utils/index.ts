/**
 * Shared Utility Functions
 * Reusable utility functions used across the application
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Arabic locale
 */
export function formatDateArabic(
  timestamp: number,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(timestamp).toLocaleDateString("ar-IQ", options);
}

/**
 * Format number with Arabic locale
 */
export function formatNumberArabic(value: number): string {
  return new Intl.NumberFormat("ar-IQ").format(value);
}

/**
 * Get role display name in Arabic
 */
export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    super_admin: "مدير افتراضي",
    admin: "مدير",
    user: "مستخدم",
  };
  return roleMap[role] || role;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(role: string): boolean {
  return role === "admin" || role === "super_admin";
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(role: string): boolean {
  return role === "super_admin";
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

