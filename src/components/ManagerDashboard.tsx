import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ManagerDashboard() {
  const analytics = useQuery(api.managerAnalytics.getAnalytics);
  const comparison = useQuery(api.managerAnalytics.comparePerformance);
  const trends = useQuery(api.managerAnalytics.getTrends);

  if (!analytics || !comparison || !trends) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="space-y-6">
      {/* ملخص الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <img 
              src="/kirkuk-logo.png" 
              alt="شعار دائرة صحة كركوك" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback to Convex storage URL if local file doesn't exist
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("polished-pony-114.convex.cloud")) {
                  target.src = "https://polished-pony-114.convex.cloud/api/storage/b69b6463-3c48-4960-9c5b-e58e96902f2e";
                }
              }}
            />
            <span className="text-sm opacity-80">المراكز</span>
          </div>
          <p className="text-4xl font-bold mb-1">{analytics.summary.totalCenters}</p>
          <p className="text-sm opacity-90">
            {analytics.summary.activeCenters} نشط
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📢</span>
            <span className="text-sm opacity-80">الحملات</span>
          </div>
          <p className="text-4xl font-bold mb-1">{analytics.summary.totalCampaigns}</p>
          <p className="text-sm opacity-90">إجمالي الحملات</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🎯</span>
            <span className="text-sm opacity-80">الأنشطة</span>
          </div>
          <p className="text-4xl font-bold mb-1">{analytics.summary.totalActivities}</p>
          <p className="text-sm opacity-90">نشاط منفذ</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">👥</span>
            <span className="text-sm opacity-80">المستفيدون</span>
          </div>
          <p className="text-4xl font-bold mb-1">
            {analytics.summary.totalAttendees.toLocaleString()}
          </p>
          <p className="text-sm opacity-90">إجمالي المستفيدين</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
            <span className="text-sm opacity-80">التقارير</span>
          </div>
          <p className="text-4xl font-bold mb-1">{comparison.current.approved}</p>
          <p className="text-sm opacity-90">تقرير معتمد هذا الشهر</p>
        </div>
      </div>

      {/* مقارنة الأداء */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-start">
            📈 مقارنة الأداء الشهري
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="text-start">
                <p className="text-sm text-gray-600">الشهر الحالي</p>
                <p className="text-lg font-bold text-gray-900">{comparison.current.month}</p>
              </div>
              <div className="text-end">
                <p className="text-sm text-gray-600">التقارير المعتمدة</p>
                <p className="text-3xl font-bold text-blue-600">{comparison.current.approved}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="text-start">
                <p className="text-sm text-gray-600">الشهر السابق</p>
                <p className="text-lg font-bold text-gray-900">{comparison.previous.month}</p>
              </div>
              <div className="text-end">
                <p className="text-sm text-gray-600">التقارير المعتمدة</p>
                <p className="text-3xl font-bold text-gray-600">{comparison.previous.approved}</p>
              </div>
            </div>

            {comparison.current.approved > comparison.previous.approved && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
                <span className="text-2xl">📈</span>
                <p className="font-medium">
                  تحسن بنسبة{" "}
                  {(
                    ((comparison.current.approved - comparison.previous.approved) /
                      comparison.previous.approved) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-start">
            🏆 أفضل 5 مراكز أداءً
          </h3>
          <div className="space-y-3">
            {analytics.topPerformers.map((center, index) => (
              <div
                key={center.centerId}
                className="flex items-center gap-4 p-4 bg-gradient-to-l from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1 text-start">
                  <p className="font-bold text-gray-900">{center.centerName}</p>
                  <p className="text-sm text-gray-600">{center.location}</p>
                </div>
                <div className="text-end">
                  <p className="text-2xl font-bold text-blue-600">
                    {center.totalAttendees.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">مستفيد</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رسم بياني خطي للاتجاهات */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-start">
            📊 اتجاهات الأداء (آخر 12 شهر)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalBeneficiaries"
                stroke="#3B82F6"
                strokeWidth={2}
                name="المستفيدون"
              />
              <Line
                type="monotone"
                dataKey="totalActivities"
                stroke="#8B5CF6"
                strokeWidth={2}
                name="الأنشطة"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* رسم بياني عمودي للمراكز */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-start">
            🏥 مقارنة أداء المراكز
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.centerStats.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="centerName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalCampaigns" fill="#3B82F6" name="الحملات" />
              <Bar dataKey="totalActivities" fill="#8B5CF6" name="الأنشطة" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* جدول تفصيلي لجميع المراكز */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 text-start">
            📋 تفاصيل جميع المراكز الصحية
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">
                  المركز الصحي
                </th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">
                  الموقع
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                  الحالة
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                  الحملات
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                  الأنشطة
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                  المستفيدون
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.centerStats.map((center) => (
                <tr key={center.centerId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-start">
                    <p className="font-medium text-gray-900">{center.centerName}</p>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <p className="text-sm text-gray-600">{center.location}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        center.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {center.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-gray-900">{center.totalCampaigns}</p>
                      <p className="text-xs text-gray-500">
                        {center.activeCampaigns} نشط
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-lg font-bold text-blue-600">{center.totalActivities}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {center.totalAttendees.toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* رسم دائري لتوزيع الحملات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-start">
            🎯 توزيع الحملات حسب الحالة
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "حملات نشطة",
                    value: analytics.centerStats.reduce((sum, c) => sum + c.activeCampaigns, 0),
                  },
                  {
                    name: "حملات مكتملة",
                    value: analytics.centerStats.reduce(
                      (sum, c) => sum + c.completedCampaigns,
                      0
                    ),
                  },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-start">
            📅 معدل التقارير الشهرية
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="centersReported" fill="#10B981" name="المراكز المبلغة" />
              <Bar dataKey="totalCenters" fill="#E5E7EB" name="إجمالي المراكز" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 py-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm mb-1">© 2024 دائرة صحة كركوك - قطاع كركوك الأول - وحدة تعزيز الصحة</p>
        <p className="text-emerald-600 text-sm font-semibold">برمجة وتصميم: م. صيدلي علاء صالح احمد 💻</p>
      </div>
    </div>
  );
}
