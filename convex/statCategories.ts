import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// إنشاء تصنيف جديد
export const create = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),
    order: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم مدير
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "super_admin")) {
      throw new ConvexError("ليس لديك صلاحية لإنشاء التصنيفات");
    }

    const categoryId = await ctx.db.insert("statCategories", {
      name: args.name,
      nameAr: args.nameAr,
      order: args.order,
      isActive: true,
      description: args.description,
      createdBy: userId,
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

// الحصول على جميع التصنيفات النشطة
export const list = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let categories = await ctx.db
      .query("statCategories")
      .withIndex("by_order")
      .collect();

    if (!args.includeInactive) {
      categories = categories.filter((cat) => cat.isActive);
    }

    return categories.sort((a, b) => a.order - b.order);
  },
});

// الحصول على تصنيف محدد
export const get = query({
  args: { id: v.id("statCategories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const category = await ctx.db.get(args.id);
    return category;
  },
});

// تحديث تصنيف
export const update = mutation({
  args: {
    id: v.id("statCategories"),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم مدير
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "super_admin")) {
      throw new ConvexError("ليس لديك صلاحية لتحديث التصنيفات");
    }

    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.nameAr !== undefined) updateData.nameAr = args.nameAr;
    if (args.order !== undefined) updateData.order = args.order;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;
    if (args.description !== undefined) updateData.description = args.description;

    await ctx.db.patch(args.id, updateData);

    return args.id;
  },
});

// حذف تصنيف
export const remove = mutation({
  args: { id: v.id("statCategories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم مدير
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "super_admin")) {
      throw new ConvexError("ليس لديك صلاحية لحذف التصنيفات");
    }

    // التحقق من وجود مواضيع مرتبطة
    const topics = await ctx.db
      .query("statTopics")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();

    if (topics.length > 0) {
      throw new ConvexError("لا يمكن حذف التصنيف لأنه يحتوي على مواضيع مرتبطة");
    }

    await ctx.db.delete(args.id);
  },
});

