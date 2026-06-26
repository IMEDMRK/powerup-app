"use client";

import React, { useState } from "react";
import { Plus, Trash, Edit, Check, X, Shield, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeamManager({ initialUsers, landingPages = [] }: { initialUsers: any[], landingPages?: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getQualityBadges = (stats: any) => {
    if (!stats) return null;
    const { confRate, delRate, assigned, confirmed } = stats;
    
    // Only show if they have enough data (e.g. > 5 orders assigned/confirmed)
    // Actually, let's just show it always if there's any data
    if (assigned === 0 && confirmed === 0) return null;

    let confBadge = "";
    if (confRate >= 60) confBadge = "🟢 ممتاز (تأكيد)";
    else if (confRate >= 50) confBadge = "🟡 متوسط (تأكيد)";
    else confBadge = "🔴 ضعيف (تأكيد)";

    let delBadge = "";
    if (delRate >= 60) delBadge = "🌟 ممتاز (توصيل)";
    else if (delRate >= 50) delBadge = "⚠️ متوسط (توصيل)";
    else delBadge = "🚩 ضعيف (توصيل)";

    return (
      <div className="flex items-center gap-1 mt-1">
        {assigned > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-white shadow-sm" title={`نسبة التأكيد: ${confRate.toFixed(1)}%`}>{confBadge}</span>}
        {confirmed > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-white shadow-sm" title={`نسبة التوصيل: ${delRate.toFixed(1)}%`}>{delBadge}</span>}
      </div>
    );
  };

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    permissions: {
      canViewOverview: false,
      canViewOrders: true,
      canViewRefills: false,
      canViewPages: false,
      canViewPerformance: false,
      canViewVersements: false,
      canViewExpenses: false,
      canViewCalculator: false,
      canViewTasks: false,
      canViewReports: false,
      canViewFeedback: false,
      canViewTeam: false,
      canViewWilayas: false,
      canViewSettings: false,

      canViewStats: false,
      canManageDelivery: false,
      canManagePages: false,
      canManageSettings: false,
      canManageTrash: false,
      canManageAllPages: true,
      allowedPages: [] as string[],
    },
    commissionPerDelivered: 0,
    upsellCommission: 0,
    dailyGoal: 20,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      password: "",
      permissions: { canViewOverview: false, canViewOrders: true, canViewRefills: false, canViewPages: false, canViewPerformance: false, canViewVersements: false, canViewExpenses: false, canViewCalculator: false, canViewTasks: false, canViewReports: false, canViewFeedback: false, canViewTeam: false, canViewWilayas: false, canViewSettings: false, canViewStats: false, canManageDelivery: false, canManagePages: false, canManageSettings: false, canManageTrash: false, canManageAllPages: true, allowedPages: [] },
      commissionPerDelivered: 0,
      upsellCommission: 0,
      dailyGoal: 20,
    });
    setEditingId(null);
  };

  const openEdit = (user: any) => {
    setFormData({
      name: user.name,
      username: user.username,
      password: "", // empty for edit, only update if typed
      permissions: {
        canViewOverview: user.permissions?.canViewOverview ?? user.permissions?.canViewStats ?? false,
        canViewOrders: user.permissions?.canViewOrders ?? true,
        canViewRefills: user.permissions?.canViewRefills ?? false,
        canViewPages: user.permissions?.canViewPages ?? user.permissions?.canManagePages ?? false,
        canViewPerformance: user.permissions?.canViewPerformance ?? user.permissions?.canViewStats ?? false,
        canViewVersements: user.permissions?.canViewVersements ?? user.permissions?.canViewStats ?? false,
        canViewExpenses: user.permissions?.canViewExpenses ?? user.permissions?.canViewStats ?? false,
        canViewCalculator: user.permissions?.canViewCalculator ?? false,
        canViewTasks: user.permissions?.canViewTasks ?? false,
        canViewReports: user.permissions?.canViewReports ?? false,
        canViewFeedback: user.permissions?.canViewFeedback ?? false,
        canViewTeam: user.permissions?.canViewTeam ?? false,
        canViewWilayas: user.permissions?.canViewWilayas ?? false,
        canViewSettings: user.permissions?.canViewSettings ?? user.permissions?.canManageSettings ?? false,

        canViewStats: user.permissions?.canViewStats ?? false,
        canManageDelivery: user.permissions?.canManageDelivery ?? false,
        canManagePages: user.permissions?.canManagePages ?? false,
        canManageSettings: user.permissions?.canManageSettings ?? false,
        canManageTrash: user.permissions?.canManageTrash ?? false,
        canManageAllPages: user.permissions?.canManageAllPages ?? true,
        allowedPages: user.permissions?.allowedPages || [],
      },
      commissionPerDelivered: user.commissionPerDelivered || 0,
      upsellCommission: user.upsellCommission || 0,
      dailyGoal: user.dailyGoal || 20,
    });
    setEditingId(user.id);
    setIsModalOpen(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isEdit = !!editingId;
    const url = isEdit ? `/api/admin/team/${editingId}` : `/api/admin/team`;
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        resetForm();
        router.refresh();
        // Optimistic local update (or just reload page)
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ");
      }
    } catch (err) {
      console.error(err);
      alert("فشل الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا.")) return;
    
    try {
      await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      setUsers(users.filter(u => u.id !== id));
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePermission = (key: keyof typeof formData.permissions) => {
    if (key === 'allowedPages') return;
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key]
      }
    });
  };

  const togglePagePermission = (slug: string) => {
    const current = formData.permissions.allowedPages || [];
    const updated = current.includes(slug)
      ? current.filter(s => s !== slug)
      : [...current, slug];
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        allowedPages: updated
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          قائمة الموظفين
        </h2>
        <div className="flex gap-3">
          <button onClick={() => router.push("/admin/team/performance")} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2">
            <Activity size={18} />
            إحصائيات وأداء
          </button>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            إضافة موظف
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-gray-500 font-semibold w-1/4">الاسم</th>
              <th className="p-4 text-gray-500 font-semibold w-1/4">اسم المستخدم</th>
              <th className="p-4 text-gray-500 font-semibold text-center">أداء الموظف (الطلبات المؤكدة)</th>
              <th className="p-4 text-gray-500 font-semibold text-center">العمولة/طلب</th>
              <th className="p-4 text-gray-500 font-semibold text-center">عمولة الإقناع/علبة</th>
              <th className="p-4 text-gray-500 font-semibold text-center">الهدف اليومي</th>
              <th className="p-4 text-gray-500 font-semibold">الصلاحيات</th>
              <th className="p-4 text-gray-500 font-semibold text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{user.name}</div>
                  {getQualityBadges(user.stats)}
                </td>
                <td className="p-4 text-gray-600 font-mono text-sm" dir="ltr">{user.username}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2 text-primary font-bold">
                    <Activity size={16} />
                    {user._count.ordersConfirmed} طلبية
                  </div>
                </td>
                <td className="p-4 text-center font-bold text-green-600">
                  {user.commissionPerDelivered} دج
                </td>
                <td className="p-4 text-center font-bold text-purple-600">
                  {user.upsellCommission || 0} دج
                </td>
                <td className="p-4 text-center font-bold text-gray-800">
                  {user.dailyGoal} طلبية
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions?.canViewStats && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full">الإحصائيات</span>}
                    {user.permissions?.canManageDelivery && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full">التوصيل</span>}
                    {user.permissions?.canManagePages && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full">الصفحات</span>}
                    {user.permissions?.canManageSettings && <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-1 rounded-full">الإعدادات</span>}
                    {(!user.permissions || (!user.permissions.canViewStats && !user.permissions.canManageDelivery && !user.permissions.canManagePages && !user.permissions.canManageSettings)) && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full">طلبيات فقط</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-left">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                    <button onClick={() => deleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">لا يوجد موظفين حالياً.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-gray-800">{editingId ? "تعديل موظف" : "إضافة موظف جديد"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={saveUser} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل (للعرض)</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="مثال: سارة محمد" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">اسم المستخدم (للدخول)</label>
                  <input required dir="ltr" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="sara_m" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">كلمة السر {editingId && "(اتركه فارغاً إذا لم ترد تغييره)"}</label>
                  <input required={!editingId} dir="ltr" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">عمولة الموظف على كل طلبية مستلمة (دج)</label>
                  <input required type="number" min="0" value={formData.commissionPerDelivered} onChange={e => setFormData({...formData, commissionPerDelivered: parseInt(e.target.value) || 0})} className="w-full bg-orange-50 text-primary font-bold border border-orange-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="20" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">عمولة الإقناع (عن كل علبة إضافية)</label>
                  <input required type="number" min="0" value={formData.upsellCommission} onChange={e => setFormData({...formData, upsellCommission: parseInt(e.target.value) || 0})} className="w-full bg-purple-50 text-purple-600 font-bold border border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="100" title="كم يأخذ الموظف إذا أضاف علبة فوق الكمية الأصلية؟" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الهدف اليومي (Gamification) 🎯</label>
                  <input required type="number" min="1" value={formData.dailyGoal} onChange={e => setFormData({...formData, dailyGoal: parseInt(e.target.value) || 20})} className="w-full bg-blue-50 text-blue-600 font-bold border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="20" title="كم طلبية تتوقع منه أن يؤكدها في اليوم؟" />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-3">المنتجات المخصصة للموظف</label>
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors mb-2">
                    <input type="checkbox" checked={formData.permissions.canManageAllPages !== false} onChange={() => togglePermission("canManageAllPages")} className="w-5 h-5 rounded text-primary focus:ring-primary" />
                    <span className="text-sm font-bold text-gray-800">السماح له بالعمل على جميع المنتجات (موصى به)</span>
                  </label>
                  
                  {formData.permissions.canManageAllPages === false && (
                    <div className="mr-6 p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-2 mt-2 max-h-48 overflow-y-auto">
                      {landingPages.length === 0 ? (
                        <div className="text-xs text-orange-600">لا توجد صفحات هبوط نشطة حالياً.</div>
                      ) : (
                        landingPages.map(page => (
                          <label key={page.slug} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/50 cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              checked={(formData.permissions.allowedPages || []).includes(page.slug)} 
                              onChange={() => togglePagePermission(page.slug)} 
                              className="w-4 h-4 rounded text-primary focus:ring-primary" 
                            />
                            <span className="text-sm font-medium text-gray-700">{page.productName} <span className="text-xs text-gray-400 font-mono" dir="ltr">({page.slug})</span></span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-3">صلاحيات الأقسام (ظهور في القائمة الجانبية)</label>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">اختر الأقسام التي يحق لهذا الموظف الدخول إليها في لوحة التحكم:</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {[
                      { key: "canViewOverview", label: "📊 نظرة عامة" },
                      { key: "canViewOrders", label: "📦 الطلبيات" },
                      { key: "canViewRefills", label: "🔄 إعادة الطلب" },
                      { key: "canViewPages", label: "🌐 صفحات الهبوط" },
                      { key: "canViewPerformance", label: "📈 أداء الإعلانات" },
                      { key: "canViewVersements", label: "🚚 المدفوعات" },
                      { key: "canViewExpenses", label: "💸 النفقات" },
                      { key: "canViewCalculator", label: "🧮 حاسبة الأرباح" },
                      { key: "canViewTasks", label: "📋 لوحة المهام" },
                      { key: "canViewReports", label: "📝 تقارير الفريق" },
                      { key: "canViewFeedback", label: "💬 صندوق الشكاوى" },
                      { key: "canViewTeam", label: "🛡️ فريق العمل" },
                      { key: "canViewWilayas", label: "📍 التوصيل (الولايات)" },
                      { key: "canViewSettings", label: "⚙️ الإعدادات" },
                    ].map(perm => (
                      <label key={perm.key} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-100 hover:border-gray-300 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.permissions[perm.key as keyof typeof formData.permissions] as boolean} 
                          onChange={() => togglePermission(perm.key as keyof typeof formData.permissions)} 
                          className="w-4 h-4 rounded text-primary focus:ring-primary" 
                        />
                        <span className="text-sm font-bold text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>

                  <hr className="my-4 border-gray-100" />
                  <label className="block text-sm font-bold text-gray-700 mb-3">صلاحيات إضافية (العمليات)</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                      <input type="checkbox" checked={formData.permissions.canViewStats} onChange={() => togglePermission("canViewStats")} className="w-5 h-5 rounded text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-gray-700">رؤية الإحصائيات والأرباح المالية (داخل صفحة الطلبيات)</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                      <input type="checkbox" checked={formData.permissions.canManageDelivery} onChange={() => togglePermission("canManageDelivery")} className="w-5 h-5 rounded text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-gray-700">توليد بوليصات التوصيل (إرسال الطلبيات لشركة التوصيل)</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                      <input type="checkbox" checked={formData.permissions.canManageTrash} onChange={() => togglePermission("canManageTrash")} className="w-5 h-5 rounded text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-gray-700">الوصول لسلة المهملات (حذف/استرجاع الطلبيات)</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                      <input type="checkbox" checked={formData.permissions.canManageSettings} onChange={() => togglePermission("canManageSettings")} className="w-5 h-5 rounded text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-gray-700">تعديل الإعدادات الحساسة (البيكسل، الباسوورد، إلخ)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/80 rounded-b-3xl">
                <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                  {loading ? "جاري الحفظ..." : <><Check size={20} /> حفظ الموظف</>}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
