import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const notifications = useQuery(api.notifications.list);
  const unreadCount = useQuery(api.notifications.unreadCount);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const removeNotification = useMutation(api.notifications.remove);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: Id<"notifications">) => {
    try {
      await markAsRead({ id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({});
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleDelete = async (id: Id<"notifications">) => {
    try {
      await removeNotification({ id });
      toast.success("تم حذف الإشعار");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return "✅";
      case "warning": return "⚠️";
      case "error": return "❌";
      default: return "ℹ️";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success": return "from-emerald-50 to-teal-50";
      case "warning": return "from-orange-50 to-yellow-50";
      case "error": return "from-red-50 to-pink-50";
      default: return "from-blue-50 to-indigo-50";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* زر الإشعارات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* رأس القائمة */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 text-start">الإشعارات</h3>
              {(unreadCount ?? 0) > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>
            {(unreadCount ?? 0) > 0 && (
              <p className="text-sm text-gray-600 text-start">
                لديك {unreadCount} إشعار غير مقروء
              </p>
            )}
          </div>

          {/* قائمة الإشعارات */}
          <div className="overflow-y-auto flex-1">
            {!notifications ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">🔔</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد إشعارات</h3>
                <p className="text-gray-600 text-sm">سنعلمك عند حدوث أي تحديثات</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`mb-2 p-3 rounded-xl transition-all ${
                      notification.isRead 
                        ? "bg-gray-50" 
                        : `bg-gradient-to-r ${getNotificationColor(notification.type)} border-2 border-${notification.type === "success" ? "emerald" : notification.type === "warning" ? "orange" : notification.type === "error" ? "red" : "blue"}-200`
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-start text-sm">
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 text-start mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(notification._creationTime).toLocaleString("ar-SA", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              تحديد كمقروء
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
