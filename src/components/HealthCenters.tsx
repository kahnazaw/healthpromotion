import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export default function HealthCenters() {
  const centers = useQuery(api.healthCenters.list);
  const createCenter = useMutation(api.healthCenters.create);
  const updateCenter = useMutation(api.healthCenters.update);
  const removeCenter = useMutation(api.healthCenters.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"healthCenters"> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCenter({ id: editingId, ...formData });
        toast.success("تم تحديث المركز بنجاح");
      } else {
        await createCenter(formData);
        toast.success("تم إضافة المركز بنجاح");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", location: "", phone: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ");
    }
  };

  const handleEdit = (center: any) => {
    setEditingId(center._id);
    setFormData({
      name: center.name,
      location: center.location,
      phone: center.phone,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"healthCenters">) => {
    if (confirm("هل أنت متأكد من حذف هذا المركز؟")) {
      try {
        await removeCenter({ id });
        toast.success("تم حذف المركز بنجاح");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "حدث خطأ");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 text-start">المراكز الصحية</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", location: "", phone: "" });
          }}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          + إضافة مركز جديد
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-start">
            {editingId ? "تعديل المركز" : "إضافة مركز جديد"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">اسم المركز</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-start"
                placeholder="مثال: مركز الرعاية الصحية الأولية"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الموقع</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-start"
                placeholder="مثال: الرياض - حي النخيل"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-start"
                placeholder="مثال: 0501234567"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                {editingId ? "تحديث" : "إضافة"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: "", location: "", phone: "" });
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {!centers ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : centers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-5xl">🏥</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد مراكز صحية</h3>
          <p className="text-gray-600 mb-6">ابدأ بإضافة أول مركز صحي</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center) => (
            <div key={center._id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-2xl">🏥</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  center.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {center.isActive ? "نشط" : "غير نشط"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-start">{center.name}</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 flex items-center gap-2 text-start">
                  <span>📍</span>
                  <span>{center.location}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 text-start">
                  <span>📞</span>
                  <span>{center.phone}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(center)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(center._id)}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
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
