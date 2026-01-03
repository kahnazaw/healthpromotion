import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export default function Posters() {
  const posters = useQuery(api.posters.list);
  const campaigns = useQuery(api.campaigns.list);
  const generatePoster = useAction(api.posters.generateWithAI);
  const deletePoster = useMutation(api.posters.remove);
  const updatePoster = useMutation(api.posters.update);

  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Id<"posters"> | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    campaignId: "" as Id<"campaigns"> | "",
    style: "modern",
  });

  const styleOptions = [
    { value: "modern", label: "عصري وحديث", icon: "✨" },
    { value: "professional", label: "احترافي ورسمي", icon: "💼" },
    { value: "colorful", label: "ملون وجذاب", icon: "🎨" },
    { value: "minimal", label: "بسيط ونظيف", icon: "⚪" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePoster({
        title: formData.title,
        description: formData.description,
        campaignId: formData.campaignId || undefined,
        style: formData.style,
      });

      toast.success("تم توليد البوستر بنجاح! 🎉");
      setShowForm(false);
      setFormData({ title: "", description: "", campaignId: "", style: "modern" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء توليد البوستر";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: Id<"posters">) => {
    if (!confirm("هل أنت متأكد من حذف هذا البوستر؟")) return;

    try {
      await deletePoster({ id });
      toast.success("تم حذف البوستر بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الحذف";
      toast.error(message);
    }
  };

  const handleDownload = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("جاري تحميل البوستر...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-start">البوسترات التوعوية</h2>
          <p className="text-gray-600 text-start mt-1">توليد بوسترات احترافية بالذكاء الاصطناعي</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          <span className="text-xl">✨</span>
          <span>توليد بوستر جديد</span>
        </button>
      </div>

      {/* AI Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2 text-start">توليد بوسترات بالذكاء الاصطناعي</h3>
            <p className="text-sm text-gray-600 text-start">
              استخدم تقنية DALL-E 3 من OpenAI لتوليد بوسترات توعوية احترافية بناءً على وصفك. 
              كل بوستر يتم تصميمه خصيصاً ليناسب حملتك الصحية!
            </p>
          </div>
        </div>
      </div>

      {/* Generation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 text-start">توليد بوستر جديد بالذكاء الاصطناعي</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  عنوان البوستر *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="مثال: أهمية التطعيم ضد الإنفلونزا"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  وصف المحتوى *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="اكتب وصفاً تفصيلياً للبوستر... مثال: بوستر توعوي يشرح أهمية التطعيم السنوي ضد الإنفلونزا، مع إبراز الفئات المستهدفة والفوائد الصحية"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  ربط بحملة (اختياري)
                </label>
                <select
                  value={formData.campaignId}
                  onChange={(e) => setFormData({ ...formData, campaignId: e.target.value as Id<"campaigns"> | "" })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                >
                  <option value="">بدون ربط بحملة</option>
                  {campaigns?.map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-start">
                  نمط التصميم
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {styleOptions.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, style: style.value })}
                      className={`p-4 rounded-xl border-2 transition-all text-start ${
                        formData.style === style.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{style.icon}</span>
                        <span className="font-medium text-gray-900">{style.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري التوليد...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>توليد البوستر</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posters Grid */}
      {!posters ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-80"></div>
            </div>
          ))}
        </div>
      ) : posters.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <span className="text-5xl">🎨</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد بوسترات بعد</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            ابدأ بتوليد أول بوستر توعوي باستخدام الذكاء الاصطناعي!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <span>✨</span>
            <span>توليد بوستر جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster) => (
            <div
              key={poster._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative h-64 bg-gray-100">
                <img
                  src={poster.imageUrl}
                  alt={poster.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-start">{poster.title}</h3>
                <p className="text-sm text-gray-600 mb-4 text-start line-clamp-2">{poster.description}</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(poster.imageUrl, poster.title)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>📥</span>
                    <span>تحميل</span>
                  </button>
                  <button
                    onClick={() => handleDelete(poster._id)}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
