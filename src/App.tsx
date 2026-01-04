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
            {/* Sidebar */}
            <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-200">
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

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button
                  onClick={() => setCurrentPage("landing")}
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
                  onClick={() => setCurrentPage("dashboard")}
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
                  onClick={() => setCurrentPage("campaigns")}
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
                  onClick={() => setCurrentPage("activities")}
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
                  onClick={() => setCurrentPage("centers")}
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
                  onClick={() => setCurrentPage("posters")}
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
                  onClick={() => setCurrentPage("gallery")}
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
                  onClick={() => setCurrentPage("weekly")}
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
                  onClick={() => setCurrentPage("stats")}
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
                      onClick={() => setCurrentPage("review")}
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
                      onClick={() => setCurrentPage("manager")}
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
                      onClick={() => setCurrentPage("users")}
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
                  onClick={() => setCurrentPage("reports")}
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
              <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 text-start">
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
                <NotificationBell />
              </header>

              {/* Page Content */}
              <div className="flex-1 overflow-y-auto p-8">
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
