import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // جدول المراكز الصحية
  healthCenters: defineTable({
    name: v.string(),
    location: v.string(),
    phone: v.string(),
    managerId: v.optional(v.id("users")),
    isActive: v.boolean(),
  }).index("by_manager", ["managerId"]),

  // جدول الحملات الصحية
  campaigns: defineTable({
    title: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    healthCenterId: v.id("healthCenters"),
    targetAudience: v.string(),
    status: v.string(), // "planned", "active", "completed"
    createdBy: v.id("users"),
  })
    .index("by_health_center", ["healthCenterId"])
    .index("by_status", ["status"])
    .index("by_creator", ["createdBy"]),

  // جدول الأنشطة (Activities)
  activities: defineTable({
    campaignId: v.id("campaigns"),
    activityType: v.string(), // "awareness_session", "health_screening", "vaccination", "other"
    date: v.number(),
    location: v.string(),
    attendees: v.number(),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_date", ["date"]),

  // جدول البوسترات المولدة
  posters: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    prompt: v.string(),
    campaignId: v.optional(v.id("campaigns")),
    createdBy: v.id("users"),
    rating: v.optional(v.number()), // Average rating (0-5)
    ratingCount: v.optional(v.number()), // Number of ratings
    isPinned: v.optional(v.boolean()), // Featured poster
    views: v.optional(v.number()), // View count
  })
    .index("by_campaign", ["campaignId"])
    .index("by_creator", ["createdBy"])
    .index("by_rating", ["rating"])
    .index("by_pinned", ["isPinned"]),

  // جدول تقييمات البوسترات
  posterRatings: defineTable({
    posterId: v.id("posters"),
    userId: v.id("users"),
    rating: v.number(), // 1-5 stars
  })
    .index("by_poster", ["posterId"])
    .index("by_user_and_poster", ["userId", "posterId"]),

  // جدول التقارير
  reports: defineTable({
    title: v.string(),
    reportType: v.string(), // "monthly", "quarterly", "annual", "campaign"
    period: v.string(),
    data: v.string(), // JSON string
    healthCenterId: v.optional(v.id("healthCenters")),
    campaignId: v.optional(v.id("campaigns")),
    generatedBy: v.id("users"),
  })
    .index("by_health_center", ["healthCenterId"])
    .index("by_type", ["reportType"]),

  // جدول الإشعارات
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(), // "info", "warning", "success", "error"
    isRead: v.boolean(),
    link: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // جدول الإحصائيات الشهرية
  monthlyStats: defineTable({
    month: v.number(),
    year: v.number(),
    healthCenterId: v.id("healthCenters"),
    data: v.string(),
    createdBy: v.id("users"),
    status: v.string(),
    submittedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),
  })
    .index("by_health_center", ["healthCenterId"])
    .index("by_month_year", ["month", "year"])
    .index("by_center_and_date", ["healthCenterId", "year", "month"])
    .index("by_status", ["status"]),

  // جدول الإحصائيات الأسبوعية
  weeklyStats: defineTable({
    week: v.number(),
    year: v.number(),
    healthCenterId: v.id("healthCenters"),
    data: v.string(),
    createdBy: v.id("users"),
    status: v.string(),
    submittedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),
  })
    .index("by_health_center", ["healthCenterId"])
    .index("by_week_year", ["week", "year"])
    .index("by_center_and_date", ["healthCenterId", "year", "week"])
    .index("by_status", ["status"]),

  // جدول ملفات المستخدمين (User Profiles)
  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.string(), // "super_admin", "admin", "user"
    healthCenterName: v.string(),
    phone: v.optional(v.string()),
    status: v.string(), // "pending", "approved", "rejected"
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_role", ["role"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
