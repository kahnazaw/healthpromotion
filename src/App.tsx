import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { useState } from "react";
import { Toaster } from "sonner";
import Dashboard from "./components/Dashboard";
import Campaigns from "./components/Campaigns";
import Activities from "./components/Activities";
import HealthCenters from "./components/HealthCenters";
import Posters from "./components/Posters";
import PosterGallery from "./components/PosterGallery";
import Reports from "./components/Reports";
import NotificationBell from "./components/NotificationBell";
import LandingPage from "./components/LandingPage";
import MonthlyStats from "./components/MonthlyStats";
import WeeklyStats from "./components/WeeklyStats";
import ManagerReview from "./components/ManagerReview";
import ManagerDashboard from "./components/ManagerDashboard";
import UserManagement from "./components/UserManagement";
import UserRegistration from "./components/UserRegistration";

export default function App() {
  const user = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userManagement.getCurrentUserProfile);
  const [currentPage, setCurrentPage] = useState<
    "landing" | "dashboard" | "campaigns" | "activities" | "centers" | "posters" | "gallery" | "reports" | "stats" | "weekly" | "review" | "manager" | "users"
  >("landing");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlePageChange = (page: typeof currentPage) => {
    setCurrentPage(page);
    setSidebarOpen(false); // Close sidebar on mobile when navigating
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-center" richColors />
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
      <Authenticated>
        {/* التحقق من حالة المستخدم */}
        {!userProfile || userProfile.status !== "approved" ? (
          <UserRegistration />
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 right-0 w-64 bg-white border-l border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
            }`}>
              <div className="p-6 border-b border-gray-200 relative">
                {/* Close Button - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden absolute top-4 left-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src="/kirkuk-logo.png" 
                    alt="شعار دائرة صحة كركوك"
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      // Fallback to Convex storage URL if local file doesn't exist
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("polished-pony-114.convex.cloud")) {
                        target.src = "https://polished-pony-114.convex.cloud/api/storage/b69b6463-3c48-4960-9c5b-e58e96902f2e";
                      }
                    }}
                  />
                  <div className="flex-1 text-start">
                    <h1 className="text-lg font-bold text-gray-900">
                      دائرة صحة كركوك - قطاع كركوك الأول
                    </h1>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">نظام إدارة الحملات الصحية</p>
              </div>

              {/* Close Button - Mobile Only */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden absolute top-4 left-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button
                  onClick={() => handlePageChange("landing")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "landing"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">🏠</span>
                  <span>الصفحة الرئيسية</span>
                </button>
                <button
                  onClick={() => handlePageChange("dashboard")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "dashboard"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">📊</span>
                  <span>لوحة التحكم</span>
                </button>
                <button
                  onClick={() => handlePageChange("campaigns")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "campaigns"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">📢</span>
                  <span>الحملات الصحية</span>
                </button>
                <button
                  onClick={() => handlePageChange("activities")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "activities"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">🎯</span>
                  <span>الأنشطة</span>
                </button>
                <button
                  onClick={() => handlePageChange("centers")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "centers"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">🏥</span>
                  <span>المراكز الصحية</span>
                </button>
                <button
                  onClick={() => handlePageChange("posters")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "posters"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">🎨</span>
                  <span>البوسترات التوعوية</span>
                </button>
                <button
                  onClick={() => handlePageChange("gallery")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "gallery"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">⭐</span>
                  <span>معرض البوسترات</span>
                </button>
                <button
                  onClick={() => handlePageChange("weekly")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "weekly"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">📅</span>
                  <span>الإحصائيات الأسبوعية</span>
                </button>
                <button
                  onClick={() => handlePageChange("stats")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "stats"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">📋</span>
                  <span>الإحصائيات الشهرية</span>
                </button>
                
                {/* قسم المدير */}
                {(userProfile.role === "super_admin" || userProfile.role === "admin") && (
                  <>
                    <div className="pt-4 pb-2 px-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase">إدارة النظام</p>
                    </div>
                    <button
                      onClick={() => handlePageChange("review")}
                      className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                        currentPage === "review"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-xl">✅</span>
                      <span>مراجعة الإحصائيات</span>
                    </button>
                    <button
                      onClick={() => handlePageChange("manager")}
                      className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                        currentPage === "manager"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-xl">👨‍💼</span>
                      <span>لوحة تحكم المدير</span>
                    </button>
                    <button
                      onClick={() => handlePageChange("users")}
                      className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                        currentPage === "users"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-xl">👥</span>
                      <span>إدارة المستخدمين</span>
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => handlePageChange("reports")}
                  className={`w-full text-start px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                    currentPage === "reports"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">📈</span>
                  <span>التقارير</span>
                </button>
              </nav>

              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || "م"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-start">{user?.name || "مستخدم"}</p>
                    <p className="text-xs text-gray-500 truncate text-start">
                      {userProfile.role === "super_admin" ? "مدير افتراضي" : userProfile.role === "admin" ? "مدير" : "مستخدم"}
                    </p>
                  </div>
                </div>
                <SignOutButton />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar */}
              <header className="bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Hamburger Menu Button - Mobile Only */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Toggle menu"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                  {/* Logo and Title - Mobile */}
                  <div className="flex items-center gap-2 md:hidden">
                    <img 
                      src="/kirkuk-logo.png" 
                      alt="شعار دائرة صحة كركوك"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("polished-pony-114.convex.cloud")) {
                          target.src = "https://polished-pony-114.convex.cloud/api/storage/b69b6463-3c48-4960-9c5b-e58e96902f2e";
                        }
                      }}
                    />
                    <h2 className="text-lg font-bold text-gray-900 text-start">
                      دائرة صحة كركوك
                    </h2>
                  </div>
                  
                  {/* Title - Desktop */}
                  <h2 className="hidden md:block text-xl md:text-2xl font-bold text-gray-900 text-start">
                    {currentPage === "landing" && "الصفحة الرئيسية"}
                    {currentPage === "dashboard" && "لوحة التحكم"}
                    {currentPage === "campaigns" && "الحملات الصحية"}
                    {currentPage === "activities" && "الأنشطة"}
                    {currentPage === "centers" && "المراكز الصحية"}
                    {currentPage === "posters" && "البوسترات التوعوية"}
                    {currentPage === "gallery" && "معرض البوسترات المميزة"}
                    {currentPage === "weekly" && "الإحصائيات الأسبوعية"}
                    {currentPage === "stats" && "الإحصائيات الشهرية"}
                    {currentPage === "review" && "مراجعة الإحصائيات"}
                    {currentPage === "manager" && "لوحة تحكم المدير"}
                    {currentPage === "users" && "إدارة المستخدمين"}
                    {currentPage === "reports" && "التقارير"}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <NotificationBell />
                </div>
              </header>

              {/* Page Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                {currentPage === "landing" && <LandingPage onNavigate={setCurrentPage} />}
                {currentPage === "dashboard" && <Dashboard />}
                {currentPage === "campaigns" && <Campaigns />}
                {currentPage === "activities" && <Activities />}
                {currentPage === "centers" && <HealthCenters />}
                {currentPage === "posters" && <Posters />}
                {currentPage === "gallery" && <PosterGallery />}
                {currentPage === "weekly" && <WeeklyStats />}
                {currentPage === "stats" && <MonthlyStats />}
                {currentPage === "review" && <ManagerReview />}
                {currentPage === "manager" && <ManagerDashboard />}
                {currentPage === "users" && <UserManagement />}
                {currentPage === "reports" && <Reports />}
              </div>
            </div>
          </div>
        )}
      </Authenticated>
    </main>
  );
}
