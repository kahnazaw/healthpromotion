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

// تعريف schema للتحقق - ديناميكي
const subItemSchema = z.object({
  individualMeetings: z.number().min(0).default(0),
  lectures: z.number().min(0).default(0),
  seminars: z.number().min(0).default(0),
  healthEvents: z.number().min(0).default(0),
});

// Schema مرن - يقبل أي topicId مع nested structure
const flexibleSchema = z.record(
  z.string(),
  z.object({
    individualMeetings: z.number().min(0),
    lectures: z.number().min(0),
    seminars: z.number().min(0),
    healthEvents: z.number().min(0),
  })
);

export default function DailyStatsForm() {
  const userProfile = useQuery(api.userManagement.getCurrentUserProfile);
  const centers = useQuery(api.healthCenters.list) || [];
  const categories = useQuery(api.statCategories.list, { includeInactive: false }) || [];
  const allTopics = useQuery(api.statTopics.list, { includeInactive: false }) || [];
  const submitDailyReport = useMutation(api.stats.submitDailyReport);

  // تجميع المواضيع حسب التصنيف
  const topicsByCategory = categories.reduce((acc: Record<string, typeof allTopics>, category: any) => {
    const categoryTopics = allTopics
      .filter((topic: any) => topic.categoryId === category._id && topic.isActive)
      .sort((a: any, b: any) => a.order - b.order);
    acc[category._id] = categoryTopics;
    return acc;
  }, {} as Record<string, typeof allTopics>);

  // المواضيع النشطة
  const activeTopics = allTopics.filter((t: any) => t.isActive);

  type DailyStatsFormData = z.infer<typeof flexibleSchema>;

  // القيم الافتراضية
  const getDefaultValues = (): any => {
    const defaults: any = {};
    activeTopics.forEach((topic: any) => {
      defaults[topic._id] = {
        individualMeetings: 0,
        lectures: 0,
        seminars: 0,
        healthEvents: 0,
      };
    });
    return defaults;
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DailyStatsFormData>({
    resolver: zodResolver(flexibleSchema),
    defaultValues: getDefaultValues(),
  });

  // تحديد التاريخ الحالي كافتراضي
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [selectedCenterId, setSelectedCenterId] = useState<Id<"healthCenters"> | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

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

  // تحديد التبويب الأول كافتراضي
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]._id);
    }
  }, [categories, activeTab]);

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

      // البيانات جاهزة بالفعل في format nested (topicId -> subItem)
      await submitDailyReport({
        healthCenterId: selectedCenterId,
        submissionDate,
        status: "draft",
        data: data as any,
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

      // تحويل البيانات إلى format record (topicId as string -> subItem)
      const dataRecord: Record<string, any> = {};
      activeTopics.forEach((topic: any) => {
        const topicId = topic._id as string;
        if (data[topicId]) {
          dataRecord[topicId] = {
            individualMeetings: data[topicId].individualMeetings || 0,
            lectures: data[topicId].lectures || 0,
            seminars: data[topicId].seminars || 0,
            healthEvents: data[topicId].healthEvents || 0,
          };
        } else {
          dataRecord[topicId] = {
            individualMeetings: 0,
            lectures: 0,
            seminars: 0,
            healthEvents: 0,
          };
        }
      });

      await submitDailyReport({
        healthCenterId: selectedCenterId,
        submissionDate,
        status: "submitted",
        data: dataRecord,
      });

      toast.success("تم إرسال التقرير بنجاح");
      reset(); // إعادة تعيين النموذج بعد الإرسال
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const renderTopicRow = (topic: any, category: any) => {
    return (
      <tr key={topic._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <td className="px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-gray-900 text-start">
          {topic.nameAr}
        </td>
        <td className="px-1 sm:px-2 py-2">
          <Controller
            name={`${topic._id}.individualMeetings` as any}
            control={control}
            render={({ field }) => {
              const topicData = watch(topic._id as any) || {
                individualMeetings: 0,
                lectures: 0,
                seminars: 0,
                healthEvents: 0,
              };
              return (
                <Input
                  type="number"
                  min="0"
                  value={topicData.individualMeetings || 0}
                  onChange={(e) => {
                    const value = Number(e.target.value) || 0;
                    setValue(topic._id as any, {
                      ...topicData,
                      individualMeetings: value,
                    });
                  }}
                  className="w-full text-center text-sm sm:text-base"
                  dir="ltr"
                  placeholder="0"
                />
              );
            }}
          />
        </td>
        <td className="px-1 sm:px-2 py-2">
          <Controller
            name={`${topic._id}.lectures` as any}
            control={control}
            render={({ field }) => {
              const topicData = watch(topic._id as any) || {
                individualMeetings: 0,
                lectures: 0,
                seminars: 0,
                healthEvents: 0,
              };
              return (
                <Input
                  type="number"
                  min="0"
                  value={topicData.lectures || 0}
                  onChange={(e) => {
                    const value = Number(e.target.value) || 0;
                    setValue(topic._id as any, {
                      ...topicData,
                      lectures: value,
                    });
                  }}
                  className="w-full text-center text-sm sm:text-base"
                  dir="ltr"
                  placeholder="0"
                />
              );
            }}
          />
        </td>
        <td className="px-1 sm:px-2 py-2">
          <Controller
            name={`${topic._id}.seminars` as any}
            control={control}
            render={({ field }) => {
              const topicData = watch(topic._id as any) || {
                individualMeetings: 0,
                lectures: 0,
                seminars: 0,
                healthEvents: 0,
              };
              return (
                <Input
                  type="number"
                  min="0"
                  value={topicData.seminars || 0}
                  onChange={(e) => {
                    const value = Number(e.target.value) || 0;
                    setValue(topic._id as any, {
                      ...topicData,
                      seminars: value,
                    });
                  }}
                  className="w-full text-center text-sm sm:text-base"
                  dir="ltr"
                  placeholder="0"
                />
              );
            }}
          />
        </td>
        <td className="px-1 sm:px-2 py-2">
          <Controller
            name={`${topic._id}.healthEvents` as any}
            control={control}
            render={({ field }) => {
              const topicData = watch(topic._id as any) || {
                individualMeetings: 0,
                lectures: 0,
                seminars: 0,
                healthEvents: 0,
              };
              return (
                <Input
                  type="number"
                  min="0"
                  value={topicData.healthEvents || 0}
                  onChange={(e) => {
                    const value = Number(e.target.value) || 0;
                    setValue(topic._id as any, {
                      ...topicData,
                      healthEvents: value,
                    });
                  }}
                  className="w-full text-center text-sm sm:text-base"
                  dir="ltr"
                  placeholder="0"
                />
              );
            }}
          />
        </td>
      </tr>
    );
  };

  const renderCategoryTab = (category: any, index: number) => {
    const topics = topicsByCategory[category._id] || [];

    return (
      <TabsContent key={category._id} value={category._id} className="mt-4">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
          {topics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد مواضيع في هذا التصنيف</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="px-3 sm:px-4 py-3 text-sm sm:text-base font-bold text-gray-900 text-start">
                      الموضوع
                    </th>
                    <th className="px-1 sm:px-2 py-2 text-xs sm:text-sm font-semibold text-gray-700 text-center min-w-[100px]">
                      اللقاءات الفردية
                    </th>
                    <th className="px-1 sm:px-2 py-2 text-xs sm:text-sm font-semibold text-gray-700 text-center min-w-[100px]">
                      المحاضرات
                    </th>
                    <th className="px-1 sm:px-2 py-2 text-xs sm:text-sm font-semibold text-gray-700 text-center min-w-[100px]">
                      الندوات
                    </th>
                    <th className="px-1 sm:px-2 py-2 text-xs sm:text-sm font-semibold text-gray-700 text-center min-w-[100px]">
                      المناسبات الصحية
                    </th>
                  </tr>
                </thead>
                <tbody>{topics.map((topic: any) => renderTopicRow(topic, category))}</tbody>
              </table>
            </div>
          )}
        </div>
      </TabsContent>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-600 mb-4">لا توجد تصنيفات متاحة حالياً</p>
        <p className="text-sm text-gray-500">يرجى التواصل مع المدير لإضافة التصنيفات والمواضيع</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2 h-auto overflow-x-auto">
              {categories.map((category: any) => (
                <TabsTrigger
                  key={category._id}
                  value={category._id}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-normal"
                >
                  {category.order}. {category.nameAr}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents */}
          {categories.map((category: any, index: number) => renderCategoryTab(category, index))}
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
