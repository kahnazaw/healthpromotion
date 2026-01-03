import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Mutation to toggle pin status
export const togglePin = mutation({
  args: { id: v.id("posters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const poster = await ctx.db.get(args.id);
    if (!poster) {
      throw new ConvexError("البوستر غير موجود");
    }

    await ctx.db.patch(args.id, {
      isPinned: !poster.isPinned,
    });
  },
});

// Query to list featured/pinned posters
export const listFeatured = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const posters = await ctx.db
      .query("posters")
      .withIndex("by_pinned", (q) => q.eq("isPinned", true))
      .order("desc")
      .take(6);

    return posters;
  },
});

// Query to list top rated posters
export const listTopRated = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const posters = await ctx.db.query("posters").order("desc").collect();

    const sortedPosters = posters
      .filter((p) => p.rating && p.rating > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);

    return sortedPosters;
  },
});
