import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Helper function to validate that all fields in a sub-item are numbers
function validateSubItem(item: any): boolean {
  return (
    typeof item.individualMeetings === "number" &&
    typeof item.lectures === "number" &&
    typeof item.seminars === "number" &&
    typeof item.healthEvents === "number"
  );
}

// Helper function to validate all sub-items in a category
function validateCategory(category: any): boolean {
  if (!category || typeof category !== "object") return false;
  
  for (const key in category) {
    if (!validateSubItem(category[key])) {
      return false;
    }
  }
  return true;
}

// Helper function to validate the entire stats object
function validateStatsData(data: any): boolean {
  if (!data || typeof data !== "object") return false;

  // Validate all categories
  return (
    validateCategory(data.maternalChildHealth) &&
    validateCategory(data.immunization) &&
    validateCategory(data.communicableDiseases) &&
    validateCategory(data.nonCommunicableDiseases) &&
    validateCategory(data.mentalHealth) &&
    validateSubItem(data.firstAidOccupationalSafety) &&
    validateSubItem(data.generalPersonalHygiene) &&
    validateSubItem(data.drugMisuse) &&
    validateSubItem(data.drugResistance) &&
    validateSubItem(data.healthEventsCategory) &&
    validateSubItem(data.others)
  );
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

// Helper function to sum two categories
function sumCategory(category1: any, category2: any) {
  if (!category1 && !category2) return null;
  if (!category1) return category2;
  if (!category2) return category1;

  const result: any = {};
  for (const key in category1) {
    if (category2[key]) {
      result[key] = sumSubItems(category1[key], category2[key]);
    } else {
      result[key] = category1[key];
    }
  }
  for (const key in category2) {
    if (!result[key]) {
      result[key] = category2[key];
    }
  }
  return result;
}

// Helper function to sum entire stats objects
function sumStats(stats1: any, stats2: any) {
  return {
    maternalChildHealth: sumCategory(stats1?.maternalChildHealth, stats2?.maternalChildHealth),
    immunization: sumCategory(stats1?.immunization, stats2?.immunization),
    communicableDiseases: sumCategory(stats1?.communicableDiseases, stats2?.communicableDiseases),
    nonCommunicableDiseases: sumCategory(stats1?.nonCommunicableDiseases, stats2?.nonCommunicableDiseases),
    mentalHealth: sumCategory(stats1?.mentalHealth, stats2?.mentalHealth),
    firstAidOccupationalSafety: sumSubItems(stats1?.firstAidOccupationalSafety, stats2?.firstAidOccupationalSafety),
    generalPersonalHygiene: sumSubItems(stats1?.generalPersonalHygiene, stats2?.generalPersonalHygiene),
    drugMisuse: sumSubItems(stats1?.drugMisuse, stats2?.drugMisuse),
    drugResistance: sumSubItems(stats1?.drugResistance, stats2?.drugResistance),
    healthEventsCategory: sumSubItems(stats1?.healthEventsCategory, stats2?.healthEventsCategory),
    others: sumSubItems(stats1?.others, stats2?.others),
  };
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
    let consolidated: any = null;

    for (const report of monthlyReports) {
      const reportData = {
        maternalChildHealth: report.maternalChildHealth,
        immunization: report.immunization,
        communicableDiseases: report.communicableDiseases,
        nonCommunicableDiseases: report.nonCommunicableDiseases,
        mentalHealth: report.mentalHealth,
        firstAidOccupationalSafety: report.firstAidOccupationalSafety,
        generalPersonalHygiene: report.generalPersonalHygiene,
        drugMisuse: report.drugMisuse,
        drugResistance: report.drugResistance,
        healthEventsCategory: report.healthEventsCategory,
        others: report.others,
      };

      if (!consolidated) {
        consolidated = reportData;
      } else {
        consolidated = sumStats(consolidated, reportData);
      }
    }

    // Get unique centers count
    const uniqueCenters = new Set(monthlyReports.map((r) => r.healthCenterId.toString()));

    return {
      month: args.month,
      year: args.year,
      totalCenters: uniqueCenters.size,
      totalReports: monthlyReports.length,
      consolidated,
    };
  },
});

// Submit daily report with validation
export const submitDailyReport = mutation({
  args: {
    healthCenterId: v.id("healthCenters"),
    submissionDate: v.number(),
    status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("reviewed")),
    maternalChildHealth: v.object({
      preMarriageExamination: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      pregnancyCareVisits: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      pregnantVaccination: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      pregnantNutrition: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      highRiskPregnant: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      postDeliveryExamination: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      familyPlanning: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      womenSafePeriod: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      breastCancer: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      breastfeeding: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      childrenComplementaryFood: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      childrenDiarrhea: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      childrenRespiratoryInfections: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
    }),
    immunization: v.object({
      childrenVaccination: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      reproductiveAgeMothersVaccination: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      newRoutineVaccines: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      vaccinationCampaigns: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      otherVaccines: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
    }),
    communicableDiseases: v.object({
      cholera: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      pandemicInfluenza: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      typhoid: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      foodPoisoning: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      viralHepatitis: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      tuberculosis: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      aids: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      sexuallyTransmittedDiseases: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      hemorrhagicFever: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      leishmaniasis: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      bilharzia: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      intestinalParasites: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      rabies: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
    }),
    nonCommunicableDiseases: v.object({
      hypertensionDiabetes: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      heartDiseases: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      osteoporosis: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      healthyNutrition: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      obesity: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      iodizedSalt: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      anemia: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      vitaminA: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      physicalActivity: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      thalassemia: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
    }),
    mentalHealth: v.object({
      adolescentsYouth: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      smoking: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      drugs: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
      domesticViolence: v.object({
        individualMeetings: v.number(),
        lectures: v.number(),
        seminars: v.number(),
        healthEvents: v.number(),
      }),
    }),
    firstAidOccupationalSafety: v.object({
      individualMeetings: v.number(),
      lectures: v.number(),
      seminars: v.number(),
      healthEvents: v.number(),
    }),
    generalPersonalHygiene: v.object({
      individualMeetings: v.number(),
      lectures: v.number(),
      seminars: v.number(),
      healthEvents: v.number(),
    }),
    drugMisuse: v.object({
      individualMeetings: v.number(),
      lectures: v.number(),
      seminars: v.number(),
      healthEvents: v.number(),
    }),
    drugResistance: v.object({
      individualMeetings: v.number(),
      lectures: v.number(),
      seminars: v.number(),
      healthEvents: v.number(),
    }),
    healthEventsCategory: v.object({
      individualMeetings: v.number(),
      lectures: v.number(),
      seminars: v.number(),
      healthEvents: v.number(),
    }),
    others: v.object({
      individualMeetings: v.number(),
      lectures: v.number(),
      seminars: v.number(),
      healthEvents: v.number(),
    }),
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
    // Convex schema validation will handle this, but we add extra validation for safety
    const statsData = {
      maternalChildHealth: args.maternalChildHealth,
      immunization: args.immunization,
      communicableDiseases: args.communicableDiseases,
      nonCommunicableDiseases: args.nonCommunicableDiseases,
      mentalHealth: args.mentalHealth,
      firstAidOccupationalSafety: args.firstAidOccupationalSafety,
      generalPersonalHygiene: args.generalPersonalHygiene,
      drugMisuse: args.drugMisuse,
      drugResistance: args.drugResistance,
      healthEventsCategory: args.healthEventsCategory,
      others: args.others,
    };

    if (!validateStatsData(statsData)) {
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
        maternalChildHealth: args.maternalChildHealth,
        immunization: args.immunization,
        communicableDiseases: args.communicableDiseases,
        nonCommunicableDiseases: args.nonCommunicableDiseases,
        mentalHealth: args.mentalHealth,
        firstAidOccupationalSafety: args.firstAidOccupationalSafety,
        generalPersonalHygiene: args.generalPersonalHygiene,
        drugMisuse: args.drugMisuse,
        drugResistance: args.drugResistance,
        healthEventsCategory: args.healthEventsCategory,
        others: args.others,
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
        maternalChildHealth: args.maternalChildHealth,
        immunization: args.immunization,
        communicableDiseases: args.communicableDiseases,
        nonCommunicableDiseases: args.nonCommunicableDiseases,
        mentalHealth: args.mentalHealth,
        firstAidOccupationalSafety: args.firstAidOccupationalSafety,
        generalPersonalHygiene: args.generalPersonalHygiene,
        drugMisuse: args.drugMisuse,
        drugResistance: args.drugResistance,
        healthEventsCategory: args.healthEventsCategory,
        others: args.others,
        review: args.review,
      });

      return reportId;
    }
  },
});

