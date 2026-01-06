/**
 * Shared Type Definitions
 * Types used across multiple features in the application
 */

// User Roles
export type UserRole = "user" | "admin" | "super_admin";

// User Status
export type UserStatus = "pending" | "approved" | "rejected";

// Page Navigation Types
export type PageType =
  | "landing"
  | "dashboard"
  | "campaigns"
  | "activities"
  | "centers"
  | "posters"
  | "gallery"
  | "reports"
  | "stats"
  | "weekly"
  | "review"
  | "manager"
  | "users"
  | "daily"
  | "topics";

// Statistics Status
export type StatsStatus = "draft" | "submitted" | "reviewed";

// Health Statistics Data Structure
export interface HealthStatsData {
  individualMeetings: number;
  lectures: number;
  seminars: number;
  healthEvents: number;
}

// Aggregated Statistics Response
export interface AggregatedStatsResponse {
  aggregated: Record<string, HealthStatsData>;
  highlights: {
    totalChildVaccines: number;
    totalMaternalLectures: number;
    overallHealthEvents: number;
  };
  totalReports: number;
  dateRange: {
    start: number;
    end: number;
  };
}

