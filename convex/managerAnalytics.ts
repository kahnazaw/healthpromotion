import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// إحصائيات متقدمة للمدير
export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // جلب جميع المراكز الصحية
    const healthCenters = await ctx.db.query("healthCenters").collect();
    
    // إحصائيات لكل مركز
    const centerStats = await Promise.all(
      healthCenters.map(async (center) => {
        const campaigns = await ctx.db
          .query("campaigns")
          .withIndex("by_health_center", (q) => q.eq("healthCenterId", center._id))
          .collect();
        
        const activities = await Promise.all(
          campaigns.map(async (campaign) => {
            return await ctx.db
              .query("activities")
              .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
              .collect();
          })
        );
        
        const flatActivities = activities.flat();
        const totalAttendees = flatActivities.reduce((sum, a) => sum + a.attendees, 0);
        
        return {
          centerId: center._id,
          centerName: center.name,
          location: center.location,
          isActive: center.isActive,
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === "active").length,
          completedCampaigns: campaigns.filter(c => c.status === "completed").length,
          totalActivities: flatActivities.length,
          totalAttendees,
        };
      })
    );

    // إحصائيات شهرية (آخر 6 أشهر)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const monthStats = await ctx.db
        .query("monthlyStats")
        .withIndex("by_month_year", (q) => q.eq("month", month).eq("year", year))
        .collect();
      
      const approvedStats = monthStats.filter(s => s.status === "approved");
      
      monthlyData.push({
        month: `${year}-${String(month).padStart(2, '0')}`,
        centersReported: approvedStats.length,
        totalCenters: healthCenters.length,
      });
    }

    // مقارنة الأداء بين المراكز
    const topPerformers = [...centerStats]
      .sort((a, b) => b.totalAttendees - a.totalAttendees)
      .slice(0, 5);

    return {
      centerStats,
      monthlyData,
      topPerformers,
      summary: {
        totalCenters: healthCenters.length,
        activeCenters: healthCenters.filter(c => c.isActive).length,
        totalCampaigns: centerStats.reduce((sum, c) => sum + c.totalCampaigns, 0),
        totalActivities: centerStats.reduce((sum, c) => sum + c.totalActivities, 0),
        totalAttendees: centerStats.reduce((sum, c) => sum + c.totalAttendees, 0),
      },
    };
  },
});

// مقارنة الأداء بين فترتين زمنيتين
export const comparePerformance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // الشهر الحالي
    const currentStats = await ctx.db
      .query("monthlyStats")
      .withIndex("by_month_year", (q) => q.eq("month", currentMonth).eq("year", currentYear))
      .collect();
    
    // الشهر السابق
    const prevDate = new Date(currentYear, currentMonth - 2, 1);
    const prevMonth = prevDate.getMonth() + 1;
    const prevYear = prevDate.getFullYear();
    
    const prevStats = await ctx.db
      .query("monthlyStats")
      .withIndex("by_month_year", (q) => q.eq("month", prevMonth).eq("year", prevYear))
      .collect();

    return {
      current: {
        month: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
        submitted: currentStats.filter(s => s.status !== "draft").length,
        approved: currentStats.filter(s => s.status === "approved").length,
      },
      previous: {
        month: `${prevYear}-${String(prevMonth).padStart(2, '0')}`,
        submitted: prevStats.filter(s => s.status !== "draft").length,
        approved: prevStats.filter(s => s.status === "approved").length,
      },
    };
  },
});

// تحليل الاتجاهات (Trends)
export const getTrends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const now = new Date();
    const trends = [];

    // آخر 12 شهر
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const monthStats = await ctx.db
        .query("monthlyStats")
        .withIndex("by_month_year", (q) => q.eq("month", month).eq("year", year))
        .collect();

      const approvedStats = monthStats.filter(s => s.status === "approved");
      
      // حساب إجمالي الأنشطة والمستفيدين
      let totalActivities = 0;
      let totalBeneficiaries = 0;

      for (const stat of approvedStats) {
        try {
          const data = JSON.parse(stat.data);
          totalActivities += data.activities?.length || 0;
          totalBeneficiaries += data.totalBeneficiaries || 0;
        } catch (e) {
          // تجاهل الأخطاء
        }
      }

      trends.push({
        month: `${year}-${String(month).padStart(2, '0')}`,
        centersReported: approvedStats.length,
        totalActivities,
        totalBeneficiaries,
      });
    }

    return trends;
  },
});
