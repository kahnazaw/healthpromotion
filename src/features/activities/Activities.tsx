import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export default function Activities() {
  const campaigns = useQuery(api.campaigns.list);
  const [selectedCampaign, setSelectedCampaign] = useState<Id<"campaigns"> | "">("");
  const activities = useQuery(
    api.activities.listByCampaign,
    selectedCampaign ? { campaignId: selectedCampaign as Id<"campaigns"> } : "skip"
  );
  const createActivity = useMutation(api.activities.create);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    campaignId: "",
    activityType: "",
    date: "",
    location: "",
    attendees: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createActivity({
        campaignId: formData.campaignId as Id<"campaigns">,
        activityType: formData.activityType,
        date: new Date(formData.date).getTime(),
        location: formData.location,
        attendees: parseInt(formData.attendees),
        notes: formData.notes || undefined,
      });
      toast.success("تم إضافة النشاط بنجاح");
      setShowForm(false);
      setFormData({
        campaignId: "",
        activityType: "",
        date: "",
        location: "",
        attendees: "",
        notes: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ");
    }
  };

  const activityTypes = [
    { value: "awareness_session", label: "جلسة توعية", icon: "🎓" },
    { value: "health_screening", label: "فحص صحي", icon: "🔬" },
    { value: "vaccination", label: "تطعيم", icon: "💉" },
    { value: "other", label: "أخرى", icon: "📋" },
  ];

  const getActivityIcon = (type: string) => {
    const activity = activityTypes.find(a => a.value === type);
    return activity?.icon || "📋";
  };

  const getActivityLabel = (type: string) => {
    const activity = activityTypes.find(a => a.value === type);
    return activity?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 text-start">الأنشطة</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          + إضافة نشاط جديد
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-start">إضافة نشاط جديد</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الحملة</label>
              <select
                value={formData.campaignId}
                onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-start"
                required
              >
                <option value="">اختر الحملة</option>
                {campaigns?.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>{campaign.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">نوع النشاط</label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-start"
                required
              >
                <option value="">اختر نوع النشاط</option>
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">التاريخ</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-start"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">عدد الحضور</label>
                <input
                  type="number"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-start"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الموقع</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-start"
                placeholder="مثال: قاعة المؤتمرات"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">ملاحظات (اختياري)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-start"
                placeholder="أي ملاحظات إضافية..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                إضافة النشاط
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

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-start">تصفية حسب الحملة</label>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value as Id<"campaigns"> | "")}
            className="w-full md:w-96 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-start"
          >
            <option value="">جميع الحملات</option>
            {campaigns?.map((campaign) => (
              <option key={campaign._id} value={campaign._id}>{campaign.title}</option>
            ))}
          </select>
        </div>

        {!selectedCampaign ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-5xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">اختر حملة لعرض الأنشطة</h3>
            <p className="text-gray-600">حدد حملة من القائمة أعلاه</p>
          </div>
        ) : !activities ? (
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
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-5xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد أنشطة</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة أنشطة لهذه الحملة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity._id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{getActivityIcon(activity.activityType)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-start">{getActivityLabel(activity.activityType)}</h3>
                  <p className="text-sm text-gray-600 text-start">{activity.location} • {activity.attendees} مستفيد</p>
                  {activity.notes && (
                    <p className="text-sm text-gray-500 text-start mt-1">{activity.notes}</p>
                  )}
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
  );
}
