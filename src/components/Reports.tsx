import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { exportToPDF, exportToCSV } from "../lib/reportExporter";
import { printReport } from "../lib/reportPrinter";

export default function Reports() {
  const [isExporting, setIsExporting] = useState(false);
  const campaignStats = useQuery(api.campaigns.stats);
  const activityStats = useQuery(api.activities.stats);
  const dashboardStats = useQuery(api.dashboard.stats);

  const handlePrint = () => {
    if (!campaignStats || !activityStats || !dashboardStats) {
      toast.error("يرجى الانتظار حتى يتم تحميل البيانات");
      return;
    }

    try {
      printReport(campaignStats, activityStats, dashboardStats);
      toast.success("جاري فتح نافذة الطباعة...");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الطباعة";
      toast.error(message);
    }
  };

  const handleExportPDF = async () => {
    if (!campaignStats || !activityStats || !dashboardStats) {
      toast.error("يرجى الانتظار حتى يتم تحميل البيانات");
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(campaignStats, activityStats, dashboardStats);
      toast.success("تم تصدير التقرير بصيغة PDF بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء التصدير";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!campaignStats || !activityStats || !dashboardStats) {
      toast.error("يرجى الانتظار حتى يتم تحميل البيانات");
      return;
    }

    setIsExporting(true);
    try {
      exportToCSV(campaignStats, activityStats, dashboardStats);
      toast.success("تم تصدير التقرير بصيغة CSV بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء التصدير";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 text-start">التقارير والإحصائيات</h2>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            disabled={!campaignStats}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">🖨️</span>
            <span>طباعة</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting || !campaignStats}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">📊</span>
            <span>تصدير CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting || !campaignStats}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">📄</span>
            <span>تصدير PDF</span>
          </button>
        </div>
      </div>

      {/* Campaign Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-start flex items-center gap-2">
          <span>📊</span>
          <span>إحصائيات الحملات</span>
        </h3>
        {!campaignStats ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">{campaignStats.total}</div>
              <div className="text-sm text-gray-600">إجمالي الحملات</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-1">{campaignStats.active}</div>
              <div className="text-sm text-gray-600">حملات نشطة</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-1">{campaignStats.completed}</div>
              <div className="text-sm text-gray-600">حملات مكتملة</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{campaignStats.planned}</div>
              <div className="text-sm text-gray-600">حملات مخططة</div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-start flex items-center gap-2">
          <span>📅</span>
          <span>إحصائيات الأنشطة</span>
        </h3>
        {!activityStats ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="text-4xl font-bold text-purple-600 mb-2">{activityStats.total}</div>
                <div className="text-sm text-gray-600">إجمالي الأنشطة</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
                <div className="text-4xl font-bold text-emerald-600 mb-2">{activityStats.totalAttendees.toLocaleString()}</div>
                <div className="text-sm text-gray-600">إجمالي المستفيدين</div>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-4 text-start">الأنشطة حسب النوع</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(activityStats.byType).map(([type, count]) => {
                const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
                  awareness_session: { label: "جلسات توعية", icon: "🎓", color: "from-blue-500 to-indigo-600" },
                  health_screening: { label: "فحوصات صحية", icon: "🔬", color: "from-green-500 to-emerald-600" },
                  vaccination: { label: "تطعيمات", icon: "💉", color: "from-purple-500 to-pink-600" },
                  other: { label: "أخرى", icon: "📋", color: "from-gray-500 to-gray-600" },
                };
                const typeInfo = typeLabels[type] || typeLabels.other;
                
                return (
                  <div key={type} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeInfo.color} flex items-center justify-center mb-3`}>
                      <span className="text-xl">{typeInfo.icon}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                    <div className="text-sm text-gray-600">{typeInfo.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Overall Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-start flex items-center gap-2">
          <span>📈</span>
          <span>الإحصائيات العامة</span>
        </h3>
        {!dashboardStats ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardStats.healthCenters.total}</div>
              <div className="text-sm text-gray-600">مراكز صحية</div>
              <div className="text-xs text-emerald-600 mt-1">{dashboardStats.healthCenters.active} نشط</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                <span className="text-2xl">📢</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardStats.campaigns.total}</div>
              <div className="text-sm text-gray-600">حملات صحية</div>
              <div className="text-xs text-blue-600 mt-1">{dashboardStats.campaigns.active} نشطة</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardStats.activities.total}</div>
              <div className="text-sm text-gray-600">أنشطة</div>
              <div className="text-xs text-purple-600 mt-1">{dashboardStats.activities.totalAttendees.toLocaleString()} مستفيد</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardStats.posters.total}</div>
              <div className="text-sm text-gray-600">بوسترات توعوية</div>
            </div>
          </div>
        )}
      </div>

      {/* Export Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2 text-start">معلومات التصدير والطباعة</h4>
            <ul className="text-sm text-gray-600 space-y-1 text-start">
              <li>• <strong>طباعة:</strong> طباعة مباشرة بتنسيق احترافي جاهز للطباعة</li>
              <li>• <strong>PDF:</strong> مناسب للطباعة والمشاركة الرسمية</li>
              <li>• <strong>CSV:</strong> مناسب للتحليل في Excel أو Google Sheets</li>
              <li>• يتم تضمين جميع الإحصائيات والبيانات الحالية</li>
              <li>• التقارير تحتوي على التاريخ والوقت للمرجعية</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
