import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function ManageTopics() {
  const currentProfile = useQuery(api.userManagement.getCurrentUserProfile);
  const categories = useQuery(api.statCategories.list, { includeInactive: true }) || [];
  const topics = useQuery(api.statTopics.list, { includeInactive: true }) || [];

  const createCategory = useMutation(api.statCategories.create);
  const updateCategory = useMutation(api.statCategories.update);
  const createTopic = useMutation(api.statTopics.create);
  const updateTopic = useMutation(api.statTopics.update);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Id<"statCategories"> | null>(null);
  const [editingTopic, setEditingTopic] = useState<Id<"statTopics"> | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"statCategories"> | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    nameAr: "",
    order: categories.length + 1,
    description: "",
  });

  const [topicForm, setTopicForm] = useState({
    categoryId: "" as Id<"statCategories"> | "",
    name: "",
    nameAr: "",
    order: 1,
    description: "",
  });

  // التحقق من الصلاحيات
  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentProfile.role === "admin" || currentProfile.role === "super_admin";

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-red-600 font-semibold">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
      </div>
    );
  }

  // تجميع المواضيع حسب التصنيف
  const topicsByCategory = topics.reduce((acc, topic) => {
    const catId = topic.categoryId;
    if (!acc[catId]) {
      acc[catId] = [];
    }
    acc[catId].push(topic);
    return acc;
  }, {} as Record<string, typeof topics>);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.nameAr.trim()) {
      toast.error("الرجاء إدخال اسم التصنيف بالعربية");
      return;
    }

    try {
      await createCategory({
        name: categoryForm.name || categoryForm.nameAr,
        nameAr: categoryForm.nameAr,
        order: categoryForm.order,
        description: categoryForm.description || undefined,
      });
      toast.success("تم إنشاء التصنيف بنجاح");
      setShowCategoryForm(false);
      setCategoryForm({ name: "", nameAr: "", order: categories.length + 1, description: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleUpdateCategory = async (categoryId: Id<"statCategories">) => {
    if (!categoryForm.nameAr.trim()) {
      toast.error("الرجاء إدخال اسم التصنيف بالعربية");
      return;
    }

    try {
      await updateCategory({
        id: categoryId,
        name: categoryForm.name || categoryForm.nameAr,
        nameAr: categoryForm.nameAr,
        order: categoryForm.order,
        description: categoryForm.description || undefined,
      });
      toast.success("تم تحديث التصنيف بنجاح");
      setEditingCategory(null);
      setCategoryForm({ name: "", nameAr: "", order: categories.length + 1, description: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.categoryId) {
      toast.error("الرجاء اختيار التصنيف");
      return;
    }
    if (!topicForm.nameAr.trim()) {
      toast.error("الرجاء إدخال اسم الموضوع بالعربية");
      return;
    }

    try {
      await createTopic({
        categoryId: topicForm.categoryId,
        name: topicForm.name || topicForm.nameAr,
        nameAr: topicForm.nameAr,
        order: topicForm.order,
        description: topicForm.description || undefined,
      });
      toast.success("تم إنشاء الموضوع بنجاح");
      setShowTopicForm(false);
      setTopicForm({
        categoryId: "" as Id<"statCategories"> | "",
        name: "",
        nameAr: "",
        order: 1,
        description: "",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleUpdateTopic = async (topicId: Id<"statTopics">) => {
    if (!topicForm.nameAr.trim()) {
      toast.error("الرجاء إدخال اسم الموضوع بالعربية");
      return;
    }

    try {
      await updateTopic({
        id: topicId,
        name: topicForm.name || topicForm.nameAr,
        nameAr: topicForm.nameAr,
        order: topicForm.order,
        categoryId: topicForm.categoryId || undefined,
        description: topicForm.description || undefined,
      });
      toast.success("تم تحديث الموضوع بنجاح");
      setEditingTopic(null);
      setTopicForm({
        categoryId: "" as Id<"statCategories"> | "",
        name: "",
        nameAr: "",
        order: 1,
        description: "",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleToggleCategory = async (categoryId: Id<"statCategories">, isActive: boolean) => {
    try {
      await updateCategory({
        id: categoryId,
        isActive: !isActive,
      });
      toast.success(isActive ? "تم إيقاف تفعيل التصنيف" : "تم تفعيل التصنيف");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleToggleTopic = async (topicId: Id<"statTopics">, isActive: boolean) => {
    try {
      await updateTopic({
        id: topicId,
        isActive: !isActive,
      });
      toast.success(isActive ? "تم إيقاف تفعيل الموضوع" : "تم تفعيل الموضوع");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const startEditCategory = (category: any) => {
    setEditingCategory(category._id);
    setCategoryForm({
      name: category.name || "",
      nameAr: category.nameAr,
      order: category.order,
      description: category.description || "",
    });
    setShowCategoryForm(true);
  };

  const startEditTopic = (topic: any) => {
    setEditingTopic(topic._id);
    setTopicForm({
      categoryId: topic.categoryId,
      name: topic.name || "",
      nameAr: topic.nameAr,
      order: topic.order,
      description: topic.description || "",
    });
    setShowTopicForm(true);
    setSelectedCategoryId(topic.categoryId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة التصنيفات والمواضيع</h1>
            <p className="text-gray-600 text-sm">إدارة الأقسام الرئيسية والمواضيع الفرعية للإحصائيات</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => {
                setShowCategoryForm(true);
                setEditingCategory(null);
                setCategoryForm({ name: "", nameAr: "", order: categories.length + 1, description: "" });
              }}
              className="w-full sm:w-auto"
            >
              + إضافة قسم رئيسي
            </Button>
            <Button
              onClick={() => {
                setShowTopicForm(true);
                setEditingTopic(null);
                setTopicForm({
                  categoryId: "" as Id<"statCategories"> | "",
                  name: "",
                  nameAr: "",
                  order: 1,
                  description: "",
                });
                setSelectedCategoryId(null);
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              + إضافة موضوع فرعي
            </Button>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingCategory ? "تعديل التصنيف" : "إضافة قسم رئيسي جديد"}
          </h2>
          <form onSubmit={editingCategory ? (e) => { e.preventDefault(); handleUpdateCategory(editingCategory); } : handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                اسم التصنيف (عربي) *
              </label>
              <Input
                type="text"
                value={categoryForm.nameAr}
                onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                placeholder="مثال: الأمراض الانتقالية"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                اسم التصنيف (إنجليزي)
              </label>
              <Input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Communicable Diseases"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                ترتيب العرض
              </label>
              <Input
                type="number"
                min="1"
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
                className="w-full"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                الوصف (اختياري)
              </label>
              <Input
                type="text"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="وصف التصنيف"
                className="w-full"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: "", nameAr: "", order: categories.length + 1, description: "" });
                }}
              >
                إلغاء
              </Button>
              <Button type="submit">
                {editingCategory ? "تحديث" : "إنشاء"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Topic Form Modal */}
      {showTopicForm && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingTopic ? "تعديل الموضوع" : "إضافة موضوع فرعي جديد"}
          </h2>
          <form onSubmit={editingTopic ? (e) => { e.preventDefault(); handleUpdateTopic(editingTopic); } : handleCreateTopic} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                التصنيف الرئيسي *
              </label>
              <select
                value={topicForm.categoryId}
                onChange={(e) => {
                  setTopicForm({ ...topicForm, categoryId: e.target.value as Id<"statCategories"> });
                  setSelectedCategoryId(e.target.value as Id<"statCategories">);
                }}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">اختر التصنيف</option>
                {categories
                  .filter((cat) => cat.isActive)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nameAr}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                اسم الموضوع (عربي) *
              </label>
              <Input
                type="text"
                value={topicForm.nameAr}
                onChange={(e) => setTopicForm({ ...topicForm, nameAr: e.target.value })}
                placeholder="مثال: الكوليرا"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                اسم الموضوع (إنجليزي)
              </label>
              <Input
                type="text"
                value={topicForm.name}
                onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                placeholder="Cholera"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                ترتيب العرض داخل التصنيف
              </label>
              <Input
                type="number"
                min="1"
                value={topicForm.order}
                onChange={(e) => setTopicForm({ ...topicForm, order: Number(e.target.value) })}
                className="w-full"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                الوصف (اختياري)
              </label>
              <Input
                type="text"
                value={topicForm.description}
                onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                placeholder="وصف الموضوع"
                className="w-full"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTopicForm(false);
                  setEditingTopic(null);
                  setTopicForm({
                    categoryId: "" as Id<"statCategories"> | "",
                    name: "",
                    nameAr: "",
                    order: 1,
                    description: "",
                  });
                  setSelectedCategoryId(null);
                }}
              >
                إلغاء
              </Button>
              <Button type="submit">
                {editingTopic ? "تحديث" : "إنشاء"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600">لا توجد تصنيفات بعد. ابدأ بإضافة قسم رئيسي.</p>
          </div>
        ) : (
          categories.map((category) => {
            const categoryTopics = topicsByCategory[category._id] || [];
            const activeTopics = categoryTopics.filter((t) => t.isActive);
            const inactiveTopics = categoryTopics.filter((t) => !t.isActive);

            return (
              <div key={category._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Category Header */}
                <div className={`p-4 sm:p-6 border-b ${category.isActive ? "bg-gray-50" : "bg-gray-100"}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-500">#{category.order}</span>
                        <h3 className={`text-lg font-bold ${category.isActive ? "text-gray-900" : "text-gray-500"}`}>
                          {category.nameAr}
                        </h3>
                        {!category.isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                            غير مفعل
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 text-start">{category.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {activeTopics.length} موضوع نشط | {inactiveTopics.length} موضوع غير نشط
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditCategory(category)}
                        className="text-xs sm:text-sm"
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCategory(category._id, category.isActive)}
                        className={`text-xs sm:text-sm ${
                          category.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {category.isActive ? "إيقاف التفعيل" : "تفعيل"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Topics List */}
                <div className="p-4 sm:p-6">
                  {categoryTopics.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      لا توجد مواضيع في هذا التصنيف
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {[...activeTopics, ...inactiveTopics]
                        .sort((a, b) => a.order - b.order)
                        .map((topic) => (
                          <div
                            key={topic._id}
                            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-lg border ${
                              topic.isActive
                                ? "bg-white border-gray-200"
                                : "bg-gray-50 border-gray-300"
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-500">#{topic.order}</span>
                                <span className={`font-medium ${topic.isActive ? "text-gray-900" : "text-gray-500 line-through"}`}>
                                  {topic.nameAr}
                                </span>
                                {!topic.isActive && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                                    غير مفعل
                                  </span>
                                )}
                              </div>
                              {topic.description && (
                                <p className="text-xs text-gray-500 text-start">{topic.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditTopic(topic)}
                                className="text-xs sm:text-sm"
                              >
                                تعديل
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleTopic(topic._id, topic.isActive)}
                                className={`text-xs sm:text-sm ${
                                  topic.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"
                                }`}
                              >
                                {topic.isActive ? "إيقاف" : "تفعيل"}
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

