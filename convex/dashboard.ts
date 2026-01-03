import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// إحصائيات لوحة التحكم الرئيسية
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // إحصائيات المراكز الصحية
    const healthCenters = await ctx.db.query("healthCenters").collect();
    const activeCenters = healthCenters.filter(c => c.isActive).length;

    // إحصائيات الحملات
    const campaigns = await ctx.db.query("campaigns").collect();
    const activeCampaigns = campaigns.filter(c => c.status === "active").length;
    const completedCampaigns = campaigns.filter(c => c.status === "completed").length;

    // إحصائيات الأنشطة
    const activities = await ctx.db.query("activities").collect();
    const totalActivities = activities.length;
    const totalAttendees = activities.reduce((sum, a) => sum + a.attendees, 0);

    // إحصائيات البوسترات
    const posters = await ctx.db.query("posters").collect();
    const totalPosters = posters.length;

    // الأنشطة الأخيرة (آخر 30 يوم)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(a => a.date >= thirtyDaysAgo);

    return {
      healthCenters: {
        total: healthCenters.length,
        active: activeCenters,
      },
      campaigns: {
        total: campaigns.length,
        active: activeCampaigns,
        completed: completedCampaigns,
      },
      activities: {
        total: totalActivities,
        recent: recentActivities.length,
        totalAttendees,
      },
      posters: {
        total: totalPosters,
      },
    };
  },
});

// الأنشطة الأخيرة
export const recentActivities = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const activities = await ctx.db
      .query("activities")
      .order("desc")
      .take(10);

    const activitiesWithDetails = await Promise.all(
      activities.map(async (activity) => {
        const campaign = await ctx.db.get(activity.campaignId);
        return {
          ...activity,
          campaignTitle: campaign?.title || "غير محدد",
        };
      })
    );

    return activitiesWithDetails;
  },
});
