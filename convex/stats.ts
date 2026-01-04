import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// تعريف بنية العنصر الفرعي (اللقاءات، المحاضرات، إلخ)
const subItemValidator = v.object({
  individualMeetings: v.number(),
  lectures: v.number(),
  seminars: v.number(),
  healthEvents: v.number(),
});

// Helper function to validate that all fields in a sub-item are numbers
function validateSubItem(item: any): boolean {
  return (
    typeof item.individualMeetings === "number" &&
    typeof item.lectures === "number" &&
    typeof item.seminars === "number" &&
    typeof item.healthEvents === "number"
  );
}

// Helper function to validate the data record (topicId -> subItem)
function validateStatsData(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  
  // data should be a record/object where keys are topicIds and values are subItems
  for (const topicId in data) {
    if (!validateSubItem(data[topicId])) {
      return false;
    }
  }
  return true;
}

// Get daily reports - filtered by user role
export const getDailyReports = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // Get user profile
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      throw new ConvexError("ملف المستخدم غير موجود");
    }

    // Check if user is admin or super_admin
    const isAdmin = userProfile.role === "admin" || userProfile.role === "super_admin";

    if (isAdmin) {
      // Admin can see all reports from all centers
      const allReports = await ctx.db.query("dailyHealthStats").collect();
      
      // Enrich reports with center and user information
      const enrichedReports = await Promise.all(
        allReports.map(async (report) => {
          const center = await ctx.db.get(report.healthCenterId);
          const creator = await ctx.db.get(report.createdBy);
          const reviewer = report.review?.reviewedBy
            ? await ctx.db.get(report.review.reviewedBy)
            : null;

          return {
            ...report,
            centerName: center?.name || "غير معروف",
            creatorName: creator?.name || "غير معروف",
            reviewerName: reviewer?.name || null,
          };
        })
      );

      return enrichedReports;
    } else {
      // Regular user (Health Center) - only see reports from their center
      // Find health center by name
      const healthCenter = await ctx.db
        .query("healthCenters")
        .filter((q) => q.eq(q.field("name"), userProfile.healthCenterName))
        .first();

      if (!healthCenter) {
        return []; // No center found, return empty array
      }

      // Get reports for this center only
      const centerReports = await ctx.db
        .query("dailyHealthStats")
        .withIndex("by_health_center", (q) => q.eq("healthCenterId", healthCenter._id))
        .collect();

      // Enrich reports with user information
      const enrichedReports = await Promise.all(
        centerReports.map(async (report) => {
          const creator = await ctx.db.get(report.createdBy);
          const reviewer = report.review?.reviewedBy
            ? await ctx.db.get(report.review.reviewedBy)
            : null;

          return {
            ...report,
            centerName: healthCenter.name,
            creatorName: creator?.name || "غير معروف",
            reviewerName: reviewer?.name || null,
          };
        })
      );

      return enrichedReports;
    }
  },
});

// Helper function to sum two sub-items
function sumSubItems(item1: any, item2: any) {
  return {
    individualMeetings: (item1?.individualMeetings || 0) + (item2?.individualMeetings || 0),
    lectures: (item1?.lectures || 0) + (item2?.lectures || 0),
    seminars: (item1?.seminars || 0) + (item2?.seminars || 0),
    healthEvents: (item1?.healthEvents || 0) + (item2?.healthEvents || 0),
  };
}

// Helper function to sum two data records (topicId -> subItem)
function sumStatsData(data1: any, data2: any): any {
  const result: any = {};
  
  // جمع جميع المواضيع من data1
  for (const topicId in data1) {
    result[topicId] = { ...data1[topicId] };
  }
  
  // جمع المواضيع من data2
  for (const topicId in data2) {
    if (result[topicId]) {
      // إذا كان الموضوع موجود في data1، قم بجمع القيم
      result[topicId] = sumSubItems(result[topicId], data2[topicId]);
    } else {
      // إذا لم يكن موجود، أضفه كما هو
      result[topicId] = { ...data2[topicId] };
    }
  }
  
  return result;
}

// Get consolidated monthly report - aggregates all submitted reports for a month
export const getConsolidatedMonthlyReport = query({
  args: {
    month: v.number(), // 1-12
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // Get user profile to check permissions
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      throw new ConvexError("ملف المستخدم غير موجود");
    }

    // Only admins can view consolidated reports
    const isAdmin = userProfile.role === "admin" || userProfile.role === "super_admin";
    if (!isAdmin) {
      throw new ConvexError("ليس لديك صلاحية لعرض التقارير المجمعة");
    }

    // Calculate date range for the month
    const startDate = new Date(args.year, args.month - 1, 1).setHours(0, 0, 0, 0);
    const endDate = new Date(args.year, args.month, 0).setHours(23, 59, 59, 999);

    // Get all submitted reports for the month
    const allReports = await ctx.db
      .query("dailyHealthStats")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .collect();

    // Filter reports by date range
    const monthlyReports = allReports.filter(
      (report) => report.submissionDate >= startDate && report.submissionDate <= endDate
    );

    if (monthlyReports.length === 0) {
      return {
        month: args.month,
        year: args.year,
        totalCenters: 0,
        totalReports: 0,
        consolidated: null,
      };
    }

    // Aggregate all reports
    let consolidated: any = {};

    for (const report of monthlyReports) {
      if (report.data) {
        consolidated = sumStatsData(consolidated, report.data);
      }
    }

    // Get unique centers count
    const uniqueCenters = new Set(monthlyReports.map((r) => r.healthCenterId.toString()));

    return {
      month: args.month,
      year: args.year,
      totalCenters: uniqueCenters.size,
      totalReports: monthlyReports.length,
      consolidated: Object.keys(consolidated).length > 0 ? consolidated : null,
    };
  },
});

// Submit daily report with validation - using dynamic structure
export const submitDailyReport = mutation({
  args: {
    healthCenterId: v.id("healthCenters"),
    submissionDate: v.number(),
    status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("reviewed")),
    // البيانات الديناميكية: record من topicId (string) إلى القيم الأربعة
    data: v.record(v.string(), subItemValidator),
    review: v.optional(v.object({
      reviewedBy: v.id("users"),
      reviewedAt: v.number(),
      reviewNotes: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // Validate that all fields are numbers
    if (!validateStatsData(args.data)) {
      throw new ConvexError("جميع الحقول يجب أن تكون أرقام صحيحة");
    }

    // Check if a report already exists for this center and date
    const existingReport = await ctx.db
      .query("dailyHealthStats")
      .withIndex("by_center_and_date", (q) =>
        q.eq("healthCenterId", args.healthCenterId).eq("submissionDate", args.submissionDate)
      )
      .first();

    if (existingReport) {
      // Update existing report
      await ctx.db.patch(existingReport._id, {
        status: args.status,
        data: args.data,
        review: args.review,
        submittedAt: args.status === "submitted" ? Date.now() : existingReport.submittedAt,
      });

      return existingReport._id;
    } else {
      // Create new report
      const reportId = await ctx.db.insert("dailyHealthStats", {
        healthCenterId: args.healthCenterId,
        submissionDate: args.submissionDate,
        createdBy: userId,
        status: args.status,
        submittedAt: args.status === "submitted" ? Date.now() : undefined,
        data: args.data,
        review: args.review,
      });

      return reportId;
    }
  },
});

// Get aggregated stats for a specific date or month
export const getAggregatedStats = query({
  args: {
    date: v.optional(v.number()), // Timestamp for specific date
    month: v.optional(v.number()), // 1-12
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // Get user profile to check permissions
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      throw new ConvexError("ملف المستخدم غير موجود");
    }

    // Only admins can view aggregated stats
    const isAdmin = userProfile.role === "admin" || userProfile.role === "super_admin";
    if (!isAdmin) {
      throw new ConvexError("ليس لديك صلاحية لعرض الإحصائيات المجمعة");
    }

    // Calculate date range
    let startDate: number;
    let endDate: number;

    if (args.date) {
      // Specific date
      const dateObj = new Date(args.date);
      startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).setHours(0, 0, 0, 0);
      endDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).setHours(23, 59, 59, 999);
    } else if (args.month && args.year) {
      // Month range
      startDate = new Date(args.year, args.month - 1, 1).setHours(0, 0, 0, 0);
      endDate = new Date(args.year, args.month, 0).setHours(23, 59, 59, 999);
    } else {
      throw new ConvexError("يجب توفير date أو month و year");
    }

    // Get all submitted or reviewed reports in the date range
    const allReports = await ctx.db
      .query("dailyHealthStats")
      .withIndex("by_status", (q) => 
        q.eq("status", "submitted")
      )
      .collect();

    // Also get reviewed reports
    const reviewedReports = await ctx.db
      .query("dailyHealthStats")
      .withIndex("by_status", (q) => 
        q.eq("status", "reviewed")
      )
      .collect();

    // Combine and filter by date range
    const filteredReports = [...allReports, ...reviewedReports].filter(
      (report) => report.submissionDate >= startDate && report.submissionDate <= endDate
    );

    if (filteredReports.length === 0) {
      return {
        aggregated: {},
        highlights: {
          totalChildVaccines: 0,
          totalMaternalLectures: 0,
          overallHealthEvents: 0,
        },
        totalReports: 0,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      };
    }

    // Initialize aggregated data structure
    let aggregated: Record<string, any> = {};

    // Aggregate all reports
    for (const report of filteredReports) {
      if (report.data) {
        aggregated = sumStatsData(aggregated, report.data);
      }
    }

    // Get all topics and categories for calculating highlights
    const allTopics = await ctx.db.query("statTopics").collect();
    const allCategories = await ctx.db.query("statCategories").collect();

    // Find topics for highlights
    // 1. totalChildVaccines: Find topics in "التحصين" category with name containing "لقاح الأطفال"
    const immunizationCategory = allCategories.find((cat) => 
      cat.nameAr.includes("التحصين") || cat.name.toLowerCase().includes("immunization")
    );
    
    let totalChildVaccines = 0;
    if (immunizationCategory) {
      const childVaccineTopics = allTopics.filter((topic) => 
        topic.categoryId === immunizationCategory._id && 
        (topic.nameAr.includes("لقاح الأطفال") || topic.nameAr.includes("لقاح الطفل"))
      );
      
      for (const topic of childVaccineTopics) {
        const topicData = aggregated[topic._id];
        if (topicData) {
          totalChildVaccines += 
            (topicData.individualMeetings || 0) +
            (topicData.lectures || 0) +
            (topicData.seminars || 0) +
            (topicData.healthEvents || 0);
        }
      }
    }

    // 2. totalMaternalLectures: Sum lectures in "رعاية الأم والطفل" category
    const maternalCategory = allCategories.find((cat) => 
      cat.nameAr.includes("رعاية الأم") || cat.nameAr.includes("الأم والطفل") ||
      cat.name.toLowerCase().includes("maternal") || cat.name.toLowerCase().includes("child")
    );
    
    let totalMaternalLectures = 0;
    if (maternalCategory) {
      const maternalTopics = allTopics.filter((topic) => 
        topic.categoryId === maternalCategory._id
      );
      
      for (const topic of maternalTopics) {
        const topicData = aggregated[topic._id];
        if (topicData) {
          totalMaternalLectures += topicData.lectures || 0;
        }
      }
    }

    // 3. overallHealthEvents: Sum all healthEvents across all topics
    let overallHealthEvents = 0;
    for (const topicId in aggregated) {
      const topicData = aggregated[topicId];
      if (topicData) {
        overallHealthEvents += topicData.healthEvents || 0;
      }
    }

    return {
      aggregated,
      highlights: {
        totalChildVaccines,
        totalMaternalLectures,
        overallHealthEvents,
      },
      totalReports: filteredReports.length,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  },
});
