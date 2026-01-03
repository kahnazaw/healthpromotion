import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function SuperAdminSetup() {
  const currentProfile = useQuery(api.userManagement.getCurrentUserProfile);
  const setSuperAdmin = useMutation(api.userManagement.setSuperAdmin);
  const [isLoading, setIsLoading] = useState(false);

  // إخفاء الزر إذا كان المستخدم لديه ملف تعريف بالفعل
  if (currentProfile) {
    return null;
  }

  const handleSetSuperAdmin = async () => {
    if (!confirm("هل أنت متأكد من تعيين نفسك كمدير افتراضي؟ هذا الإجراء يتم مرة واحدة فقط.")) {
      return;
    }

    setIsLoading(true);
    try {
      await setSuperAdmin({});
      toast.success("تم تعيينك كمدير افتراضي بنجاح! 🎉");
      // إعادة تحميل الصفحة لتحديث الواجهة
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={handleSetSuperAdmin}
        disabled={isLoading}
        className="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 animate-pulse"
      >
        <span className="text-2xl">👑</span>
        <div className="text-start">
          <p className="text-sm font-normal">إعداد أولي</p>
          <p className="text-base">تعييني كمدير افتراضي</p>
        </div>
      </button>
    </div>
  );
}
