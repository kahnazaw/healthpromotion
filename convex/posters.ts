import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Query to list all posters
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    
    const posters = await ctx.db
      .query("posters")
      .order("desc")
      .collect();
    
    return posters;
  },
});

// Query to get a single poster
export const get = query({
  args: { id: v.id("posters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    return await ctx.db.get(args.id);
  },
});

// Mutation to create a poster (called after AI generation)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    campaignId: v.optional(v.id("campaigns")),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const posterId = await ctx.db.insert("posters", {
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl,
      campaignId: args.campaignId,
      prompt: args.prompt,
      createdBy: userId,
    });

    return posterId;
  },
});

// Action to generate poster using DALL-E 3
export const generateWithAI = action({
  args: {
    title: v.string(),
    description: v.string(),
    campaignId: v.optional(v.id("campaigns")),
    style: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ posterId: Id<"posters">; imageUrl: string }> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح OpenAI API غير متوفر. يرجى إضافته في إعدادات البيئة.");
    }

    // Build the prompt for DALL-E
    const styleGuide = args.style || "modern and professional";
    const prompt = `Create a health awareness poster in Arabic with the following details:
Title: ${args.title}
Description: ${args.description}

Style: ${styleGuide}, clean design, vibrant colors, suitable for health campaigns.
Include: Arabic text prominently displayed, medical/health related imagery, professional layout.
Make it: Eye-catching, informative, and suitable for printing.`;

    try {
      // Call OpenAI DALL-E 3 API
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "فشل في توليد الصورة");
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      // Save the poster to database
      const posterId = await ctx.runMutation(api.posters.create, {
        title: args.title,
        description: args.description,
        imageUrl: imageUrl,
        campaignId: args.campaignId,
        prompt: prompt,
      });

      return { posterId, imageUrl };
    } catch (error) {
      console.error("Error generating poster:", error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : "حدث خطأ أثناء توليد البوستر"
      );
    }
  },
});

// Mutation to delete a poster
export const remove = mutation({
  args: { id: v.id("posters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const poster = await ctx.db.get(args.id);
    if (!poster) {
      throw new Error("البوستر غير موجود");
    }

    if (poster.createdBy !== userId) {
      throw new Error("ليس لديك صلاحية لحذف هذا البوستر");
    }

    await ctx.db.delete(args.id);
  },
});

// Mutation to update poster details
export const update = mutation({
  args: {
    id: v.id("posters"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const poster = await ctx.db.get(args.id);
    if (!poster) {
      throw new Error("البوستر غير موجود");
    }

    if (poster.createdBy !== userId) {
      throw new Error("ليس لديك صلاحية لتعديل هذا البوستر");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
    });
  },
});
