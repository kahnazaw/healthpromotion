import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// إنشاء ملف تعريف للمستخدم الجديد
export const createUserProfile = mutation({
  args: {
    healthCenterName: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من عدم وجود ملف تعريف مسبق
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      throw new ConvexError("لديك ملف تعريف بالفعل");
    }

    // إنشاء ملف التعريف
    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      role: "user", // الدور الافتراضي
      healthCenterName: args.healthCenterName,
      phone: args.phone,
      status: "pending", // في انتظار الموافقة
    });

    // إرسال إشعار للمدير الافتراضي
    const superAdmins = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "super_admin"))
      .collect();

    const user = await ctx.db.get(userId);
    
    for (const admin of superAdmins) {
      await ctx.db.insert("notifications", {
        userId: admin.userId,
        title: "طلب تسجيل جديد",
        message: `طلب تسجيل جديد من ${user?.name || "مستخدم"} - ${args.healthCenterName}`,
        type: "info",
        isRead: false,
        link: "users",
      });
    }

    return profileId;
  },
});

// الحصول على ملف تعريف المستخدم الحالي
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

// الحصول على جميع طلبات التسجيل
export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // التحقق من أن المستخدم مدير
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentProfile || (currentProfile.role !== "super_admin" && currentProfile.role !== "admin")) {
      return [];
    }

    const pendingProfiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const result = await Promise.all(
      pendingProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          userName: user?.name || "غير معروف",
          userEmail: user?.email || "غير معروف",
        };
      })
    );

    return result;
  },
});

// الموافقة على طلب تسجيل
export const approveUser = mutation({
  args: {
    profileId: v.id("userProfiles"),
    role: v.string(), // "admin" or "user"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم مدير
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentProfile || (currentProfile.role !== "super_admin" && currentProfile.role !== "admin")) {
      throw new ConvexError("ليس لديك صلاحية للموافقة على الطلبات");
    }

    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new ConvexError("الملف التعريفي غير موجود");
    }

    // تحديث الملف التعريفي
    await ctx.db.patch(args.profileId, {
      status: "approved",
      role: args.role,
      approvedBy: userId,
      approvedAt: Date.now(),
    });

    // إرسال إشعار للمستخدم
    await ctx.db.insert("notifications", {
      userId: profile.userId,
      title: "تمت الموافقة على حسابك",
      message: `تمت الموافقة على حسابك بصلاحيات ${args.role === "admin" ? "مدير" : "مستخدم"}`,
      type: "success",
      isRead: false,
    });

    return null;
  },
});

// رفض طلب تسجيل
export const rejectUser = mutation({
  args: {
    profileId: v.id("userProfiles"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم مدير
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentProfile || (currentProfile.role !== "super_admin" && currentProfile.role !== "admin")) {
      throw new ConvexError("ليس لديك صلاحية لرفض الطلبات");
    }

    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new ConvexError("الملف التعريفي غير موجود");
    }

    // تحديث الملف التعريفي
    await ctx.db.patch(args.profileId, {
      status: "rejected",
      rejectionReason: args.reason,
      approvedBy: userId,
      approvedAt: Date.now(),
    });

    // إرسال إشعار للمستخدم
    await ctx.db.insert("notifications", {
      userId: profile.userId,
      title: "تم رفض طلب التسجيل",
      message: `تم رفض طلب التسجيل. السبب: ${args.reason}`,
      type: "error",
      isRead: false,
    });

    return null;
  },
});

// الحصول على جميع المستخدمين (للمدير)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // التحقق من أن المستخدم مدير
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentProfile || (currentProfile.role !== "super_admin" && currentProfile.role !== "admin")) {
      return [];
    }

    const profiles = await ctx.db.query("userProfiles").collect();

    const result = await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          userName: user?.name || "غير معروف",
          userEmail: user?.email || "غير معروف",
        };
      })
    );

    return result;
  },
});

// تغيير دور المستخدم
export const changeUserRole = mutation({
  args: {
    profileId: v.id("userProfiles"),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم مدير افتراضي
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentProfile || currentProfile.role !== "super_admin") {
      throw new ConvexError("ليس لديك صلاحية لتغيير الأدوار");
    }

    const targetProfile = await ctx.db.get(args.profileId);
    if (!targetProfile) {
      throw new ConvexError("الملف التعريفي غير موجود");
    }

    // منع تغيير دور المدير الافتراضي
    if (targetProfile.role === "super_admin") {
      throw new ConvexError("لا يمكن تغيير دور المدير الافتراضي");
    }

    await ctx.db.patch(args.profileId, {
      role: args.newRole,
    });

    // إرسال إشعار للمستخدم
    await ctx.db.insert("notifications", {
      userId: targetProfile.userId,
      title: "تم تغيير صلاحياتك",
      message: `تم تغيير صلاحياتك إلى ${args.newRole === "admin" ? "مدير" : "مستخدم"}`,
      type: "info",
      isRead: false,
    });

    return null;
  },
});

// حذف مستخدم
export const deleteUser = mutation({
  args: {
    profileId: v.id("userProfiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم مدير افتراضي
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentProfile || currentProfile.role !== "super_admin") {
      throw new ConvexError("ليس لديك صلاحية لحذف المستخدمين");
    }

    const targetProfile = await ctx.db.get(args.profileId);
    if (!targetProfile) {
      throw new ConvexError("الملف التعريفي غير موجود");
    }

    // منع حذف المدير الافتراضي
    if (targetProfile.role === "super_admin") {
      throw new ConvexError("لا يمكن حذف المدير الافتراضي");
    }

    await ctx.db.delete(args.profileId);

    return null;
  },
});

// تعيين المدير الافتراضي (يتم تشغيله مرة واحدة فقط)
export const setSuperAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من عدم وجود مدير افتراضي
    const existingSuperAdmin = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "super_admin"))
      .first();

    if (existingSuperAdmin) {
      throw new ConvexError("يوجد مدير افتراضي بالفعل");
    }

    // التحقق من وجود ملف تعريف للمستخدم الحالي
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // تحديث الملف الموجود
      await ctx.db.patch(existingProfile._id, {
        role: "super_admin",
        status: "approved",
        approvedAt: Date.now(),
      });
    } else {
      // إنشاء ملف جديد
      await ctx.db.insert("userProfiles", {
        userId,
        role: "super_admin",
        healthCenterName: "الإدارة العامة",
        status: "approved",
        approvedAt: Date.now(),
      });
    }

    return null;
  },
});
