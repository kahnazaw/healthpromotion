import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// الحصول على إشعارات المستخدم
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    return notifications;
  },
});

// عدد الإشعارات غير المقروءة
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return notifications.filter(n => !n.isRead).length;
  },
});

// تحديد إشعار كمقروء
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== userId) {
      throw new Error("الإشعار غير موجود");
    }

    await ctx.db.patch(args.id, { isRead: true });
  },
});

// تحديد جميع الإشعارات كمقروءة
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const unreadNotifications = notifications.filter(n => !n.isRead);

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

// حذف إشعار
export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== userId) {
      throw new Error("الإشعار غير موجود");
    }

    await ctx.db.delete(args.id);
  },
});

// إنشاء إشعار للنشاط (داخلي)
export const createActivityNotification = internalMutation({
  args: {
    userId: v.id("users"),
    campaignId: v.id("campaigns"),
    date: v.number(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    
    if (campaign) {
      await ctx.db.insert("notifications", {
        userId: args.userId,
        title: "تم إضافة نشاط جديد",
        message: `تم إضافة نشاط جديد لحملة "${campaign.title}"`,
        type: "success",
        isRead: false,
      });

      // إشعار إذا كان النشاط قريباً (خلال 3 أيام)
      const threeDaysFromNow = Date.now() + (3 * 24 * 60 * 60 * 1000);
      if (args.date <= threeDaysFromNow && args.date >= Date.now()) {
        await ctx.db.insert("notifications", {
          userId: args.userId,
          title: "نشاط قادم قريباً",
          message: `نشاط "${campaign.title}" في ${args.location} خلال 3 أيام`,
          type: "warning",
          isRead: false,
        });
      }
    }
  },
});
