import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// تحميل خط عربي (Amiri)
const loadArabicFont = async (doc: jsPDF) => {
  // استخدام خط افتراضي يدعم العربية
  doc.setFont("helvetica");
};

export interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  planned: number;
}

export interface ActivityStats {
  total: number;
  totalAttendees: number;
  byType: Record<string, number>;
}

export interface DashboardStats {
  healthCenters: { total: number; active: number };
  campaigns: { total: number; active: number };
  activities: { total: number; totalAttendees: number };
  posters: { total: number };
}

export const exportToPDF = async (
  campaignStats: CampaignStats,
  activityStats: ActivityStats,
  dashboardStats: DashboardStats
) => {
  const doc = new jsPDF();
  
  await loadArabicFont(doc);

  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text("Health Campaigns Platform Report", 105, 20, { align: "center" });
  doc.text("تقرير منصة الحملات الصحية", 105, 30, { align: "center" });

  // التاريخ
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const date = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Date / التاريخ: ${date}`, 105, 40, { align: "center" });

  let yPosition = 55;

  // إحصائيات الحملات
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Campaign Statistics / إحصائيات الحملات", 20, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric / المقياس", "Value / القيمة"]],
    body: [
      ["Total Campaigns / إجمالي الحملات", campaignStats.total.toString()],
      ["Active Campaigns / حملات نشطة", campaignStats.active.toString()],
      ["Completed Campaigns / حملات مكتملة", campaignStats.completed.toString()],
      ["Planned Campaigns / حملات مخططة", campaignStats.planned.toString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { font: "helvetica", fontSize: 10 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // إحصائيات الأنشطة
  doc.setFontSize(14);
  doc.text("Activity Statistics / إحصائيات الأنشطة", 20, yPosition);
  yPosition += 10;

  const activityTypeLabels: Record<string, string> = {
    awareness_session: "Awareness Sessions / جلسات توعية",
    health_screening: "Health Screenings / فحوصات صحية",
    vaccination: "Vaccinations / تطعيمات",
    other: "Other / أخرى",
  };

  const activityBody = [
    ["Total Activities / إجمالي الأنشطة", activityStats.total.toString()],
    ["Total Beneficiaries / إجمالي المستفيدين", activityStats.totalAttendees.toLocaleString()],
    ...Object.entries(activityStats.byType).map(([type, count]) => [
      activityTypeLabels[type] || type,
      count.toString(),
    ]),
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric / المقياس", "Value / القيمة"]],
    body: activityBody,
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246], textColor: 255 },
    styles: { font: "helvetica", fontSize: 10 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // الإحصائيات العامة
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.text("Overall Statistics / الإحصائيات العامة", 20, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [["Category / الفئة", "Total / الإجمالي", "Active / النشط"]],
    body: [
      [
        "Health Centers / المراكز الصحية",
        dashboardStats.healthCenters.total.toString(),
        dashboardStats.healthCenters.active.toString(),
      ],
      [
        "Campaigns / الحملات",
        dashboardStats.campaigns.total.toString(),
        dashboardStats.campaigns.active.toString(),
      ],
      [
        "Activities / الأنشطة",
        dashboardStats.activities.total.toString(),
        dashboardStats.activities.totalAttendees.toLocaleString() + " beneficiaries / مستفيد",
      ],
      [
        "Posters / البوسترات",
        dashboardStats.posters.total.toString(),
        "-",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { font: "helvetica", fontSize: 10 },
  });

  // حفظ الملف
  const fileName = `health-campaigns-report-${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

export const exportToCSV = (
  campaignStats: CampaignStats,
  activityStats: ActivityStats,
  dashboardStats: DashboardStats
) => {
  const date = new Date().toLocaleDateString("ar-SA");
  
  let csvContent = "Health Campaigns Platform Report / تقرير منصة الحملات الصحية\n";
  csvContent += `Date / التاريخ,${date}\n\n`;

  // إحصائيات الحملات
  csvContent += "Campaign Statistics / إحصائيات الحملات\n";
  csvContent += "Metric / المقياس,Value / القيمة\n";
  csvContent += `Total Campaigns / إجمالي الحملات,${campaignStats.total}\n`;
  csvContent += `Active Campaigns / حملات نشطة,${campaignStats.active}\n`;
  csvContent += `Completed Campaigns / حملات مكتملة,${campaignStats.completed}\n`;
  csvContent += `Planned Campaigns / حملات مخططة,${campaignStats.planned}\n\n`;

  // إحصائيات الأنشطة
  csvContent += "Activity Statistics / إحصائيات الأنشطة\n";
  csvContent += "Metric / المقياس,Value / القيمة\n";
  csvContent += `Total Activities / إجمالي الأنشطة,${activityStats.total}\n`;
  csvContent += `Total Beneficiaries / إجمالي المستفيدين,${activityStats.totalAttendees}\n`;

  const activityTypeLabels: Record<string, string> = {
    awareness_session: "Awareness Sessions / جلسات توعية",
    health_screening: "Health Screenings / فحوصات صحية",
    vaccination: "Vaccinations / تطعيمات",
    other: "Other / أخرى",
  };

  Object.entries(activityStats.byType).forEach(([type, count]) => {
    csvContent += `${activityTypeLabels[type] || type},${count}\n`;
  });

  csvContent += "\n";

  // الإحصائيات العامة
  csvContent += "Overall Statistics / الإحصائيات العامة\n";
  csvContent += "Category / الفئة,Total / الإجمالي,Active / النشط\n";
  csvContent += `Health Centers / المراكز الصحية,${dashboardStats.healthCenters.total},${dashboardStats.healthCenters.active}\n`;
  csvContent += `Campaigns / الحملات,${dashboardStats.campaigns.total},${dashboardStats.campaigns.active}\n`;
  csvContent += `Activities / الأنشطة,${dashboardStats.activities.total},${dashboardStats.activities.totalAttendees}\n`;
  csvContent += `Posters / البوسترات,${dashboardStats.posters.total},-\n`;

  // إنشاء وتحميل الملف
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `health-campaigns-report-${new Date().getTime()}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
