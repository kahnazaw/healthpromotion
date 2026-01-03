import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// إنشاء أو تحديث إحصائيات شهرية
export const createOrUpdate = mutation({
  args: {
    month: v.number(),
    year: v.number(),
    healthCenterId: v.id("healthCenters"),
    data: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const existing = await ctx.db
      .query("monthlyStats")
      .withIndex("by_center_and_date", (q) =>
        q
          .eq("healthCenterId", args.healthCenterId)
          .eq("year", args.year)
          .eq("month", args.month)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data,
      });
      return existing._id;
    } else {
      const statsId = await ctx.db.insert("monthlyStats", {
        month: args.month,
        year: args.year,
        healthCenterId: args.healthCenterId,
        data: args.data,
        createdBy: userId,
        status: "draft",
      });
      return statsId;
    }
  },
});

// إرسال الإحصائيات للمراجعة
export const submit = mutation({
  args: { id: v.id("monthlyStats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const stats = await ctx.db.get(args.id);
    if (!stats) {
      throw new ConvexError("الإحصائيات غير موجودة");
    }

    await ctx.db.patch(args.id, {
      status: "submitted",
      submittedAt: Date.now(),
    });

    // إرسال إشعار للمدير
    const center = await ctx.db.get(stats.healthCenterId);
    if (center?.managerId) {
      await ctx.db.insert("notifications", {
        userId: center.managerId,
        title: "إحصائيات شهرية جديدة",
        message: `تم إرسال إحصائيات شهر ${stats.month} من ${center.name}`,
        type: "info",
        isRead: false,
      });
    }
  },
});

// مراجعة الإحصائيات (للمدير)
export const review = mutation({
  args: {
    id: v.id("monthlyStats"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      reviewedBy: userId,
      reviewedAt: Date.now(),
      reviewNotes: args.notes,
    });

    // إرسال إشعار لمنشئ الإحصائيات
    const stats = await ctx.db.get(args.id);
    if (stats) {
      await ctx.db.insert("notifications", {
        userId: stats.createdBy,
        title: args.status === "approved" ? "تمت الموافقة على الإحصائيات" : "تم رفض الإحصائيات",
        message: args.notes || `تم ${args.status === "approved" ? "قبول" : "رفض"} إحصائيات شهر ${stats.month}`,
        type: args.status === "approved" ? "success" : "error",
        isRead: false,
      });
    }
  },
});

// الحصول على إحصائيات شهر معين
export const get = query({
  args: {
    month: v.number(),
    year: v.number(),
    healthCenterId: v.id("healthCenters"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const stats = await ctx.db
      .query("monthlyStats")
      .withIndex("by_center_and_date", (q) =>
        q
          .eq("healthCenterId", args.healthCenterId)
          .eq("year", args.year)
          .eq("month", args.month)
      )
      .first();

    return stats;
  },
});

// الحصول على جميع الإحصائيات لمركز صحي
export const listByCenter = query({
  args: {
    healthCenterId: v.id("healthCenters"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const stats = await ctx.db
      .query("monthlyStats")
      .withIndex("by_health_center", (q) => q.eq("healthCenterId", args.healthCenterId))
      .order("desc")
      .collect();

    return stats;
  },
});

// الحصول على جميع الإحصائيات المرسلة (للمدير)
export const listSubmitted = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const stats = await ctx.db
      .query("monthlyStats")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .order("desc")
      .collect();

    return stats;
  },
});

// الحصول على جميع الإحصائيات (للمدير)
export const listAll = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let stats;
    if (args.status) {
      stats = await ctx.db
        .query("monthlyStats")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      stats = await ctx.db
        .query("monthlyStats")
        .order("desc")
        .collect();
    }

    return stats;
  },
});

// الحصول على جميع الإحصائيات لسنة معينة
export const listByYear = query({
  args: {
    year: v.number(),
    healthCenterId: v.optional(v.id("healthCenters")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let stats = await ctx.db
      .query("monthlyStats")
      .withIndex("by_month_year")
      .order("desc")
      .collect();

    stats = stats.filter((s) => s.year === args.year);

    if (args.healthCenterId) {
      stats = stats.filter((s) => s.healthCenterId === args.healthCenterId);
    }

    return stats;
  },
});

// حذف إحصائيات
export const remove = mutation({
  args: { id: v.id("monthlyStats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    await ctx.db.delete(args.id);
  },
});
