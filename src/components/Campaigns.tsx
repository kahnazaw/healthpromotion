import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export default function Campaigns() {
  const campaigns = useQuery(api.campaigns.list);
  const centers = useQuery(api.healthCenters.list);
  const createCampaign = useMutation(api.campaigns.create);
  const updateStatus = useMutation(api.campaigns.updateStatus);
  const removeCampaign = useMutation(api.campaigns.remove);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    healthCenterId: "",
    targetAudience: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCampaign({
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
        healthCenterId: formData.healthCenterId as Id<"healthCenters">,
        targetAudience: formData.targetAudience,
      });
      toast.success("تم إضافة الحملة بنجاح");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        healthCenterId: "",
        targetAudience: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ");
    }
  };

  const handleStatusChange = async (id: Id<"campaigns">, status: string) => {
    try {
      await updateStatus({ id, status });
      toast.success("تم تحديث حالة الحملة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ");
    }
  };

  const handleDelete = async (id: Id<"campaigns">) => {
    if (confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
      try {
        await removeCampaign({ id });
        toast.success("تم حذف الحملة بنجاح");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "حدث خطأ");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "planned": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "نشطة";
      case "completed": return "مكتملة";
      case "planned": return "مخططة";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 text-start">الحملات الصحية</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          + إضافة حملة جديدة
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-start">إضافة حملة جديدة</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">عنوان الحملة</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-start"
                placeholder="مثال: حملة التوعية بمرض السكري"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-start"
                placeholder="وصف تفصيلي للحملة..."
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">تاريخ البداية</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-start"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">تاريخ النهاية</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-start"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">المركز الصحي</label>
              <select
                value={formData.healthCenterId}
                onChange={(e) => setFormData({ ...formData, healthCenterId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-start"
                required
              >
                <option value="">اختر المركز الصحي</option>
                {centers?.map((center) => (
                  <option key={center._id} value={center._id}>{center.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الفئة المستهدفة</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-start"
                placeholder="مثال: جميع الفئات العمرية"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                إضافة الحملة
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {!campaigns ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-5xl">📢</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد حملات</h3>
          <p className="text-gray-600 mb-6">ابدأ بإضافة أول حملة صحية</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-2xl">📢</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {getStatusText(campaign.status)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-start">{campaign.title}</h3>
              <p className="text-sm text-gray-600 mb-4 text-start line-clamp-2">{campaign.description}</p>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 flex items-center gap-2 text-start">
                  <span>🏥</span>
                  <span>{campaign.centerName}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 text-start">
                  <span>👥</span>
                  <span>{campaign.targetAudience}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 text-start">
                  <span>📅</span>
                  <span>{new Date(campaign.startDate).toLocaleDateString("ar-SA")} - {new Date(campaign.endDate).toLocaleDateString("ar-SA")}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={campaign.status}
                  onChange={(e) => handleStatusChange(campaign._id, e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-start"
                >
                  <option value="planned">مخططة</option>
                  <option value="active">نشطة</option>
                  <option value="completed">مكتملة</option>
                </select>
                <button
                  onClick={() => handleDelete(campaign._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
