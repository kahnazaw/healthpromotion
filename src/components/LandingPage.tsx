interface LandingPageProps {
  onNavigate?: (page: "landing" | "dashboard" | "campaigns" | "activities" | "centers" | "posters" | "gallery" | "reports") => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-8">
              <span className="text-3xl">🏥</span>
              <div className="text-start">
                <span className="text-white font-bold block">دائرة صحة كركوك</span>
                <span className="text-white/90 text-sm">قطاع كركوك الأول - وحدة تعزيز الصحة</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            إدارة ومتابعة<br />الحملات الصحية
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            منصة متكاملة لإدارة المراكز الصحية والحملات التوعوية والأنشطة الصحية
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate?.("dashboard")}
              className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 text-lg"
            >
              ابدأ الآن
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-bold rounded-xl hover:bg-white/20 transition-all border-2 border-white/30 text-lg">
              معرفة المزيد
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">المميزات الرئيسية</h2>
            <p className="text-xl text-gray-600">كل ما تحتاجه لإدارة الحملات الصحية بكفاءة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6">
                <span className="text-3xl">🏥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-start">إدارة المراكز</h3>
              <p className="text-gray-600 text-start">إدارة شاملة لجميع المراكز الصحية ومتابعة أنشطتها</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6">
                <span className="text-3xl">📢</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-start">الحملات الصحية</h3>
              <p className="text-gray-600 text-start">تخطيط وتنفيذ ومتابعة الحملات الصحية التوعوية</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-start">إدارة الأنشطة</h3>
              <p className="text-gray-600 text-start">تسجيل ومتابعة جميع الأنشطة والفعاليات الصحية</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-start">البوسترات التوعوية</h3>
              <p className="text-gray-600 text-start">إنشاء وإدارة البوسترات التوعوية للحملات</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-start">التقارير والإحصائيات</h3>
              <p className="text-gray-600 text-start">تقارير شاملة وإحصائيات تفصيلية عن الأداء</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-start">تحديثات فورية</h3>
              <p className="text-gray-600 text-start">متابعة فورية لجميع التحديثات والتغييرات</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ابدأ الآن في إدارة حملاتك الصحية
          </h2>
          <p className="text-xl text-white/90 mb-8">
            انضم إلى المنصة وابدأ في تنظيم وإدارة حملاتك الصحية بكفاءة
          </p>
          <button
            onClick={() => onNavigate?.("dashboard")}
            className="px-10 py-5 bg-white text-emerald-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 text-lg"
          >
            ابدأ الآن
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="text-start">
                  <span className="text-xl font-bold block">دائرة صحة كركوك</span>
                  <span className="text-sm text-emerald-400">قطاع كركوك الأول - وحدة تعزيز الصحة</span>
                </div>
              </div>
              <p className="text-gray-400 text-start">
                منصة متكاملة لإدارة ومتابعة الحملات الصحية والأنشطة التوعوية
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-start">روابط سريعة</h3>
              <ul className="space-y-2 text-start">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">الرئيسية</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">المميزات</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">من نحن</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-start">تواصل معنا</h3>
              <ul className="space-y-2 text-start">
                <li className="text-gray-400">📧 info@health-campaigns.sa</li>
                <li className="text-gray-400">📞 +966 50 123 4567</li>
                <li className="text-gray-400">📍 الرياض، المملكة العربية السعودية</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 mb-2">© 2024 دائرة صحة كركوك - قطاع كركوك الأول. جميع الحقوق محفوظة.</p>
            <p className="text-emerald-400 text-sm font-semibold">برمجة وتصميم: م. صيدلي علاء صالح احمد 💻</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
