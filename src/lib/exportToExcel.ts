import * as XLSX from "xlsx";
import { Id } from "../../convex/_generated/dataModel";

// Interface for aggregated data from getAggregatedStats
interface AggregatedData {
  [topicId: string]: {
    individualMeetings: number;
    lectures: number;
    seminars: number;
    healthEvents: number;
  };
}

// Interface for category with topics
interface CategoryWithTopics {
  _id: Id<"statCategories">;
  nameAr: string;
  order: number;
  topics: Array<{
    _id: Id<"statTopics">;
    nameAr: string;
    order: number;
  }>;
}

// Helper function to get Arabic month name
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

// Helper function to get English month abbreviation for filename
function getMonthAbbreviation(month: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return months[month - 1] || "";
}

/**
 * Export aggregated stats to Excel with official format
 * @param aggregatedData - Data from getAggregatedStats query
 * @param categories - Array of categories with their topics
 * @param month - Month number (1-12)
 * @param year - Year number
 * @param totalReports - Total number of reports included
 */
export function exportToExcel(
  aggregatedData: AggregatedData,
  categories: CategoryWithTopics[],
  month: number,
  year: number,
  totalReports: number
) {
  const workbook = XLSX.utils.book_new();
  const worksheetData: any[][] = [];

  // Header rows
  worksheetData.push([]);
  worksheetData.push([]);
  worksheetData.push([
    "",
    "",
    "إحصائية قطاع كركوك الأول الموحدة",
    "",
    "",
    "",
  ]);
  worksheetData.push([]);
  worksheetData.push([
    "",
    "",
    `الشهر: ${getMonthName(month)} ${year}`,
    "",
    "",
    "",
  ]);
  worksheetData.push([
    "",
    "",
    `عدد التقارير: ${totalReports}`,
    "",
    "",
    "",
  ]);
  worksheetData.push([]);

  // Table header row (bold)
  worksheetData.push([
    "ت",
    "المواضيع",
    "اللقاءات الفردية",
    "المحاضرات",
    "الندوات",
    "المناسبات الصحية",
  ]);

  // Calculate totals
  let totalIndividualMeetings = 0;
  let totalLectures = 0;
  let totalSeminars = 0;
  let totalHealthEvents = 0;

  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Add data for each category
  sortedCategories.forEach((category) => {
    // Add category header row
    worksheetData.push([
      category.order.toString(),
      category.nameAr,
      "",
      "",
      "",
      "",
    ]);

    // Sort topics by order
    const sortedTopics = [...category.topics].sort((a, b) => a.order - b.order);

    // Add sub-items (topics) for this category
    sortedTopics.forEach((topic) => {
      const topicData = aggregatedData[topic._id];
      const individualMeetings = topicData?.individualMeetings || 0;
      const lectures = topicData?.lectures || 0;
      const seminars = topicData?.seminars || 0;
      const healthEvents = topicData?.healthEvents || 0;

      worksheetData.push([
        "",
        topic.nameAr,
        individualMeetings,
        lectures,
        seminars,
        healthEvents,
      ]);

      // Add to totals
      totalIndividualMeetings += individualMeetings;
      totalLectures += lectures;
      totalSeminars += seminars;
      totalHealthEvents += healthEvents;
    });

    // Empty row after each category
    worksheetData.push([]);
  });

  // Total row
  worksheetData.push([
    "",
    "المجمـــــــــــــــــــــوع",
    totalIndividualMeetings,
    totalLectures,
    totalSeminars,
    totalHealthEvents,
  ]);

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 5 },  // ت (Number column)
    { wch: 45 }, // المواضيع (Subjects - wider for Arabic text)
    { wch: 18 }, // اللقاءات الفردية (Individual Meetings)
    { wch: 15 }, // المحاضرات (Lectures)
    { wch: 15 }, // الندوات (Seminars)
    { wch: 18 }, // المناسبات الصحية (Health Events)
  ];

  // Merge cells for header
  if (!worksheet["!merges"]) worksheet["!merges"] = [];
  
  // Merge title row (row 2, columns 0-5 for full width)
  worksheet["!merges"].push({
    s: { r: 2, c: 0 },
    e: { r: 2, c: 5 },
  });

  // Merge month row (row 4, columns 0-5)
  worksheet["!merges"].push({
    s: { r: 4, c: 0 },
    e: { r: 4, c: 5 },
  });

  // Merge reports count row (row 5, columns 0-5)
  worksheet["!merges"].push({
    s: { r: 5, c: 0 },
    e: { r: 5, c: 5 },
  });

  // Format title row (row 2) - bold and centered
  const titleCellAddress = XLSX.utils.encode_cell({ r: 2, c: 2 });
  if (worksheet[titleCellAddress]) {
    worksheet[titleCellAddress].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Format month and reports rows
  const monthCellAddress = XLSX.utils.encode_cell({ r: 4, c: 2 });
  if (worksheet[monthCellAddress]) {
    worksheet[monthCellAddress].s = {
      font: { bold: false, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  const reportsCellAddress = XLSX.utils.encode_cell({ r: 5, c: 2 });
  if (worksheet[reportsCellAddress]) {
    worksheet[reportsCellAddress].s = {
      font: { bold: false, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Find header row index (row with "ت")
  const headerRowIndex = worksheetData.findIndex((row) => row[0] === "ت");
  
  if (headerRowIndex !== -1) {
    // Format header row to be bold with RTL alignment
    for (let col = 0; col <= 5; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { 
          horizontal: col === 1 ? "right" : "center", 
          vertical: "center",
        },
      };
    }
  }

  // Format total row to be bold with RTL alignment
  const totalRowIndex = worksheetData.findIndex(
    (row) => row[1] === "المجمـــــــــــــــــــــوع"
  );
  
  if (totalRowIndex !== -1) {
    for (let col = 0; col <= 5; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { 
          horizontal: col === 1 ? "right" : "center", 
          vertical: "center",
        },
      };
    }
  }

  // Apply RTL alignment to all data cells with Arabic text
  for (let row = headerRowIndex + 1; row < worksheetData.length; row++) {
    if (row === totalRowIndex) continue; // Skip total row (already formatted)
    
    for (let col = 0; col <= 5; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;
      
      const cellValue = worksheetData[row][col];
      
      // Apply RTL alignment for Arabic text columns
      if (typeof cellValue === "string" && col === 1) {
        // Arabic text column - align right for RTL
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        if (!worksheet[cellAddress].s.alignment) worksheet[cellAddress].s.alignment = {};
        worksheet[cellAddress].s.alignment.horizontal = "right";
        worksheet[cellAddress].s.alignment.vertical = "center";
      } else if (typeof cellValue === "number" || cellValue === "") {
        // Number or empty cell - align center
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        if (!worksheet[cellAddress].s.alignment) worksheet[cellAddress].s.alignment = {};
        worksheet[cellAddress].s.alignment.horizontal = "center";
        worksheet[cellAddress].s.alignment.vertical = "center";
      }
    }
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "الإحصائية الشهرية");

  // Generate professional filename with current date
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const monthAbbr = getMonthAbbreviation(month);
  const fileName = `إحصائية_قطاع_كركوك_الأول_الموحدة_${getMonthName(month)}_${year}_${dateStr}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export stats to Excel with simplified format
 * @param data - Array of items with topicName and stats fields
 * @param fileName - Name of the file (without extension)
 */
export const exportStatsToExcel = (data: any, fileName: string) => {
  // 1. تعريف العناوين الرئيسية بناءً على النموذج الورقي 
  const headers = [
    ["دائرة صحة كركوك - قطاع كركوك الأول - إحصائية تعزيز الصحة"],
    ["الموضوع", "اللقاءات الفردية", "المحاضرات", "الندوات", "المناسبات الصحية"]
  ];

  // 2. تحويل البيانات المجمعة إلى صفوف 
  const rows = data.map((item: any) => [
    item.topicName,
    item.individualMeetings || 0,
    item.lectures || 0,
    item.seminars || 0,
    item.healthEvents || 0
  ]);

  // 3. إنشاء ورقة العمل وتنسيقها
  const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
  
  // ضبط اتجاه الورقة من اليمين لليسار (RTL) للعربية
  // Note: XLSX library doesn't directly support RTL in !settings, but we can format cells
  // Excel will automatically detect RTL based on Arabic text content
  
  // Set column widths
  worksheet["!cols"] = [
    { wch: 40 }, // الموضوع (Subject)
    { wch: 18 }, // اللقاءات الفردية (Individual Meetings)
    { wch: 15 }, // المحاضرات (Lectures)
    { wch: 15 }, // الندوات (Seminars)
    { wch: 18 }, // المناسبات الصحية (Health Events)
  ];

  // Merge title row (row 0, columns 0-4)
  if (!worksheet["!merges"]) worksheet["!merges"] = [];
  worksheet["!merges"].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: 4 },
  });

  // Format title row (row 0) - bold and centered
  const titleCellAddress = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (worksheet[titleCellAddress]) {
    worksheet[titleCellAddress].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Format header row (row 1) - bold with RTL alignment
  for (let col = 0; col <= 4; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
    if (!worksheet[cellAddress]) continue;
    
    worksheet[cellAddress].s = {
      font: { bold: true },
      alignment: { 
        horizontal: col === 0 ? "right" : "center", 
        vertical: "center",
      },
    };
  }

  // Format data rows with RTL alignment for Arabic text
  for (let row = 2; row < rows.length + 2; row++) {
    for (let col = 0; col <= 4; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;
      
      const cellValue = worksheet[cellAddress].v;
      
      // Apply RTL alignment for Arabic text column, center for numbers
      if (typeof cellValue === "string" && col === 0) {
        // Arabic text column - align right for RTL
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        if (!worksheet[cellAddress].s.alignment) worksheet[cellAddress].s.alignment = {};
        worksheet[cellAddress].s.alignment.horizontal = "right";
        worksheet[cellAddress].s.alignment.vertical = "center";
      } else if (typeof cellValue === "number") {
        // Number column - align center
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        if (!worksheet[cellAddress].s.alignment) worksheet[cellAddress].s.alignment = {};
        worksheet[cellAddress].s.alignment.horizontal = "center";
        worksheet[cellAddress].s.alignment.vertical = "center";
      }
    }
  }

  // 4. إنشاء الكتاب وحفظ الملف
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "الإحصائية الموحدة");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

