import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import * as XLSX from "xlsx";

export default function ManagerReview() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [statusFilter, setStatusFilter] = useState<string>("submitted");

  const weeklyStats = useQuery(api.weeklyStats.listAll, { status: statusFilter });
  const monthlyStats = useQuery(api.monthlyStats.listAll, { status: statusFilter });
  const centers = useQuery(api.healthCenters.list) || [];

  const reviewWeekly = useMutation(api.weeklyStats.review);
  const reviewMonthly = useMutation(api.monthlyStats.review);

  const [reviewModal, setReviewModal] = useState<{
    id: Id<"weeklyStats"> | Id<"monthlyStats">;
    type: "weekly" | "monthly";
    data: any;
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const handleReview = async (status: "approved" | "rejected") => {
    if (!reviewModal) return;

    try {
      if (reviewModal.type === "weekly") {
        await reviewWeekly({
          id: reviewModal.id as Id<"weeklyStats">,
          status,
          notes: reviewNotes,
        });
      } else {
        await reviewMonthly({
          id: reviewModal.id as Id<"monthlyStats">,
          status,
          notes: reviewNotes,
        });
      }
      toast.success(`تم ${status === "approved" ? "قبول" : "رفض"} الإحصائيات`);
      setReviewModal(null);
      setReviewNotes("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const exportAllToExcel = () => {
    const stats = activeTab === "weekly" ? weeklyStats : monthlyStats;
    if (!stats || stats.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const data = stats.map((stat) => {
      const parsedData = JSON.parse(stat.data);
      const center = centers.find((c) => c._id === stat.healthCenterId);
      
      return {
        "المركز الصحي": center?.name || "غير معروف",
        [activeTab === "weekly" ? "الأسبوع" : "الشهر"]: activeTab === "weekly" ? (stat as any).week : (stat as any).month,
        "السنة": stat.year,
        "أنشطة التوعية": parsedData.awarenessActivities || 0,
        "الفحوصات الصحية": parsedData.healthScreenings || 0,
        "التطعيمات": parsedData.vaccinations || 0,
        "الزيارات المنزلية": parsedData.homeVisits || 0,
        "زيارات المدارس": parsedData.schoolVisits || 0,
        "المستفيدون": parsedData.beneficiaries || 0,
        "المواد الموزعة": parsedData.distributedMaterials || 0,
        "الحالة": getStatusText(stat.status),
        "ملاحظات": parsedData.notes || "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === "weekly" ? "إحصائيات أسبوعية" : "إحصائيات شهرية");
    XLSX.writeFile(wb, `جميع_الاحصائيات_${activeTab === "weekly" ? "الاسبوعية" : "الشهرية"}_${new Date().getFullYear()}.xlsx`);
    toast.success("تم تصدير البيانات بنجاح");
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft": return "مسودة";
      case "submitted": return "مرسلة";
      case "approved": return "موافق عليها";
      case "rejected": return "مرفوضة";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "submitted": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const currentStats = activeTab === "weekly" ? weeklyStats : monthlyStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-start">مراجعة الإحصائيات</h2>
          <p className="text-gray-600 text-start mt-1">مراجعة والموافقة على إحصائيات المراكز الصحية</p>
        </div>
        <button
          onClick={exportAllToExcel}
          disabled={!currentStats || currentStats.length === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>📥</span>
          <span>تصدير الكل إلى Excel</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "weekly"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            الإحصائيات الأسبوعية
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "monthly"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            الإحصائيات الشهرية
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 text-start">تصفية حسب الحالة</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <option value="">الكل</option>
          <option value="submitted">مرسلة</option>
          <option value="approved">موافق عليها</option>
          <option value="rejected">مرفوضة</option>
        </select>
      </div>

      {/* Stats List */}
      {currentStats && currentStats.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">المركز</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">
                    {activeTab === "weekly" ? "الأسبوع" : "الشهر"}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">السنة</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStats.map((stat) => {
                  const center = centers.find((c) => c._id === stat.healthCenterId);
                  return (
                    <tr key={stat._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{center?.name || "غير معروف"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {activeTab === "weekly" ? (stat as any).week : (stat as any).month}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{stat.year}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(stat.status)}`}>
                          {getStatusText(stat.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 space-x-reverse">
                        <button
                          onClick={() => setReviewModal({ id: stat._id, type: activeTab, data: JSON.parse(stat.data) })}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          عرض
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد إحصائيات</h3>
          <p className="text-gray-600">لا توجد إحصائيات للمراجعة حالياً</p>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 text-start">
                مراجعة الإحصائيات {reviewModal.type === "weekly" ? "الأسبوعية" : "الشهرية"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 text-start">أنشطة التوعية</p>
                  <p className="text-2xl font-bold text-blue-600 text-start">{reviewModal.data.awarenessActivities || 0}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 text-start">الفحوصات الصحية</p>
                  <p className="text-2xl font-bold text-green-600 text-start">{reviewModal.data.healthScreenings || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 text-start">التطعيمات</p>
                  <p className="text-2xl font-bold text-purple-600 text-start">{reviewModal.data.vaccinations || 0}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 text-start">الزيارات المنزلية</p>
                  <p className="text-2xl font-bold text-orange-600 text-start">{reviewModal.data.homeVisits || 0}</p>
                </div>
                <div className="bg-pink-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 text-start">زيارات المدارس</p>
                  <p className="text-2xl font-bold text-pink-600 text-start">{reviewModal.data.schoolVisits || 0}</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 text-start">المستفيدون</p>
                  <p className="text-2xl font-bold text-indigo-600 text-start">{reviewModal.data.beneficiaries || 0}</p>
                </div>
              </div>

              {reviewModal.data.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2 text-start">ملاحظات المركز:</p>
                  <p className="text-gray-600 text-start">{reviewModal.data.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">ملاحظات المراجعة</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="أضف ملاحظاتك هنا..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => handleReview("approved")}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all"
              >
                ✓ قبول
              </button>
              <button
                onClick={() => handleReview("rejected")}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
              >
                ✗ رفض
              </button>
              <button
                onClick={() => {
                  setReviewModal(null);
                  setReviewNotes("");
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
