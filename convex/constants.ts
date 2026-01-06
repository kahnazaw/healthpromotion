/**
 * Convex Backend Constants
 * Constants used in Convex functions (queries, mutations, actions)
 */

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

// Date Constants
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
export const MILLISECONDS_PER_WEEK = 7 * MILLISECONDS_PER_DAY;
export const MILLISECONDS_PER_MONTH = 30 * MILLISECONDS_PER_DAY;

// Validation Limits
export const VALIDATION_LIMITS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MAX_NOTES_LENGTH: 1000,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

