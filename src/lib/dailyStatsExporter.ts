import * as XLSX from "xlsx";

// تعريف أسماء التصنيفات والعناصر (مطابقة لـ stats_template.txt)
const categoryLabels = {
  maternalChildHealth: {
    title: "1",
    name: "رعاية الأم والطفل:",
    items: [
      { key: "preMarriageExamination", label: "فحص ما قبل الزواج" },
      { key: "pregnancyCareVisits", label: "رعاية الحامل والزيارات الدورية" },
      { key: "pregnantVaccination", label: "لقاح الحامل" },
      { key: "pregnantNutrition", label: "تغذية الحامل" },
      { key: "highRiskPregnant", label: "الحوامل المعرضات للخطورة" },
      { key: "postDeliveryExamination", label: "فحص ما بعد الولادة" },
      { key: "familyPlanning", label: "تنظيم الأسرة" },
      { key: "womenSafePeriod", label: "صحة المرأة فترة الأمان" },
      { key: "breastCancer", label: "سرطان الثدي" },
      { key: "breastfeeding", label: "الرضاعة من الثدي" },
      { key: "childrenComplementaryFood", label: "الأغذية التكميلية للأطفال" },
      { key: "childrenDiarrhea", label: "الأسهال عند الأطفال" },
      { key: "childrenRespiratoryInfections", label: "الألتهابات التنفسية عند الأطفال" },
    ],
  },
  immunization: {
    title: "2",
    name: "التحصين:",
    items: [
      { key: "childrenVaccination", label: "لقاح الأطفال" },
      { key: "reproductiveAgeMothersVaccination", label: "لقاح الأمهات في سن الأنجاب" },
      { key: "newRoutineVaccines", label: "اللقاحات الجديدة ضمن الجدول الروتيني" },
      { key: "vaccinationCampaigns", label: "الحملات التلقيحية" },
      { key: "otherVaccines", label: "اللقاحات الأخرى( الكبد-انفلونزا-تيفوئيد ..)" },
    ],
  },
  communicableDiseases: {
    title: "3",
    name: "الأمراض الانتقالية:",
    items: [
      { key: "cholera", label: "الكوليرا" },
      { key: "pandemicInfluenza", label: "الأنفلونزا الوبائية" },
      { key: "typhoid", label: "التايفوئيد" },
      { key: "foodPoisoning", label: "التسمم الغذائي" },
      { key: "viralHepatitis", label: "الكبد الفيروسي" },
      { key: "tuberculosis", label: "التدرن" },
      { key: "aids", label: "الأيدز" },
      { key: "sexuallyTransmittedDiseases", label: "الأمراض المنقولة جنسيا" },
      { key: "hemorrhagicFever", label: "الحمى النزفية" },
      { key: "leishmaniasis", label: "اللشمانيا وانواعها" },
      { key: "bilharzia", label: "البلهارزيا" },
      { key: "intestinalParasites", label: "الطفيليات المعوية" },
      { key: "rabies", label: "داء الكلب" },
    ],
  },
  nonCommunicableDiseases: {
    title: "4",
    name: "الأمراض غير الانتقالية:",
    items: [
      { key: "hypertensionDiabetes", label: "أمراض الضغط والسكر" },
      { key: "heartDiseases", label: "أمراض القلب والشرايين" },
      { key: "osteoporosis", label: "هشاشة العظام" },
      { key: "healthyNutrition", label: "الغذاء الصحي" },
      { key: "obesity", label: "السمنة" },
      { key: "iodizedSalt", label: "استعمال الملح المدعم باليود" },
      { key: "anemia", label: "فقر الدم" },
      { key: "vitaminA", label: "فيتامين A" },
      { key: "physicalActivity", label: "النشاط البدني" },
      { key: "thalassemia", label: "الثلاسيميا" },
    ],
  },
  mentalHealth: {
    title: "5",
    name: "الصحة النفسية:",
    items: [
      { key: "adolescentsYouth", label: "اليافعين والشباب" },
      { key: "smoking", label: "التدخين" },
      { key: "drugs", label: "المخدرات" },
      { key: "domesticViolence", label: "العنف الأسري" },
    ],
  },
  firstAidOccupationalSafety: {
    title: "6",
    name: "الأسعافات والسلامة المهنية",
    items: null,
  },
  generalPersonalHygiene: {
    title: "7",
    name: "النظافة العامة والشخصية",
    items: null,
  },
  drugMisuse: {
    title: "8",
    name: "سوء استخدام الادوية",
    items: null,
  },
  drugResistance: {
    title: "9",
    name: "المقاومة الدوائية",
    items: null,
  },
  healthEventsCategory: {
    title: "10",
    name: "المناسبات الصحية",
    items: null,
  },
  others: {
    title: "11",
    name: "أخرى",
    items: null,
  },
};

interface ConsolidatedData {
  maternalChildHealth: any;
  immunization: any;
  communicableDiseases: any;
  nonCommunicableDiseases: any;
  mentalHealth: any;
  firstAidOccupationalSafety: any;
  generalPersonalHygiene: any;
  drugMisuse: any;
  drugResistance: any;
  healthEventsCategory: any;
  others: any;
}

export function exportConsolidatedMonthlyReport(
  data: ConsolidatedData,
  month: number,
  year: number,
  totalCenters: number,
  totalReports: number
) {
  const workbook = XLSX.utils.book_new();

  // إنشاء ورقة العمل
  const worksheetData: any[][] = [];

  // الترويسة مع الشعار والعنوان
  worksheetData.push([]);
  worksheetData.push([]);
  worksheetData.push(["", "", "دائرة صحة كركوك - قطاع كركوك الأول", "", "", ""]);
  worksheetData.push(["", "", "وحدة تعزيز الصحة", "", "", ""]);
  worksheetData.push([]);
  worksheetData.push(["", "", `الإحصائية الموحدة للقطاع - ${getMonthName(month)} ${year}`, "", "", ""]);
  worksheetData.push([`عدد المراكز: ${totalCenters} | عدد التقارير: ${totalReports}`, "", "", "", "", ""]);
  worksheetData.push([]);

  // رأس الجدول
  worksheetData.push([
    "ت",
    "المواضيع",
    "اللقاءات الفردية",
    "المحاضرات",
    "الندوات",
    "المناسبات الصحية",
  ]);

  // إضافة البيانات لكل تصنيف
  Object.entries(categoryLabels).forEach(([categoryKey, category]) => {
    // إضافة عنوان التصنيف
    worksheetData.push([
      category.title,
      category.name,
      "",
      "",
      "",
      "",
    ]);

    // إضافة العناصر الفرعية
    if (category.items) {
      category.items.forEach((item) => {
        const itemData = data[categoryKey as keyof ConsolidatedData]?.[item.key];
        worksheetData.push([
          "",
          item.label,
          itemData?.individualMeetings || 0,
          itemData?.lectures || 0,
          itemData?.seminars || 0,
          itemData?.healthEvents || 0,
        ]);
      });
    } else {
      // عنصر مباشر (لا يحتوي على عناصر فرعية)
      const itemData = data[categoryKey as keyof ConsolidatedData];
      worksheetData.push([
        "",
        category.name,
        itemData?.individualMeetings || 0,
        itemData?.lectures || 0,
        itemData?.seminars || 0,
        itemData?.healthEvents || 0,
      ]);
    }

    // صف فارغ بعد كل تصنيف
    worksheetData.push([]);
  });

  // صف الإجمالي
  const totals = calculateTotals(data);
  worksheetData.push([
    "",
    "المجمـــــــــــــــــــــوع",
    totals.individualMeetings,
    totals.lectures,
    totals.seminars,
    totals.healthEvents,
  ]);

  // إنشاء ورقة العمل
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // تنسيق الأعمدة
  worksheet["!cols"] = [
    { wch: 5 },  // العمود الأول (الترقيم)
    { wch: 40 }, // العمود الثاني (المواضيع)
    { wch: 15 }, // اللقاءات الفردية
    { wch: 15 }, // المحاضرات
    { wch: 15 }, // الندوات
    { wch: 15 }, // المناسبات الصحية
  ];

  // تنسيق الصفوف
  const headerRow = worksheetData.findIndex((row) => row[0] === "ت");
  if (headerRow !== -1) {
    // تنسيق رأس الجدول
    const headerRange = XLSX.utils.encode_range({
      s: { r: headerRow, c: 0 },
      e: { r: headerRow, c: 5 },
    });
    if (!worksheet["!merges"]) worksheet["!merges"] = [];
    // يمكن إضافة merge للعناوين إذا لزم الأمر
  }

  // إضافة ورقة العمل إلى الكتاب
  XLSX.utils.book_append_sheet(workbook, worksheet, "الإحصائية الموحدة");

  // حفظ الملف
  const fileName = `الإحصائية_الموحدة_${year}_${month.toString().padStart(2, "0")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// دالة مساعدة لحساب الإجماليات
function calculateTotals(data: ConsolidatedData) {
  let totalIndividualMeetings = 0;
  let totalLectures = 0;
  let totalSeminars = 0;
  let totalHealthEvents = 0;

  // جمع من جميع التصنيفات
  Object.entries(categoryLabels).forEach(([categoryKey, category]) => {
    if (category.items) {
      category.items.forEach((item) => {
        const itemData = data[categoryKey as keyof ConsolidatedData]?.[item.key];
        totalIndividualMeetings += itemData?.individualMeetings || 0;
        totalLectures += itemData?.lectures || 0;
        totalSeminars += itemData?.seminars || 0;
        totalHealthEvents += itemData?.healthEvents || 0;
      });
    } else {
      const itemData = data[categoryKey as keyof ConsolidatedData];
      totalIndividualMeetings += itemData?.individualMeetings || 0;
      totalLectures += itemData?.lectures || 0;
      totalSeminars += itemData?.seminars || 0;
      totalHealthEvents += itemData?.healthEvents || 0;
    }
  });

  return {
    individualMeetings: totalIndividualMeetings,
    lectures: totalLectures,
    seminars: totalSeminars,
    healthEvents: totalHealthEvents,
  };
}

// دالة مساعدة للحصول على اسم الشهر بالعربية
function getMonthName(month: number): string {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  return months[month - 1] || "";
}

