import DailyStatsForm from "../../../components/DailyStatsForm";

/**
 * صفحة الإحصائية اليومية لدائرة صحة كركوك - قطاع كركوك الأول
 * 
 * هذه الصفحة تعرض نموذج الإحصائية اليومية للمستخدمين
 * لملء تقاريرهم اليومية للأنشطة الصحية.
 */
export default function DailyStatsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DailyStatsForm />
    </div>
  );
}

