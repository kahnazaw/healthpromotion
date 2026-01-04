import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// إنشاء موضوع جديد
export const create = mutation({
  args: {
    categoryId: v.id("statCategories"),
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
      throw new ConvexError("ليس لديك صلاحية لإنشاء المواضيع");
    }

    // التحقق من وجود التصنيف
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("التصنيف غير موجود");
    }

    const topicId = await ctx.db.insert("statTopics", {
      categoryId: args.categoryId,
      name: args.name,
      nameAr: args.nameAr,
      order: args.order,
      isActive: true,
      description: args.description,
      createdBy: userId,
      createdAt: Date.now(),
    });

    return topicId;
  },
});

// الحصول على جميع المواضيع حسب التصنيف
export const listByCategory = query({
  args: {
    categoryId: v.id("statCategories"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let topics = await ctx.db
      .query("statTopics")
      .withIndex("by_category_and_order", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    if (!args.includeInactive) {
      topics = topics.filter((topic) => topic.isActive);
    }

    return topics.sort((a, b) => a.order - b.order);
  },
});

// الحصول على جميع المواضيع النشطة
export const list = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let topics = await ctx.db.query("statTopics").collect();

    if (!args.includeInactive) {
      topics = topics.filter((topic) => topic.isActive);
    }

    // ترتيب حسب التصنيف ثم الترتيب
    const categories = await ctx.db
      .query("statCategories")
      .withIndex("by_order")
      .collect();

    const sortedTopics = topics.sort((a, b) => {
      const categoryA = categories.find((c) => c._id === a.categoryId);
      const categoryB = categories.find((c) => c._id === b.categoryId);
      
      if (categoryA && categoryB) {
        if (categoryA.order !== categoryB.order) {
          return categoryA.order - categoryB.order;
        }
      }
      
      return a.order - b.order;
    });

    return sortedTopics;
  },
});

// الحصول على موضوع محدد
export const get = query({
  args: { id: v.id("statTopics") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const topic = await ctx.db.get(args.id);
    return topic;
  },
});

// تحديث موضوع
export const update = mutation({
  args: {
    id: v.id("statTopics"),
    categoryId: v.optional(v.id("statCategories")),
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
      throw new ConvexError("ليس لديك صلاحية لتحديث المواضيع");
    }

    const updateData: any = {};
    if (args.categoryId !== undefined) updateData.categoryId = args.categoryId;
    if (args.name !== undefined) updateData.name = args.name;
    if (args.nameAr !== undefined) updateData.nameAr = args.nameAr;
    if (args.order !== undefined) updateData.order = args.order;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;
    if (args.description !== undefined) updateData.description = args.description;

    await ctx.db.patch(args.id, updateData);

    return args.id;
  },
});

// حذف موضوع
export const remove = mutation({
  args: { id: v.id("statTopics") },
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
      throw new ConvexError("ليس لديك صلاحية لحذف المواضيع");
    }

    await ctx.db.delete(args.id);
  },
});

