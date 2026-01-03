import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export default function PosterGallery() {
  const featuredPosters = useQuery(api.posterFeatures.listFeatured);
  const topRatedPosters = useQuery(api.posterFeatures.listTopRated);
  const allPosters = useQuery(api.posters.list);
  const ratePoster = useMutation(api.posterRatings.rate);
  const togglePin = useMutation(api.posterFeatures.togglePin);

  const [selectedPoster, setSelectedPoster] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"featured" | "top-rated" | "all">("featured");

  const handleRate = async (posterId: Id<"posters">, rating: number) => {
    try {
      await ratePoster({ posterId, rating });
      toast.success(`تم التقييم بـ ${rating} نجوم! ⭐`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء التقييم";
      toast.error(message);
    }
  };

  const handleTogglePin = async (id: Id<"posters">) => {
    try {
      await togglePin({ id });
      toast.success("تم تحديث حالة التثبيت");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleShare = (poster: any) => {
    if (navigator.share) {
      navigator.share({
        title: poster.title,
        text: poster.description,
        url: poster.imageUrl,
      });
    } else {
      navigator.clipboard.writeText(poster.imageUrl);
      toast.success("تم نسخ رابط البوستر!");
    }
  };

  const displayPosters =
    activeTab === "featured"
      ? featuredPosters
      : activeTab === "top-rated"
      ? topRatedPosters
      : allPosters;

  const StarRating = ({ rating, onRate, readonly = false }: any) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRate(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={`text-2xl transition-all ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
          >
            {star <= (hover || rating) ? "⭐" : "☆"}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-start">معرض البوسترات المميزة</h2>
          <p className="text-gray-600 text-start mt-1">استعرض وقيّم أفضل البوسترات التوعوية</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab("featured")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "featured"
              ? "text-purple-600 border-b-2 border-purple-600 -mb-0.5"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center gap-2">
            <span>📌</span>
            <span>المميزة</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab("top-rated")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "top-rated"
              ? "text-purple-600 border-b-2 border-purple-600 -mb-0.5"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center gap-2">
            <span>⭐</span>
            <span>الأعلى تقييماً</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "all"
              ? "text-purple-600 border-b-2 border-purple-600 -mb-0.5"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center gap-2">
            <span>🎨</span>
            <span>الكل</span>
          </span>
        </button>
      </div>

      {/* Posters Grid */}
      {!displayPosters ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-96"></div>
            </div>
          ))}
        </div>
      ) : displayPosters.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <span className="text-5xl">🎨</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد بوسترات في هذا القسم</h3>
          <p className="text-gray-600">جرّب قسماً آخر أو ابدأ بتوليد بوسترات جديدة!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosters.map((poster) => (
            <div
              key={poster._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
            >
              {/* Image */}
              <div className="relative h-64 bg-gray-100 overflow-hidden">
                <img
                  src={poster.imageUrl}
                  alt={poster.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {poster.isPinned && (
                  <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <span>📌</span>
                    <span>مميز</span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedPoster(poster)}
                  className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <span className="text-white text-4xl">🔍</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-start">{poster.title}</h3>
                  <p className="text-sm text-gray-600 text-start line-clamp-2">{poster.description}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={Math.round(poster.rating || 0)}
                      onRate={(rating: number) => handleRate(poster._id, rating)}
                    />
                    {poster.ratingCount && poster.ratingCount > 0 && (
                      <span className="text-sm text-gray-500">({poster.ratingCount})</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(poster)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>🔗</span>
                    <span>مشاركة</span>
                  </button>
                  <button
                    onClick={() => handleTogglePin(poster._id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      poster.isPinned
                        ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    📌
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Poster Detail Modal */}
      {selectedPoster && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPoster(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedPoster.imageUrl}
                alt={selectedPoster.title}
                className="w-full h-auto"
              />
              <button
                onClick={() => setSelectedPoster(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all"
              >
                ✕
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3 text-start">
                  {selectedPoster.title}
                </h2>
                <p className="text-gray-600 text-start">{selectedPoster.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">قيّم هذا البوستر:</span>
                <StarRating
                  rating={Math.round(selectedPoster.rating || 0)}
                  onRate={(rating: number) => handleRate(selectedPoster._id, rating)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleShare(selectedPoster)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>🔗</span>
                  <span>مشاركة البوستر</span>
                </button>
                <a
                  href={selectedPoster.imageUrl}
                  download={`${selectedPoster.title}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  <span>تحميل</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
