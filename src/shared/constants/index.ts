/**
 * Application Constants
 * Centralized constants used across the application
 */

// Application Info
export const APP_NAME = "نظام إدارة الحملات الصحية";
export const APP_ORGANIZATION = "دائرة صحة كركوك - قطاع كركوك الأول";
export const APP_DEVELOPER = "م. صيدلي علاء صالح احمد";

// Logo URLs
export const LOGO_URL = "/kirkuk-logo.png";
export const LOGO_FALLBACK_URL =
  "https://polished-pony-114.convex.cloud/api/storage/b69b6463-3c48-4960-9c5b-e58e96902f2e";

// User Roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

// User Status
export const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// Statistics Status
export const STATS_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  REVIEWED: "reviewed",
} as const;

// Navigation Items
export const NAVIGATION_ITEMS = {
  LANDING: "landing",
  DASHBOARD: "dashboard",
  CAMPAIGNS: "campaigns",
  ACTIVITIES: "activities",
  CENTERS: "centers",
  POSTERS: "posters",
  GALLERY: "gallery",
  DAILY_STATS: "daily",
  WEEKLY_STATS: "weekly",
  MONTHLY_STATS: "stats",
  REVIEW: "review",
  MANAGER: "manager",
  USERS: "users",
  TOPICS: "topics",
  REPORTS: "reports",
} as const;

// Date Formats
export const DATE_FORMATS = {
  AR_SA: "ar-SA",
  AR_IQ: "ar-IQ",
} as const;

// Excel Export
export const EXCEL_EXPORT = {
  HEADERS: [
    "الموضوع",
    "اللقاءات الفردية",
    "المحاضرات",
    "الندوات",
    "المناسبات الصحية",
  ],
  COLUMN_WIDTHS: {
    TOPIC: 45,
    INDIVIDUAL_MEETINGS: 18,
    LECTURES: 15,
    SEMINARS: 15,
    HEALTH_EVENTS: 18,
  },
} as const;

