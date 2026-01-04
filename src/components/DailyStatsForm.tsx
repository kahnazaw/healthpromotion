import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// تعريف schema للتحقق باستخدام zod
const subItemSchema = z.object({
  individualMeetings: z.number().min(0).default(0),
  lectures: z.number().min(0).default(0),
  seminars: z.number().min(0).default(0),
  healthEvents: z.number().min(0).default(0),
});

const dailyStatsSchema = z.object({
  maternalChildHealth: z.object({
    preMarriageExamination: subItemSchema,
    pregnancyCareVisits: subItemSchema,
    pregnantVaccination: subItemSchema,
    pregnantNutrition: subItemSchema,
    highRiskPregnant: subItemSchema,
    postDeliveryExamination: subItemSchema,
    familyPlanning: subItemSchema,
    womenSafePeriod: subItemSchema,
    breastCancer: subItemSchema,
    breastfeeding: subItemSchema,
    childrenComplementaryFood: subItemSchema,
    childrenDiarrhea: subItemSchema,
    childrenRespiratoryInfections: subItemSchema,
  }),
  immunization: z.object({
    childrenVaccination: subItemSchema,
    reproductiveAgeMothersVaccination: subItemSchema,
    newRoutineVaccines: subItemSchema,
    vaccinationCampaigns: subItemSchema,
    otherVaccines: subItemSchema,
  }),
  communicableDiseases: z.object({
    cholera: subItemSchema,
    pandemicInfluenza: subItemSchema,
    typhoid: subItemSchema,
    foodPoisoning: subItemSchema,
    viralHepatitis: subItemSchema,
    tuberculosis: subItemSchema,
    aids: subItemSchema,
    sexuallyTransmittedDiseases: subItemSchema,
    hemorrhagicFever: subItemSchema,
    leishmaniasis: subItemSchema,
    bilharzia: subItemSchema,
    intestinalParasites: subItemSchema,
    rabies: subItemSchema,
  }),
  nonCommunicableDiseases: z.object({
    hypertensionDiabetes: subItemSchema,
    heartDiseases: subItemSchema,
    osteoporosis: subItemSchema,
    healthyNutrition: subItemSchema,
    obesity: subItemSchema,
    iodizedSalt: subItemSchema,
    anemia: subItemSchema,
    vitaminA: subItemSchema,
    physicalActivity: subItemSchema,
    thalassemia: subItemSchema,
  }),
  mentalHealth: z.object({
    adolescentsYouth: subItemSchema,
    smoking: subItemSchema,
    drugs: subItemSchema,
    domesticViolence: subItemSchema,
  }),
  firstAidOccupationalSafety: subItemSchema,
  generalPersonalHygiene: subItemSchema,
  drugMisuse: subItemSchema,
  drugResistance: subItemSchema,
  healthEventsCategory: subItemSchema,
  others: subItemSchema,
});

type DailyStatsFormData = z.infer<typeof dailyStatsSchema>;

// تعريف أسماء التصنيفات والعناصر
const categoryLabels = {
  maternalChildHealth: {
    title: "1. رعاية الأم والطفل",
    items: {
      preMarriageExamination: "فحص ما قبل الزواج",
      pregnancyCareVisits: "رعاية الحامل والزيارات الدورية",
      pregnantVaccination: "لقاح الحامل",
      pregnantNutrition: "تغذية الحامل",
      highRiskPregnant: "الحوامل المعرضات للخطورة",
      postDeliveryExamination: "فحص ما بعد الولادة",
      familyPlanning: "تنظيم الأسرة",
      womenSafePeriod: "صحة المرأة فترة الأمان",
      breastCancer: "سرطان الثدي",
      breastfeeding: "الرضاعة من الثدي",
      childrenComplementaryFood: "الأغذية التكميلية للأطفال",
      childrenDiarrhea: "الأسهال عند الأطفال",
      childrenRespiratoryInfections: "الألتهابات التنفسية عند الأطفال",
    },
  },
  immunization: {
    title: "2. التحصين",
    items: {
      childrenVaccination: "لقاح الأطفال",
      reproductiveAgeMothersVaccination: "لقاح الأمهات في سن الأنجاب",
      newRoutineVaccines: "اللقاحات الجديدة ضمن الجدول الروتيني",
      vaccinationCampaigns: "الحملات التلقيحية",
      otherVaccines: "اللقاحات الأخرى",
    },
  },
  communicableDiseases: {
    title: "3. الأمراض الانتقالية",
    items: {
      cholera: "الكوليرا",
      pandemicInfluenza: "الأنفلونزا الوبائية",
      typhoid: "التايفوئيد",
      foodPoisoning: "التسمم الغذائي",
      viralHepatitis: "الكبد الفيروسي",
      tuberculosis: "التدرن",
      aids: "الأيدز",
      sexuallyTransmittedDiseases: "الأمراض المنقولة جنسيا",
      hemorrhagicFever: "الحمى النزفية",
      leishmaniasis: "اللشمانيا وانواعها",
      bilharzia: "البلهارزيا",
      intestinalParasites: "الطفيليات المعوية",
      rabies: "داء الكلب",
    },
  },
  nonCommunicableDiseases: {
    title: "4. الأمراض غير الانتقالية",
    items: {
      hypertensionDiabetes: "أمراض الضغط والسكر",
      heartDiseases: "أمراض القلب والشرايين",
      osteoporosis: "هشاشة العظام",
      healthyNutrition: "الغذاء الصحي",
      obesity: "السمنة",
      iodizedSalt: "استعمال الملح المدعم باليود",
      anemia: "فقر الدم",
      vitaminA: "فيتامين A",
      physicalActivity: "النشاط البدني",
      thalassemia: "الثلاسيميا",
    },
  },
  mentalHealth: {
    title: "5. الصحة النفسية",
    items: {
      adolescentsYouth: "اليافعين والشباب",
      smoking: "التدخين",
      drugs: "المخدرات",
      domesticViolence: "العنف الأسري",
    },
  },
  firstAidOccupationalSafety: {
    title: "6. الأسعافات والسلامة المهنية",
    items: null,
  },
  generalPersonalHygiene: {
    title: "7. النظافة العامة والشخصية",
    items: null,
  },
  drugMisuse: {
    title: "8. سوء استخدام الادوية",
    items: null,
  },
  drugResistance: {
    title: "9. المقاومة الدوائية",
    items: null,
  },
  healthEventsCategory: {
    title: "10. المناسبات الصحية",
    items: null,
  },
  others: {
    title: "11. أخرى",
    items: null,
  },
};

// القيم الافتراضية
const defaultValues: DailyStatsFormData = {
  maternalChildHealth: {
    preMarriageExamination: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    pregnancyCareVisits: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    pregnantVaccination: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    pregnantNutrition: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    highRiskPregnant: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    postDeliveryExamination: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    familyPlanning: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    womenSafePeriod: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    breastCancer: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    breastfeeding: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    childrenComplementaryFood: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    childrenDiarrhea: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    childrenRespiratoryInfections: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  },
  immunization: {
    childrenVaccination: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    reproductiveAgeMothersVaccination: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    newRoutineVaccines: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    vaccinationCampaigns: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    otherVaccines: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  },
  communicableDiseases: {
    cholera: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    pandemicInfluenza: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    typhoid: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    foodPoisoning: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    viralHepatitis: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    tuberculosis: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    aids: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    sexuallyTransmittedDiseases: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    hemorrhagicFever: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    leishmaniasis: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    bilharzia: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    intestinalParasites: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    rabies: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  },
  nonCommunicableDiseases: {
    hypertensionDiabetes: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    heartDiseases: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    osteoporosis: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    healthyNutrition: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    obesity: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    iodizedSalt: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    anemia: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    vitaminA: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    physicalActivity: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    thalassemia: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  },
  mentalHealth: {
    adolescentsYouth: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    smoking: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    drugs: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
    domesticViolence: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  },
  firstAidOccupationalSafety: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  generalPersonalHygiene: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  drugMisuse: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  drugResistance: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  healthEventsCategory: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
  others: { individualMeetings: 0, lectures: 0, seminars: 0, healthEvents: 0 },
};

export default function DailyStatsForm() {
  const userProfile = useQuery(api.userManagement.getCurrentUserProfile);
  const centers = useQuery(api.healthCenters.list) || [];
  const submitDailyReport = useMutation(api.stats.submitDailyReport);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DailyStatsFormData>({
    resolver: zodResolver(dailyStatsSchema),
    defaultValues,
  });

  // تحديد التاريخ الحالي كافتراضي
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [selectedCenterId, setSelectedCenterId] = useState<Id<"healthCenters"> | null>(null);

  // تحديد المركز الصحي تلقائياً
  useEffect(() => {
    if (userProfile && centers.length > 0) {
      if (userProfile.role === "admin" || userProfile.role === "super_admin") {
        if (!selectedCenterId && centers.length > 0) {
          setSelectedCenterId(centers[0]._id);
        }
      } else {
        const userCenter = centers.find(
          (center) => center.name === userProfile.healthCenterName
        );
        if (userCenter) {
          setSelectedCenterId(userCenter._id);
        }
      }
    }
  }, [userProfile, centers, selectedCenterId]);

  // التحقق من الصلاحيات
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const isAdmin = userProfile.role === "admin" || userProfile.role === "super_admin";
  const canSubmit = userProfile.role === "user" || isAdmin;

  if (!canSubmit) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-red-600 font-semibold">ليس لديك صلاحية لإدخال الإحصائيات اليومية</p>
      </div>
    );
  }

  const onSubmit = async (data: DailyStatsFormData) => {
    if (!selectedCenterId) {
      toast.error("الرجاء اختيار مركز صحي");
      return;
    }

    if (!selectedDate) {
      toast.error("الرجاء اختيار تاريخ");
      return;
    }

    try {
      const submissionDate = new Date(selectedDate).setHours(0, 0, 0, 0);

      await submitDailyReport({
        healthCenterId: selectedCenterId,
        submissionDate,
        status: "draft",
        ...data,
      });

      toast.success("تم حفظ التقرير بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const onSubmitFinal = async (data: DailyStatsFormData) => {
    if (!selectedCenterId) {
      toast.error("الرجاء اختيار مركز صحي");
      return;
    }

    if (!selectedDate) {
      toast.error("الرجاء اختيار تاريخ");
      return;
    }

    try {
      const submissionDate = new Date(selectedDate).setHours(0, 0, 0, 0);

      await submitDailyReport({
        healthCenterId: selectedCenterId,
        submissionDate,
        status: "submitted",
        ...data,
      });

      toast.success("تم إرسال التقرير بنجاح");
      reset(); // إعادة تعيين النموذج بعد الإرسال
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const renderSubItemCard = (
    category: string,
    itemKey: string,
    itemLabel: string
  ) => {
    return (
      <div
        key={itemKey}
        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <h4 className="text-sm font-semibold text-gray-900 mb-3 text-start">
          {itemLabel}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1 text-start">
              اللقاءات الفردية
            </label>
            <Controller
              name={`${category}.${itemKey}.individualMeetings` as any}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  className="w-full text-center text-sm"
                  dir="ltr"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1 text-start">
              المحاضرات
            </label>
            <Controller
              name={`${category}.${itemKey}.lectures` as any}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  className="w-full text-center text-sm"
                  dir="ltr"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1 text-start">
              الندوات
            </label>
            <Controller
              name={`${category}.${itemKey}.seminars` as any}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  className="w-full text-center text-sm"
                  dir="ltr"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1 text-start">
              المناسبات الصحية
            </label>
            <Controller
              name={`${category}.${itemKey}.healthEvents` as any}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  className="w-full text-center text-sm"
                  dir="ltr"
                />
              )}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderSingleItemCard = (category: string, categoryLabel: string) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 text-start">
          {categoryLabel}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1 text-start">
              اللقاءات الفردية
            </label>
            <Controller
              name={`${category}.individualMeetings` as any}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  className="w-full text-center text-sm"
                  dir="ltr"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1 text-start">
              المحاضرات
            </label>
            <Controller
              name={`${category}.lectures` as any}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  className="w-full text-center text-sm"
                  dir="ltr"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1 text-start">
              الندوات
            </label>
            <Controller
              name={`${category}.seminars` as any}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  className="w-full text-center text-sm"
                  dir="ltr"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1 text-start">
              المناسبات الصحية
            </label>
            <Controller
              name={`${category}.healthEvents` as any}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  className="w-full text-center text-sm"
                  dir="ltr"
                />
              )}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryTab = (categoryKey: string) => {
    const category = categoryLabels[categoryKey as keyof typeof categoryLabels];
    if (!category) return null;

    return (
      <TabsContent value={categoryKey} className="mt-4">
        <div className="space-y-4">
          {category.items
            ? Object.entries(category.items).map(([itemKey, itemLabel]) =>
                renderSubItemCard(categoryKey, itemKey, itemLabel)
              )
            : renderSingleItemCard(categoryKey, category.title)}
        </div>
      </TabsContent>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Logo and Title */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/kirkuk-logo.png"
            alt="شعار دائرة صحة كركوك"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes("polished-pony-114.convex.cloud")) {
                target.src = "https://polished-pony-114.convex.cloud/api/storage/b69b6463-3c48-4960-9c5b-e58e96902f2e";
              }
            }}
          />
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              استمارة الإحصاء اليومي
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              قطاع كركوك الأول
            </p>
          </div>
        </div>
      </div>

      {/* Date and Center Selection */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              التاريخ
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
              dir="ltr"
            />
          </div>
          {isAdmin && (
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                المركز الصحي
              </label>
              <select
                value={selectedCenterId || ""}
                onChange={(e) =>
                  setSelectedCenterId(e.target.value as Id<"healthCenters">)
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">اختر مركز</option>
                {centers.map((center) => (
                  <option key={center._id} value={center._id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!isAdmin && selectedCenterId && (
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                المركز الصحي
              </label>
              <Input
                type="text"
                value={
                  centers.find((c) => c._id === selectedCenterId)?.name || ""
                }
                disabled
                className="w-full bg-gray-50"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="maternalChildHealth" className="w-full">
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2 h-auto">
              {Object.entries(categoryLabels).map(([key, category]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-normal"
                >
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents */}
          {Object.keys(categoryLabels).map((categoryKey) =>
            renderCategoryTab(categoryKey)
          )}
        </Tabs>

        {/* Submit Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !selectedCenterId}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ كمسودة"}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmitFinal)}
              disabled={isSubmitting || !selectedCenterId}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {isSubmitting ? "جاري الإرسال..." : "إرسال التقرير"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
