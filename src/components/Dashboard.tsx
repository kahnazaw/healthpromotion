import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { SignOutButton } from "../SignOutButton";
import NotificationBell from "./NotificationBell";
import HealthCenters from "./HealthCenters";
import Campaigns from "./Campaigns";
import Activities from "./Activities";
import Posters from "./Posters";
import Reports from "./Reports";

type TabType = "dashboard" | "centers" | "campaigns" | "activities" | "posters" | "reports";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const stats = useQuery(api.dashboard.stats);
  const recentActivities = useQuery(api.dashboard.recentActivities);

  const tabs = [
    { id: "dashboard" as TabType, name: "لوحة التحكم", icon: "📊" },
    { id: "centers" as TabType, name: "المراكز الصحية", icon: "🏥" },
    { id: "campaigns" as TabType, name: "الحملات", icon: "📢" },
    { id: "activities" as TabType, name: "الأنشطة", icon: "📅" },
    { id: "posters" as TabType, name: "البوسترات", icon: "🎨" },
    { id: "reports" as TabType, name: "التقارير", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-emerald-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-2xl">🏥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 text-start">دائرة صحة كركوك</h1>
                <p className="text-xs text-emerald-600 font-semibold text-start">قطاع كركوك الأول - وحدة تعزيز الصحة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stats?.healthCenters.total || 0}</span>
                </div>
                <h3 className="text-start font-semibold text-gray-900 mb-1">المراكز الصحية</h3>
                <p className="text-start text-sm text-gray-600">{stats?.healthCenters.active || 0} مركز نشط</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-2xl">📢</span>
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stats?.campaigns.total || 0}</span>
                </div>
                <h3 className="text-start font-semibold text-gray-900 mb-1">الحملات الصحية</h3>
                <p className="text-start text-sm text-gray-600">{stats?.campaigns.active || 0} حملة نشطة</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stats?.activities.total || 0}</span>
                </div>
                <h3 className="text-start font-semibold text-gray-900 mb-1">الأنشطة</h3>
                <p className="text-start text-sm text-gray-600">{stats?.activities.totalAttendees || 0} مستفيد</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stats?.posters.total || 0}</span>
                </div>
                <h3 className="text-start font-semibold text-gray-900 mb-1">البوسترات</h3>
                <p className="text-start text-sm text-gray-600">تم إنشاؤها</p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-start">الأنشطة الأخيرة</h2>
              {!recentActivities ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">📅</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد أنشطة بعد</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة أنشطة للحملات الصحية</p>
                  <button
                    onClick={() => setActiveTab("activities")}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    إضافة نشاط
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity._id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">
                          {activity.activityType === "awareness_session" ? "🎓" :
                           activity.activityType === "health_screening" ? "🔬" :
                           activity.activityType === "vaccination" ? "💉" : "📋"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-start truncate">{activity.campaignTitle}</h3>
                        <p className="text-sm text-gray-600 text-start">{activity.location} • {activity.attendees} مستفيد</p>
                      </div>
                      <div className="text-start text-sm text-gray-500">
                        {new Date(activity.date).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab === "centers" && <HealthCenters />}
        {activeTab === "campaigns" && <Campaigns />}
        {activeTab === "activities" && <Activities />}
        {activeTab === "posters" && <Posters />}
        {activeTab === "reports" && <Reports />}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm mb-1">© 2024 دائرة صحة كركوك - قطاع كركوك الأول - وحدة تعزيز الصحة</p>
          <p className="text-emerald-600 text-sm font-semibold">برمجة وتصميم: م. صيدلي علاء صالح احمد 💻</p>
        </div>
      </footer>
    </div>
  );
}
