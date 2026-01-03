import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// إنشاء حملة جديدة
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    healthCenterId: v.id("healthCenters"),
    targetAudience: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const campaignId = await ctx.db.insert("campaigns", {
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      healthCenterId: args.healthCenterId,
      targetAudience: args.targetAudience,
      status: "planned",
      createdBy: userId,
    });

    // إنشاء إشعار للمستخدم
    await ctx.db.insert("notifications", {
      userId: userId,
      title: "تم إنشاء حملة جديدة",
      message: `تم إنشاء حملة "${args.title}" بنجاح`,
      type: "success",
      isRead: false,
    });

    return campaignId;
  },
});

// الحصول على جميع الحملات
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const campaigns = await ctx.db.query("campaigns").order("desc").collect();
    
    // إضافة معلومات المركز الصحي لكل حملة
    const campaignsWithCenter = await Promise.all(
      campaigns.map(async (campaign) => {
        const center = await ctx.db.get(campaign.healthCenterId);
        return {
          ...campaign,
          centerName: center?.name || "غير محدد",
        };
      })
    );

    return campaignsWithCenter;
  },
});

// الحصول على حملة محددة
export const get = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const campaign = await ctx.db.get(args.id);
    if (!campaign) return null;

    const center = await ctx.db.get(campaign.healthCenterId);
    
    return {
      ...campaign,
      centerName: center?.name || "غير محدد",
    };
  },
});

// تحديث حالة الحملة
export const updateStatus = mutation({
  args: {
    id: v.id("campaigns"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      throw new Error("الحملة غير موجودة");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    // إنشاء إشعار عند تغيير الحالة
    let notificationMessage = "";
    if (args.status === "active") {
      notificationMessage = `بدأت حملة "${campaign.title}"`;
    } else if (args.status === "completed") {
      notificationMessage = `اكتملت حملة "${campaign.title}"`;
    }

    if (notificationMessage) {
      await ctx.db.insert("notifications", {
        userId: campaign.createdBy,
        title: "تحديث حالة الحملة",
        message: notificationMessage,
        type: args.status === "active" ? "info" : "success",
        isRead: false,
      });
    }

    return args.id;
  },
});

// حذف حملة
export const remove = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    await ctx.db.delete(args.id);
  },
});

// إحصائيات الحملات
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const campaigns = await ctx.db.query("campaigns").collect();
    
    const total = campaigns.length;
    const active = campaigns.filter(c => c.status === "active").length;
    const completed = campaigns.filter(c => c.status === "completed").length;
    const planned = campaigns.filter(c => c.status === "planned").length;

    return {
      total,
      active,
      completed,
      planned,
    };
  },
});
