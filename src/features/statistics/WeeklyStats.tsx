import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import * as XLSX from "xlsx";

export default function WeeklyStats() {
  const centers = useQuery(api.healthCenters.list) || [];
  const [selectedCenter, setSelectedCenter] = useState<Id<"healthCenters"> | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [showForm, setShowForm] = useState(false);

  const currentStats = useQuery(
    api.weeklyStats.get,
    selectedCenter
      ? { week: selectedWeek, year: selectedYear, healthCenterId: selectedCenter }
      : "skip"
  );

  const allStats = useQuery(api.weeklyStats.listByCenter, selectedCenter ? { healthCenterId: selectedCenter } : "skip");

  const createOrUpdate = useMutation(api.weeklyStats.createOrUpdate);
  const submit = useMutation(api.weeklyStats.submit);
  const remove = useMutation(api.weeklyStats.remove);

  const [formData, setFormData] = useState({
    awarenessActivities: 0,
    healthScreenings: 0,
    vaccinations: 0,
    homeVisits: 0,
    schoolVisits: 0,
    beneficiaries: 0,
    distributedMaterials: 0,
    notes: "",
  });

  function getWeekNumber(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  const handleSave = async () => {
    if (!selectedCenter) {
      toast.error("الرجاء اختيار مركز صحي");
      return;
    }

    try {
      await createOrUpdate({
        week: selectedWeek,
        year: selectedYear,
        healthCenterId: selectedCenter,
        data: JSON.stringify(formData),
      });
      toast.success("تم حفظ الإحصائيات بنجاح");
      setShowForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ";
      toast.error(message);
    }
  };

  const handleSubmit = async (id: Id<"weeklyStats">) => {
    try {
      await submit({ id });
      toast.success("تم إرسال الإحصائيات للمراجعة");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الإرسال";
      toast.error(message);
    }
  };

  const handleDelete = async (id: Id<"weeklyStats">) => {
    if (!confirm("هل أنت متأكد من حذف هذه الإحصائيات؟")) return;

    try {
      await remove({ id });
      toast.success("تم حذف الإحصائيات");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الحذف";
      toast.error(message);
    }
  };

  const exportToExcel = () => {
    if (!allStats || allStats.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const centerName = centers.find((c) => c._id === selectedCenter)?.name || "مركز صحي";
    const data = allStats.map((stat) => {
      const parsedData = JSON.parse(stat.data);
      return {
        "الأسبوع": stat.week,
        "السنة": stat.year,
        "أنشطة التوعية": parsedData.awarenessActivities,
        "الفحوصات الصحية": parsedData.healthScreenings,
        "التطعيمات": parsedData.vaccinations,
        "الزيارات المنزلية": parsedData.homeVisits,
        "زيارات المدارس": parsedData.schoolVisits,
        "المستفيدون": parsedData.beneficiaries,
        "المواد الموزعة": parsedData.distributedMaterials,
        "الحالة": getStatusText(stat.status),
        "ملاحظات": parsedData.notes || "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الإحصائيات الأسبوعية");
    XLSX.writeFile(wb, `${centerName}_احصائيات_اسبوعية_${selectedYear}.xlsx`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-start">الإحصائيات الأسبوعية</h2>
          <p className="text-gray-600 text-start mt-1">إدارة وتتبع الإحصائيات الأسبوعية للمراكز الصحية</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={!allStats || allStats.length === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>📥</span>
          <span>تصدير إلى Excel</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">المركز الصحي</label>
            <select
              value={selectedCenter || ""}
              onChange={(e) => setSelectedCenter(e.target.value as Id<"healthCenters">)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">اختر المركز</option>
              {centers.map((center) => (
                <option key={center._id} value={center._id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">السنة</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الأسبوع</label>
            <input
              type="number"
              min="1"
              max="52"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
        </div>

        {selectedCenter && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            {currentStats ? "تعديل الإحصائيات" : "إضافة إحصائيات جديدة"}
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 text-start">
                إحصائيات الأسبوع {selectedWeek} - {selectedYear}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">أنشطة التوعية</label>
                  <input
                    type="number"
                    value={formData.awarenessActivities}
                    onChange={(e) => setFormData({ ...formData, awarenessActivities: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الفحوصات الصحية</label>
                  <input
                    type="number"
                    value={formData.healthScreenings}
                    onChange={(e) => setFormData({ ...formData, healthScreenings: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">التطعيمات</label>
                  <input
                    type="number"
                    value={formData.vaccinations}
                    onChange={(e) => setFormData({ ...formData, vaccinations: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الزيارات المنزلية</label>
                  <input
                    type="number"
                    value={formData.homeVisits}
                    onChange={(e) => setFormData({ ...formData, homeVisits: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">زيارات المدارس</label>
                  <input
                    type="number"
                    value={formData.schoolVisits}
                    onChange={(e) => setFormData({ ...formData, schoolVisits: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">عدد المستفيدين</label>
                  <input
                    type="number"
                    value={formData.beneficiaries}
                    onChange={(e) => setFormData({ ...formData, beneficiaries: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">المواد الموزعة</label>
                  <input
                    type="number"
                    value={formData.distributedMaterials}
                    onChange={(e) => setFormData({ ...formData, distributedMaterials: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="أضف أي ملاحظات إضافية..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                حفظ
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats List */}
      {allStats && allStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">الأسبوع</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">السنة</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allStats.map((stat) => (
                  <tr key={stat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{stat.week}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{stat.year}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(stat.status)}`}>
                        {getStatusText(stat.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2 space-x-reverse">
                      {stat.status === "draft" && (
                        <>
                          <button
                            onClick={() => handleSubmit(stat._id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            إرسال
                          </button>
                          <button
                            onClick={() => handleDelete(stat._id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            حذف
                          </button>
                        </>
                      )}
                      {stat.reviewNotes && (
                        <span className="text-gray-600" title={stat.reviewNotes}>
                          💬
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
