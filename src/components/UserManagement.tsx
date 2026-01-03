import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export default function UserManagement() {
  const currentProfile = useQuery(api.userManagement.getCurrentUserProfile);
  const pendingRequests = useQuery(api.userManagement.getPendingRequests) || [];
  const allUsers = useQuery(api.userManagement.getAllUsers) || [];

  const approveUser = useMutation(api.userManagement.approveUser);
  const rejectUser = useMutation(api.userManagement.rejectUser);
  const changeUserRole = useMutation(api.userManagement.changeUserRole);
  const deleteUser = useMutation(api.userManagement.deleteUser);

  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [rejectModal, setRejectModal] = useState<{ profileId: Id<"userProfiles">; userName: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (profileId: Id<"userProfiles">, role: string) => {
    try {
      await approveUser({ profileId, role });
      toast.success("تمت الموافقة على المستخدم بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectionReason.trim()) {
      toast.error("الرجاء إدخال سبب الرفض");
      return;
    }

    try {
      await rejectUser({ profileId: rejectModal.profileId, reason: rejectionReason });
      toast.success("تم رفض الطلب");
      setRejectModal(null);
      setRejectionReason("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleChangeRole = async (profileId: Id<"userProfiles">, newRole: string) => {
    try {
      await changeUserRole({ profileId, newRole });
      toast.success("تم تغيير الصلاحيات بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleDelete = async (profileId: Id<"userProfiles">) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      await deleteUser({ profileId });
      toast.success("تم حذف المستخدم");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "super_admin": return "مدير افتراضي";
      case "admin": return "مدير";
      case "user": return "مستخدم";
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin": return "bg-red-100 text-red-800";
      case "admin": return "bg-blue-100 text-blue-800";
      case "user": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "في الانتظار";
      case "approved": return "موافق عليه";
      case "rejected": return "مرفوض";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!currentProfile || (currentProfile.role !== "super_admin" && currentProfile.role !== "admin")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">غير مصرح</h3>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-start">إدارة المستخدمين</h2>
        <p className="text-gray-600 text-start mt-1">الموافقة على طلبات التسجيل وإدارة صلاحيات المستخدمين</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "pending"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>طلبات التسجيل</span>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "all"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            جميع المستخدمين
          </button>
        </div>
      </div>

      {/* Pending Requests */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات جديدة</h3>
              <p className="text-gray-600">جميع طلبات التسجيل تمت معالجتها</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {request.userName.charAt(0)}
                      </div>
                      <div className="text-start">
                        <h3 className="text-lg font-bold text-gray-900">{request.userName}</h3>
                        <p className="text-sm text-gray-600">{request.userEmail}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">المركز الصحي</p>
                        <p className="font-medium text-gray-900">{request.healthCenterName}</p>
                      </div>
                      {request.phone && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
                          <p className="font-medium text-gray-900">{request.phone}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(request._id, "user")}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all"
                      >
                        ✓ موافقة كمستخدم
                      </button>
                      <button
                        onClick={() => handleApprove(request._id, "admin")}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                      >
                        👨‍💼 موافقة كمدير
                      </button>
                      <button
                        onClick={() => setRejectModal({ profileId: request._id, userName: request.userName })}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
                      >
                        ✗ رفض
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Users */}
      {activeTab === "all" && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">المستخدم</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">المركز الصحي</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">الدور</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.userName.charAt(0)}
                        </div>
                        <div className="text-start">
                          <p className="font-medium text-gray-900">{user.userName}</p>
                          <p className="text-sm text-gray-600">{user.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-start">
                      <p className="text-sm text-gray-900">{user.healthCenterName}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.role !== "super_admin" && user.status === "approved" && (
                        <div className="flex items-center justify-center gap-2">
                          {currentProfile.role === "super_admin" && (
                            <>
                              <select
                                value={user.role}
                                onChange={(e) => handleChangeRole(user._id, e.target.value)}
                                className="px-3 py-1 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              >
                                <option value="user">مستخدم</option>
                                <option value="admin">مدير</option>
                              </select>
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-medium"
                              >
                                حذف
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      {user.role === "super_admin" && (
                        <span className="text-sm text-gray-500">لا يمكن التعديل</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 text-start">
                رفض طلب {rejectModal.userName}
              </h3>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">سبب الرفض</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="اكتب سبب رفض الطلب..."
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
              >
                تأكيد الرفض
              </button>
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectionReason("");
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
