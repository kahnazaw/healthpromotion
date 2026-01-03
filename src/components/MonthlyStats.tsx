import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

// هيكل البيانات الإحصائية
interface StatsData {
  [category: string]: {
    [topic: string]: {
      individual: number;
      lectures: number;
      seminars: number;
      events: number;
    };
  };
}

// المواضيع حسب الفئات
const CATEGORIES = {
  motherChild: {
    title: "رعاية الأم والطفل",
    topics: [
      { key: "premarital", label: "فحص ما قبل الزواج" },
      { key: "prenatal", label: "رعاية الحامل والزيارات الدورية" },
      { key: "vaccine", label: "لقاح الحامل" },
      { key: "nutrition", label: "تغذية الحامل" },
      { key: "highrisk", label: "الحوامل المعرضات للخطورة" },
      { key: "postpartum", label: "فحص ما بعد الولادة" },
      { key: "familyPlanning", label: "تنظيم الأسرة" },
      { key: "womenHealth", label: "صحة المرأة فترة الأمان" },
      { key: "breastCancer", label: "سرطان الثدي" },
      { key: "breastfeeding", label: "الرضاعة من الثدي" },
      { key: "complementaryFood", label: "الأغذية التكميلية للأطفال" },
      { key: "diarrhea", label: "الأسهال عند الأطفال" },
      { key: "respiratory", label: "الألتهابات التنفسية عند الأطفال" },
    ],
  },
  immunization: {
    title: "التحصين",
    topics: [
      { key: "children", label: "لقاح الأطفال" },
      { key: "mothers", label: "لقاح الأمهات في سن الأنجاب" },
      { key: "new", label: "اللقاحات الجديدة ضمن الجدول الروتيني" },
      { key: "campaigns", label: "الحملات التلقيحية" },
      { key: "other", label: "اللقاحات الأخرى (الكبد-انفلونزا-تيفوئيد)" },
    ],
  },
  infectious: {
    title: "الأمراض الانتقالية",
    topics: [
      { key: "cholera", label: "الكوليرا" },
      { key: "flu", label: "الأنفلونزا الوبائية" },
      { key: "typhoid", label: "التايفوئيد" },
      { key: "foodPoisoning", label: "التسمم الغذائي" },
      { key: "hepatitis", label: "الكبد الفيروسي" },
      { key: "tuberculosis", label: "التدرن" },
      { key: "aids", label: "الأيدز" },
      { key: "std", label: "الأمراض المنقولة جنسيا" },
      { key: "hemorrhagic", label: "الحمى النزفية" },
      { key: "leishmaniasis", label: "اللشمانيا وانواعها" },
      { key: "schistosomiasis", label: "البلهارزيا" },
      { key: "parasites", label: "الطفيليات المعوية" },
      { key: "rabies", label: "داء الكلب" },
    ],
  },
  ncd: {
    title: "الأمراض غير الانتقالية",
    topics: [
      { key: "diabetes", label: "أمراض الضغط والسكر" },
      { key: "heart", label: "أمراض القلب والشرايين" },
      { key: "osteoporosis", label: "هشاشة العظام" },
      { key: "healthyFood", label: "الغذاء الصحي" },
      { key: "obesity", label: "السمنة" },
      { key: "iodizedSalt", label: "استعمال الملح المدعم باليود" },
      { key: "anemia", label: "فقر الدم" },
      { key: "vitaminA", label: "فيتامين A" },
      { key: "physicalActivity", label: "النشاط البدني" },
      { key: "thalassemia", label: "الثلاسيميا" },
    ],
  },
  mentalHealth: {
    title: "الصحة النفسية",
    topics: [
      { key: "youth", label: "اليافعين والشباب" },
      { key: "smoking", label: "التدخين" },
      { key: "drugs", label: "المخدرات" },
      { key: "violence", label: "العنف الأسري" },
    ],
  },
  other: {
    title: "مواضيع أخرى",
    topics: [
      { key: "firstAid", label: "الأسعافات والسلامة المهنية" },
      { key: "hygiene", label: "النظافة العامة والشخصية" },
      { key: "drugMisuse", label: "سوء استخدام الادوية" },
      { key: "drugResistance", label: "المقاومة الدوائية" },
      { key: "healthEvents", label: "المناسبات الصحية" },
      { key: "other", label: "أخرى" },
    ],
  },
};

export default function MonthlyStats() {
  const healthCenters = useQuery(api.healthCenters.list) || [];
  const [selectedCenter, setSelectedCenter] = useState<Id<"healthCenters"> | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const existingStats = useQuery(
    api.monthlyStats.get,
    selectedCenter
      ? { month: selectedMonth, year: selectedYear, healthCenterId: selectedCenter }
      : "skip"
  );

  const createOrUpdate = useMutation(api.monthlyStats.createOrUpdate);

  // تهيئة البيانات
  const [statsData, setStatsData] = useState<StatsData>(() => {
    const initialData: StatsData = {};
    Object.entries(CATEGORIES).forEach(([catKey, category]) => {
      initialData[catKey] = {};
      category.topics.forEach((topic) => {
        initialData[catKey][topic.key] = {
          individual: 0,
          lectures: 0,
          seminars: 0,
          events: 0,
        };
      });
    });
    return initialData;
  });

  // تحميل البيانات الموجودة
  useState(() => {
    if (existingStats?.data) {
      try {
        const parsed = JSON.parse(existingStats.data);
        setStatsData(parsed);
      } catch (e) {
        console.error("Error parsing stats data:", e);
      }
    }
  });

  const handleInputChange = (
    category: string,
    topic: string,
    field: "individual" | "lectures" | "seminars" | "events",
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setStatsData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [topic]: {
          ...prev[category][topic],
          [field]: numValue,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedCenter) {
      toast.error("يرجى اختيار المركز الصحي");
      return;
    }

    try {
      await createOrUpdate({
        month: selectedMonth,
        year: selectedYear,
        healthCenterId: selectedCenter,
        data: JSON.stringify(statsData),
      });
      toast.success("تم حفظ الإحصائيات بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ");
    }
  };

  const calculateTotal = (category: string, field: "individual" | "lectures" | "seminars" | "events") => {
    return Object.values(statsData[category] || {}).reduce((sum, topic) => sum + topic[field], 0);
  };

  const calculateGrandTotal = (field: "individual" | "lectures" | "seminars" | "events") => {
    return Object.keys(CATEGORIES).reduce((sum, cat) => sum + calculateTotal(cat, field), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-start">الإحصائيات الشهرية</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">المركز الصحي</label>
            <select
              value={selectedCenter || ""}
              onChange={(e) => setSelectedCenter(e.target.value as Id<"healthCenters">)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">اختر المركز الصحي</option>
              {healthCenters.map((center) => (
                <option key={center._id} value={center._id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الشهر</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleDateString("ar-IQ", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">السنة</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Table */}
      {selectedCenter && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-b from-blue-50 to-blue-100">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">ت</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">المواضيع</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">اللقاءات الفردية</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">المحاضرات</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الندوات</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">المناسبات الصحية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(CATEGORIES).map(([catKey, category], catIndex) => (
                  <>
                    {/* Category Header */}
                    <tr key={`cat-${catKey}`} className="bg-blue-50">
                      <td className="px-4 py-3 font-bold text-gray-900">{catIndex + 1}</td>
                      <td colSpan={5} className="px-4 py-3 font-bold text-gray-900 text-start">
                        {category.title}
                      </td>
                    </tr>
                    {/* Topics */}
                    {category.topics.map((topic) => (
                      <tr key={`${catKey}-${topic.key}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-gray-700 text-start">{topic.label}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={statsData[catKey]?.[topic.key]?.individual || 0}
                            onChange={(e) => handleInputChange(catKey, topic.key, "individual", e.target.value)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={statsData[catKey]?.[topic.key]?.lectures || 0}
                            onChange={(e) => handleInputChange(catKey, topic.key, "lectures", e.target.value)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={statsData[catKey]?.[topic.key]?.seminars || 0}
                            onChange={(e) => handleInputChange(catKey, topic.key, "seminars", e.target.value)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={statsData[catKey]?.[topic.key]?.events || 0}
                            onChange={(e) => handleInputChange(catKey, topic.key, "events", e.target.value)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
                {/* Grand Total */}
                <tr className="bg-gradient-to-r from-blue-100 to-purple-100 font-bold">
                  <td colSpan={2} className="px-4 py-3 text-gray-900 text-start">
                    المجموع
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">{calculateGrandTotal("individual")}</td>
                  <td className="px-4 py-3 text-center text-gray-900">{calculateGrandTotal("lectures")}</td>
                  <td className="px-4 py-3 text-center text-gray-900">{calculateGrandTotal("seminars")}</td>
                  <td className="px-4 py-3 text-center text-gray-900">{calculateGrandTotal("events")}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              💾 حفظ الإحصائيات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
