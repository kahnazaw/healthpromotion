import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function UserRegistration() {
  const currentProfile = useQuery(api.userManagement.getCurrentUserProfile);
  const createProfile = useMutation(api.userManagement.createUserProfile);

  const [healthCenterName, setHealthCenterName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!healthCenterName.trim()) {
      toast.error("الرجاء إدخال اسم المركز الصحي");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProfile({
        healthCenterName: healthCenterName.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success("تم إرسال طلب التسجيل بنجاح");
      setHealthCenterName("");
      setPhone("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentProfile) {
    if (currentProfile.status === "pending") {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">⏳</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">طلبك قيد المراجعة</h2>
            <p className="text-gray-600 mb-6">
              تم إرسال طلب التسجيل الخاص بك بنجاح. سيتم مراجعته من قبل المدير وستصلك إشعار بالنتيجة قريباً.
            </p>
            <div className="bg-blue-50 rounded-xl p-4 text-start">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">المركز الصحي:</span> {currentProfile.healthCenterName}
              </p>
              {currentProfile.phone && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">رقم الهاتف:</span> {currentProfile.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentProfile.status === "rejected") {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">تم رفض طلب التسجيل</h2>
            <p className="text-gray-600 mb-6">
              نأسف لإبلاغك بأن طلب التسجيل الخاص بك تم رفضه.
            </p>
            {currentProfile.rejectionReason && (
              <div className="bg-red-50 rounded-xl p-4 text-start mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">سبب الرفض:</p>
                <p className="text-sm text-gray-600">{currentProfile.rejectionReason}</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              يمكنك التواصل مع الإدارة للمزيد من المعلومات
            </p>
          </div>
        </div>
      );
    }

    return null; // المستخدم موافق عليه، سيتم عرض التطبيق الرئيسي
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <img 
              src="/kirkuk-logo.png" 
              alt="شعار دائرة صحة كركوك"
              className="w-20 h-20 object-contain"
              onError={(e) => {
                // Fallback to Convex storage URL if local file doesn't exist
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("polished-pony-114.convex.cloud")) {
                  target.src = "https://polished-pony-114.convex.cloud/api/storage/b69b6463-3c48-4960-9c5b-e58e96902f2e";
                }
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">دائرة صحة كركوك - قطاع كركوك الأول</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">إكمال التسجيل</h2>
          <p className="text-gray-600">
            الرجاء إدخال معلوماتك لإكمال عملية التسجيل
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              اسم المركز الصحي <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={healthCenterName}
              onChange={(e) => setHealthCenterName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="مثال: مركز الرعاية الصحية الأولية"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              رقم الهاتف (اختياري)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="+964 XXX XXX XXXX"
            />
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-gray-700 text-start">
              <span className="font-semibold">ملاحظة:</span> سيتم مراجعة طلبك من قبل المدير وستصلك إشعار بالنتيجة.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
          </button>
        </form>
      </div>
    </div>
  );
}
