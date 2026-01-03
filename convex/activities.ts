import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// إضافة نشاط جديد
export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    activityType: v.string(),
    date: v.number(),
    location: v.string(),
    attendees: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const activityId = await ctx.db.insert("activities", {
      campaignId: args.campaignId,
      activityType: args.activityType,
      date: args.date,
      location: args.location,
      attendees: args.attendees,
      notes: args.notes,
      createdBy: userId,
    });

    // إنشاء إشعار
    await ctx.scheduler.runAfter(0, internal.notifications.createActivityNotification, {
      userId,
      campaignId: args.campaignId,
      date: args.date,
      location: args.location,
    });

    return activityId;
  },
});

// الحصول على أنشطة حملة معينة
export const listByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .collect();

    return activities;
  },
});

// إحصائيات الأنشطة
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const activities = await ctx.db.query("activities").collect();
    
    const total = activities.length;
    const totalAttendees = activities.reduce((sum, a) => sum + a.attendees, 0);
    
    // حساب الأنشطة حسب النوع
    const byType = activities.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      totalAttendees,
      byType,
    };
  },
});
