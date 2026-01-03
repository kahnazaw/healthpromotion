import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// إنشاء مركز صحي جديد
export const create = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const centerId = await ctx.db.insert("healthCenters", {
      name: args.name,
      location: args.location,
      phone: args.phone,
      isActive: true,
    });

    return centerId;
  },
});

// الحصول على جميع المراكز الصحية
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const centers = await ctx.db.query("healthCenters").collect();
    return centers;
  },
});

// الحصول على مركز صحي محدد
export const get = query({
  args: { id: v.id("healthCenters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const center = await ctx.db.get(args.id);
    return center;
  },
});

// تحديث مركز صحي
export const update = mutation({
  args: {
    id: v.id("healthCenters"),
    name: v.string(),
    location: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      location: args.location,
      phone: args.phone,
    });

    return args.id;
  },
});

// حذف مركز صحي
export const remove = mutation({
  args: { id: v.id("healthCenters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    await ctx.db.delete(args.id);
  },
});
