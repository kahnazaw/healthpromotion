import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Mutation to rate a poster
export const rate = mutation({
  args: {
    posterId: v.id("posters"),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new ConvexError("التقييم يجب أن يكون بين 1 و 5");
    }

    const existing = await ctx.db
      .query("posterRatings")
      .withIndex("by_user_and_poster", (q) =>
        q.eq("userId", userId).eq("posterId", args.posterId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { rating: args.rating });
    } else {
      await ctx.db.insert("posterRatings", {
        posterId: args.posterId,
        userId,
        rating: args.rating,
      });
    }

    const allRatings = await ctx.db
      .query("posterRatings")
      .withIndex("by_poster", (q) => q.eq("posterId", args.posterId))
      .collect();

    const avgRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await ctx.db.patch(args.posterId, {
      rating: avgRating,
      ratingCount: allRatings.length,
    });
  },
});

// Query to get user's rating for a poster
export const getUserRating = query({
  args: { posterId: v.id("posters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const rating = await ctx.db
      .query("posterRatings")
      .withIndex("by_user_and_poster", (q) =>
        q.eq("userId", userId).eq("posterId", args.posterId)
      )
      .first();

    return rating?.rating || null;
  },
});
