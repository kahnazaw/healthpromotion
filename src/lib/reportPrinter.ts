export function printReport(
  campaignStats: any,
  activityStats: any,
  dashboardStats: any
) {
  // Create print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
  }

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Activity type labels
  const typeLabels: Record<string, string> = {
    awareness_session: "جلسات توعية",
    health_screening: "فحوصات صحية",
    vaccination: "تطعيمات",
    other: "أخرى"
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير إحصائيات النظام</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
          padding: 40px;
          background: white;
          color: #1f2937;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
        }
        
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 10px;
        }
        
        .header .date {
          font-size: 14px;
          color: #6b7280;
        }
        
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          background: #f9fafb;
        }
        
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }
        
        .stat-sublabel {
          font-size: 12px;
          color: #10b981;
          margin-top: 4px;
        }
        
        .activity-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }
        
        .activity-type-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          background: white;
        }
        
        .activity-type-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 5px;
        }
        
        .activity-type-label {
          font-size: 13px;
          color: #6b7280;
        }
        
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .section {
            page-break-inside: avoid;
          }
          
          @page {
            margin: 2cm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>تقرير إحصائيات النظام الصحي</h1>
        <div class="date">تاريخ التقرير: ${currentDate}</div>
      </div>

      <!-- Campaign Statistics -->
      <div class="section">
        <h2 class="section-title">📊 إحصائيات الحملات</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${campaignStats.total}</div>
            <div class="stat-label">إجمالي الحملات</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${campaignStats.active}</div>
            <div class="stat-label">حملات نشطة</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${campaignStats.completed}</div>
            <div class="stat-label">حملات مكتملة</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${campaignStats.planned}</div>
            <div class="stat-label">حملات مخططة</div>
          </div>
        </div>
      </div>

      <!-- Activity Statistics -->
      <div class="section">
        <h2 class="section-title">📅 إحصائيات الأنشطة</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${activityStats.total}</div>
            <div class="stat-label">إجمالي الأنشطة</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${activityStats.totalAttendees.toLocaleString()}</div>
            <div class="stat-label">إجمالي المستفيدين</div>
          </div>
        </div>
        
        <h3 style="font-size: 18px; font-weight: 600; margin: 30px 0 15px 0;">الأنشطة حسب النوع</h3>
        <div class="activity-types">
          ${Object.entries(activityStats.byType)
            .map(([type, count]) => `
              <div class="activity-type-card">
                <div class="activity-type-value">${count}</div>
                <div class="activity-type-label">${typeLabels[type] || 'أخرى'}</div>
              </div>
            `)
            .join('')}
        </div>
      </div>

      <!-- Overall Statistics -->
      <div class="section">
        <h2 class="section-title">📈 الإحصائيات العامة</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${dashboardStats.healthCenters.total}</div>
            <div class="stat-label">مراكز صحية</div>
            <div class="stat-sublabel">${dashboardStats.healthCenters.active} نشط</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${dashboardStats.campaigns.total}</div>
            <div class="stat-label">حملات صحية</div>
            <div class="stat-sublabel">${dashboardStats.campaigns.active} نشطة</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${dashboardStats.activities.total}</div>
            <div class="stat-label">أنشطة</div>
            <div class="stat-sublabel">${dashboardStats.activities.totalAttendees.toLocaleString()} مستفيد</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${dashboardStats.posters.total}</div>
            <div class="stat-label">بوسترات توعوية</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>تم إنشاء هذا التقرير تلقائياً من نظام إدارة الحملات الصحية</p>
        <p style="margin-top: 5px;">© ${new Date().getFullYear()} - جميع الحقوق محفوظة</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
