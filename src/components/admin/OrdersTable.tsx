"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Save, Trash2, Phone, User, MapPin, Package, Tag, Truck, DollarSign, Search, Filter, Download } from "lucide-react";
import { useDashboard } from "./DashboardProvider";

// ── Status Config ──────────────────────────────────────────
const STATUSES = [
  { value: "جديدة",                    label: "🆕 جديدة",                             color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "جديد",                     label: "🆕 جديد",                              color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "غير مكتملة",               label: "⚠️ غير مكتملة",                       color: "bg-gray-200 text-gray-800 border-gray-300" },
  { value: "تم الاتصال للمرة الأولى",  label: "📞 تم الاتصال (1)",                     color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "تم الاتصال للمرة الثانية", label: "📞📩 اتصال ثاني + رسالة",               color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "تم الاتصال للمرة الثالثة", label: "📞📞📞 اتصال ثالث",                     color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "مؤكدة",                    label: "✅ مؤكدة",                              color: "bg-green-100 text-green-800 border-green-200" },
  { value: "الزبون لا يرد",            label: "🔕 الزبون لا يرد",                      color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "مؤجلة",                    label: "⏳ مؤجلة",                              color: "bg-blue-50 text-blue-800 border-blue-200" },
  { value: "ملغاة",                    label: "❌ ملغاة",                              color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "روتور",                    label: "↩️ روتور",                              color: "bg-red-100 text-red-800 border-red-200" },
  { value: "مستلمة",                   label: "📦 مستلمة",                             color: "bg-teal-100 text-teal-800 border-teal-200" },
];

function getStatusStyle(status: string) {
  return STATUSES.find(s => s.value === status)?.color || "bg-gray-100 text-gray-700 border-gray-200";
}
function getStatusLabel(status: string) {
  return STATUSES.find(s => s.value === status)?.label || status;
}

function getRowBg(status: string) {
  switch (status) {
    case "جديدة":
    case "جديد":
      return "bg-blue-50/60 hover:bg-blue-100/60";
    case "مؤكدة":
      return "bg-green-50/60 hover:bg-green-100/60";
    case "ملغاة":
    case "روتور":
      return "bg-red-50/60 hover:bg-red-100/60";
    case "غير مكتملة":
    case "الزبون لا يرد":
      return "bg-gray-50/60 hover:bg-gray-100/60";
    case "مستلمة":
      return "bg-teal-50/60 hover:bg-teal-100/60";
    case "تم الاتصال للمرة الأولى":
      return "bg-yellow-50/60 hover:bg-yellow-100/60";
    case "تم الاتصال للمرة الثانية":
      return "bg-orange-50/60 hover:bg-orange-100/60";
    case "تم الاتصال للمرة الثالثة":
      return "bg-purple-50/60 hover:bg-purple-100/60";
    case "مؤجلة":
      return "bg-indigo-50/60 hover:bg-indigo-100/60";
    default:
      return "hover:bg-orange-50/30";
  }
}

import EditModal from "./modals/EditOrderModal";
import NewOrderModal from "./modals/NewOrderModal";

const getQualityBadges = (stats: any) => {
  if (!stats) return null;
  const { confRate, delRate, assigned, confirmed } = stats;
  if (assigned === 0 && confirmed === 0) return null;

  let confBadge = "";
  if (confRate >= 60) confBadge = "🟢";
  else if (confRate >= 50) confBadge = "🟡";
  else confBadge = "🔴";

  let delBadge = "";
  if (delRate >= 60) delBadge = "🌟";
  else if (delRate >= 50) delBadge = "⚠️";
  else delBadge = "🚩";

  return (
    <div className="flex items-center gap-2 mt-1">
      {assigned > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-white shadow-sm font-bold" title={`نسبة التأكيد: ${confRate.toFixed(1)}%`}>{confBadge} {confRate.toFixed(0)}%</span>}
      {confirmed > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-white shadow-sm font-bold" title={`نسبة التوصيل: ${delRate.toFixed(1)}%`}>{delBadge} {delRate.toFixed(0)}%</span>}
    </div>
  );
};

// ── Main Table ─────────────────────────────────────────────
export default function OrdersTable({ 
  initialOrders = [], 
  totalOrders = 0,
  currentPage = 1,
  currentSearch = "",
  currentFilterStatus = "",
  currentFilterProduct = "",
  statsTotal = 0,
  statsPending = 0,
  statsDrafts = 0,
  statsConfirmed = 0,
  statsCancelled = 0,
  user, agents = [], offers = [], deliveryProviders = [], wilayas = [], products = [] 
}: any) {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const { t } = useDashboard();
  
  const [search, setSearch] = useState(currentSearch);
  const [filterStatus, setFilterStatus] = useState(currentFilterStatus);
  const [filterProduct, setFilterProduct] = useState(currentFilterProduct);
  
  useEffect(() => { setOrders(initialOrders); setIsNavigating(false); }, [initialOrders]);
  useEffect(() => {
    setSearch(currentSearch);
    setFilterStatus(currentFilterStatus);
    setFilterProduct(currentFilterProduct);
  }, [currentSearch, currentFilterStatus, currentFilterProduct]);

  const [editOrder, setEditOrder] = useState<any | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendingBulk, setSendingBulk] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [assigningBulk, setAssigningBulk] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [cancelingBulk, setCancelingBulk] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ id: string, reason: string } | null>(null);
  
  const pageSize = 10;

  const CANCEL_REASONS = [
    "السعر غالي",
    "غيّر رأيه",
    "اشترى من مكان آخر",
    "رقم خاطئ / لا يعمل",
    "لا يرد",
    "مكررة",
    "غير ذلك"
  ];

  const isAdmin = user?.role === "ADMIN" || !user?.role;
  const perms = user?.permissions || {};
  const canViewStats = isAdmin || perms.canViewStats;
  const canManageDelivery = isAdmin || perms.canManageDelivery;

  // Stats
  const total = statsTotal;
  const confirmed = statsConfirmed;
  const cancelled = statsCancelled;
  const drafts = statsDrafts;
  const pending = statsPending;

  const filtered = orders; // Kept for compatibility with toggleAll
  const paginatedOrders = orders;
  const totalPages = Math.ceil(totalOrders / pageSize) || 1;

  const applyFilters = () => {
    setIsNavigating(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filterStatus) params.set("status", filterStatus);
    if (filterProduct) params.set("product", filterProduct);
    params.set("page", "1");
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setIsNavigating(true);
    const params = new URLSearchParams();
    if (currentSearch) params.set("q", currentSearch);
    if (currentFilterStatus) params.set("status", currentFilterStatus);
    if (currentFilterProduct) params.set("product", currentFilterProduct);
    params.set("page", page.toString());
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') applyFilters();
  };

  const productSlugs = [...new Set(orders.map(o => o.pageSlug).filter(Boolean))];

  const handleStatusQuick = async (id: string, newStatus: string, cancelReason?: string) => {
    if (newStatus === "ملغاة" && !cancelReason) {
      setCancelModal({ id, reason: "" });
      return;
    }

    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, cancelReason }),
    });
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, cancelReason } : o));
    setCancelModal(null);
  };

  const handleSaved = (updated: any) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const handleCreated = (newOrder: any) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(o => o.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleBulkSend = async (providerId: string) => {
    if (!providerId) return;
    setSendingBulk(true);
    setShowProviderModal(false);
    try {
      const res = await fetch("/api/admin/orders/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selected), providerId })
      });
      const data = await res.json();
      if (data.results) {
        alert(`تم إرسال: ${data.results.success} بنجاح، ${data.results.failed} فشل`);
        window.location.reload();
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch {
      alert("حدث خطأ في الاتصال");
    }
    setSendingBulk(false);
  };

  const handleBulkAssign = async (agentId: string) => {
    if (!agentId) return;
    setAssigningBulk(true);
    setShowAgentModal(false);
    try {
      const res = await fetch("/api/admin/orders/bulk-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selected), agentId })
      });
      const data = await res.json();
      if (data.success) {
        alert(`تم تحويل ${data.count} طلبية بنجاح`);
        window.location.reload();
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch {
      alert("حدث خطأ في الاتصال");
    }
    setAssigningBulk(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm("هل أنت متأكد من نقل هذه الطلبيات إلى سلة المهملات؟")) return;
    setDeletingBulk(true);
    try {
      const res = await fetch("/api/admin/orders/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selected) })
      });
      if (res.ok) {
        alert("تم النقل إلى سلة المهملات بنجاح");
        setOrders(prev => prev.filter(o => !selected.has(o.id)));
        setSelected(new Set());
      } else {
        alert("حدث خطأ أثناء الحذف");
      }
    } catch {
      alert("خطأ في الاتصال");
    }
    setDeletingBulk(true);
  };

  const handleBulkCancel = async () => {
    if (!confirm("هل أنت متأكد من إلغاء هذه الطلبيات؟")) return;
    setCancelingBulk(true);
    try {
      const res = await fetch("/api/admin/orders/bulk-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selected) })
      });
      if (res.ok) {
        alert("تم إلغاء الطلبيات المحددة");
        setOrders(prev => prev.map(o => selected.has(o.id) ? { ...o, status: "ملغاة" } : o));
        setSelected(new Set());
      } else {
        alert("حدث خطأ أثناء الإلغاء");
      }
    } catch {
      alert("خطأ في الاتصال");
    }
    setCancelingBulk(false);
  };

  const exportCSV = () => {
    const toExport = selected.size > 0 
      ? orders.filter(o => selected.has(o.id))
      : filtered;

    if (toExport.length === 0) {
      alert("لا يوجد طلبات للتصدير");
      return;
    }

    const headers = canViewStats 
      ? ["رقم الطلب", "الزبون", "الهاتف", "الولاية", "البلدية", "المنتج", "الكمية", "سعر المنتج (دج)", "سعر التوصيل (دج)", "الإجمالي (دج)", "الحالة", "شركة التوصيل", "تاريخ الطلب"]
      : ["رقم الطلب", "الزبون", "الهاتف", "الولاية", "البلدية", "المنتج", "الكمية", "الحالة", "شركة التوصيل", "تاريخ الطلب"];
    
    const rows = toExport.map(o => {
      const baseInfo = [o.id, o.fullName || "", o.phone || "", o.wilaya || "", o.baladiya || "", o.pageSlug || "", o.quantity || 1];
      const financialInfo = canViewStats ? [o.unitPrice || 0, o.deliveryPrice || 0, o.totalPrice || 0] : [];
      const statusInfo = [o.status || "", o.deliveryProvider || "", new Date(o.createdAt).toLocaleString("ar-DZ")];
      return [...baseInfo, ...financialInfo, ...statusInfo];
    });

    const csvContent = [
      "sep=,",
      headers.join(","),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {editOrder && (
        <EditModal order={editOrder} onClose={() => setEditOrder(null)} onSaved={handleSaved} canViewStats={canViewStats} offers={offers} wilayas={wilayas} />
      )}
      
      {showNewOrder && (
        <NewOrderModal onClose={() => setShowNewOrder(false)} onCreated={handleCreated} offers={offers} wilayas={wilayas} products={products} />
      )}

      {/* Provider Selection Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-black mb-4">اختر شركة التوصيل</h3>
            <div className="space-y-3 mb-6">
              {deliveryProviders.map((p: any) => (
                <button key={p.id} onClick={() => handleBulkSend(p.id)}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl hover:border-primary hover:bg-orange-50 font-bold transition-all text-gray-800">
                  {p.name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowProviderModal(false)} className="text-gray-500 font-bold">إلغاء</button>
          </div>
        </div>
      )}

      {/* Agent Selection Modal */}
      {showAgentModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-black mb-4">تحويل الطلبات لموظف</h3>
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              <button onClick={() => handleBulkAssign("UNASSIGNED")}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl hover:border-red-500 hover:bg-red-50 font-bold transition-all text-gray-800">
                إلغاء التعيين (مفتوحة للجميع)
              </button>
              {(agents || []).map((a: any) => (
                <button key={a.id} onClick={() => handleBulkAssign(a.id)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl hover:border-primary hover:bg-orange-50 font-bold transition-all text-gray-800 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span>{a.name || "بدون اسم"}</span>
                    <span className="text-xs text-gray-400 font-normal">({a.username})</span>
                  </div>
                  {getQualityBadges(a.stats)}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAgentModal(false)} className="text-gray-500 font-bold">إلغاء</button>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-black mb-2 text-red-600">إلغاء الطلبية</h3>
            <p className="text-sm text-gray-500 mb-4">الرجاء اختيار سبب الإلغاء بدقة لمساعدتنا في تحسين الأداء:</p>
            <div className="space-y-2 mb-6">
              {CANCEL_REASONS.map(r => (
                <button key={r} onClick={() => setCancelModal(prev => prev ? { ...prev, reason: r } : null)}
                  className={`w-full p-3 rounded-xl font-bold transition-all border-2 text-sm ${
                    cancelModal.reason === r 
                      ? "bg-red-50 border-red-500 text-red-700" 
                      : "bg-white border-gray-100 hover:border-red-200 text-gray-700"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)} className="flex-1 py-3 text-gray-500 font-bold border border-gray-200 rounded-xl hover:bg-gray-50">إلغاء</button>
              <button 
                disabled={!cancelModal.reason}
                onClick={() => handleStatusQuick(cancelModal.id, "ملغاة", cancelModal.reason)} 
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all">
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-4 flex items-center justify-between sticky top-4 z-10 backdrop-blur-md">
          <span className="font-bold text-primary">تم تحديد {selected.size} طلب</span>
          <div className="flex gap-2">
            <button 
              disabled={cancelingBulk}
              onClick={handleBulkCancel}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center gap-1.5">
              {cancelingBulk ? "جاري الإلغاء..." : "🚫 إلغاء المحدد"}
            </button>
            {isAdmin && (
              <button 
                disabled={deletingBulk}
                onClick={handleBulkDelete}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-red-100 transition-all flex items-center gap-1.5">
                {deletingBulk ? "جاري الحذف..." : "🗑️ حذف المحدد (سلة المهملات)"}
              </button>
            )}
            <button 
              onClick={() => {
                const ids = Array.from(selected).join(",");
                window.open(`/admin/print?ids=${ids}`, "_blank");
              }}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center gap-1.5">
              🖨️ طباعة المحددة
            </button>
            {isAdmin && (
              <button 
                disabled={assigningBulk || agents.length === 0}
                onClick={() => setShowAgentModal(true)}
                className="bg-white border border-primary/20 text-primary px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-orange-50 transition-all disabled:opacity-50">
                {assigningBulk ? "جاري التحويل..." : "🔄 تحويل لموظف آخر"}
              </button>
            )}
            {canManageDelivery && (
              <button 
                disabled={sendingBulk || deliveryProviders.length === 0}
                onClick={() => setShowProviderModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-primary-dark transition-all disabled:opacity-50">
                {sendingBulk ? "جاري الإرسال..." : "📦 إرسال لشركة التوصيل"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "إجمالي الطلبات", val: total, color: "text-gray-800", bg: "bg-gradient-to-br from-white to-gray-100", border: "border-gray-300" },
          { label: "قيد المعالجة", val: pending, color: "text-yellow-800", bg: "bg-gradient-to-br from-yellow-50 to-yellow-200", border: "border-yellow-400" },
          { label: "غير مكتملة", val: drafts, color: "text-orange-800", bg: "bg-gradient-to-br from-orange-50 to-orange-200", border: "border-orange-400" },
          { label: "مؤكدة", val: confirmed, color: "text-green-800", bg: "bg-gradient-to-br from-green-50 to-green-200", border: "border-green-500" },
          { label: "ملغاة", val: cancelled, color: "text-red-800", bg: "bg-gradient-to-br from-red-50 to-red-200", border: "border-red-400" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl border border-b-4 border-r-2 ${s.border} p-5 shadow-sm transform hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden group cursor-default`}>
            {/* Glossy Reflection overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-2xl"></div>
            {/* Background animated shape */}
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/30 transition-transform duration-500 group-hover:scale-[2.5] pointer-events-none"></div>
            
            <div className={`text-4xl font-black ${s.color} drop-shadow-sm relative z-10`}>
              {s.val}
            </div>
            <div className={`text-sm font-bold mt-2 ${s.color} opacity-90 relative z-10`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("searchPlaceholder")}
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl pr-9 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[150px]">
          <option value="">{t("allStatuses")}</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {productSlugs.length > 0 && (
          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[150px]">
            <option value="">{t("allProducts")}</option>
            {productSlugs.map((p: any) => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <button onClick={applyFilters} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
          🔍 بحث
        </button>
        <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
          <Download size={16} /> {t("exportExcel")}
        </button>
        <button onClick={() => setShowNewOrder(true)} className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap">
          ➕ إضافة طلبية
        </button>
      </div>

      {/* Table & Cards Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <input type="checkbox" className="w-4 h-4 accent-primary rounded" 
                    checked={selected.size === filtered.length && filtered.length > 0} 
                    onChange={toggleAll} />
                </th>
                <th className="px-4 py-3">{t("customer")}</th>
                <th className="px-4 py-3">{t("phone")}</th>
                <th className="px-4 py-3">{t("wilaya")}</th>
                <th className="px-4 py-3">{t("product")}</th>
                <th className="px-4 py-3 text-center">{t("deliveryCol")}</th>
                {canViewStats && <th className="px-4 py-3 text-center">{t("total")}</th>}
                <th className="px-4 py-3 text-center">{t("status")}</th>
                <th className="px-4 py-3 text-center">{t("date")}</th>
                <th className="px-4 py-3 text-center">{t("edit")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr><td colSpan={10} className="py-16 text-center text-gray-400">لا توجد طلبات مطابقة</td></tr>
              ) : (
                paginatedOrders.map((order: any) => (
                  <tr key={order.id} className={`border-b border-gray-100 transition-colors group ${getRowBg(order.status)}`}>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" className="w-4 h-4 accent-primary rounded"
                        checked={selected.has(order.id)}
                        onChange={() => toggleOne(order.id)} />
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900 dark:text-white">{order.fullName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 font-mono">{order.id.slice(0, 6)}...</span>
                        {isAdmin && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1 font-bold whitespace-nowrap">
                            <User size={10} /> {order.assignedTo?.name || "غير معين"}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="px-4 py-3">
                      <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline font-medium flex items-center gap-1 w-max" dir="ltr">
                        <Phone size={12} /> {order.phone}
                      </a>
                      {order.hasRetour && (
                        <div className="text-[10px] bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.5 rounded flex items-center gap-1 mt-1 font-bold w-max">
                          ⚠️ روتور
                        </div>
                      )}
                      {order.hasCancelled && !order.hasRetour && (
                        <div className="text-[10px] bg-orange-100 text-orange-800 border border-orange-200 px-1.5 py-0.5 rounded flex items-center gap-1 mt-1 font-bold w-max">
                          ⚠️ ملغاة سابقا
                        </div>
                      )}
                      {order.isDuplicate && (
                        <div className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-300 px-1.5 py-0.5 rounded flex items-center gap-1 mt-1 font-bold w-max">
                          🟡 مكررة
                        </div>
                      )}
                    </td>
                    {/* Location */}
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      <div className="font-medium">{order.wilaya}</div>
                      <div className="text-gray-400">{order.baladiya}</div>
                    </td>
                    {/* Product */}
                    <td className="px-4 py-3">
                      {order.pageSlug && (
                        <div className="text-xs font-bold text-primary bg-orange-50 px-2 py-0.5 rounded-full inline-block mb-1">
                          {order.pageSlug.toUpperCase()}
                        </div>
                      )}
                      {order.offerLabel ? (
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <Tag size={11} /> {order.offerLabel}
                          {order.quantity > 1 && <span className="text-primary font-bold">× {order.quantity}</span>}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-300">—</div>
                      )}
                    </td>
                    {/* Delivery Status & Price */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {/* 1. Show Delivery Price based on Wilaya or Free Shipping */}
                        {(() => {
                          // Check if offer is free shipping
                          const isFreeShipping = offers.find((o: any) => o.id === order.offerId || o.label === order.offerLabel)?.freeShipping;
                          
                          if (isFreeShipping) {
                            return (
                              <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                توصيل مجاني
                              </span>
                            );
                          }

                          // ALWAYS use live Wilaya price for display if available
                          let dPrice = order.deliveryPrice || 0;
                          const wMatch = wilayas.find((w: any) => w.wilayaName === order.wilaya);
                          if (wMatch) {
                            dPrice = wMatch.deliveryPrice;
                          }

                          return dPrice > 0 ? (
                            <span className="text-xs font-black text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {dPrice} دج
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          );
                        })()}

                        {/* 2. Show Tracking / Provider Info */}
                        {order.trackingId && (
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200 mt-1 whitespace-nowrap">
                            {order.deliveryProvider || "مُرسل"}
                          </span>
                        )}
                        {order.bordereauUrl && (
                          <a href={order.bordereauUrl} target="_blank" className="text-blue-600 hover:underline text-xs flex items-center gap-1 font-mono mt-1">
                            🖨️ طباعة
                          </a>
                        )}
                      </div>
                    </td>
                    {/* Total */}
                    {canViewStats && (
                      <td className="px-4 py-3 text-center">
                        {(() => {
                          const isFreeShipping = offers.find((o: any) => o.id === order.offerId || o.label === order.offerLabel)?.freeShipping;
                          let dPrice = isFreeShipping ? 0 : order.deliveryPrice || 0;
                          
                          // Use live Wilaya price for display if available
                          if (!isFreeShipping) {
                            const wMatch = wilayas.find((w: any) => w.wilayaName === order.wilaya);
                            if (wMatch) {
                              dPrice = wMatch.deliveryPrice;
                            }
                          }

                          // Recalculate total dynamically based on unit price and live delivery price and discount
                          const liveTotal = (order.unitPrice || 0) + dPrice - (order.discount || 0);

                          return liveTotal > 0 ? (
                            <div>
                              <div className="font-black text-gray-800">{liveTotal.toLocaleString()} دج</div>
                              {dPrice > 0 && (
                                <div className="text-xs text-gray-400 flex items-center justify-center gap-0.5">
                                  <Truck size={10} /> {dPrice} دج توصيل
                                </div>
                              )}
                              {isFreeShipping && (
                                <div className="text-[10px] text-green-600 font-bold mt-0.5">توصيل مجاني</div>
                              )}
                            </div>
                          ) : <span className="text-gray-300">—</span>;
                        })()}
                      </td>
                    )}
                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <select value={order.status}
                        onChange={e => handleStatusQuick(order.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-full border appearance-none cursor-pointer outline-none ${getStatusStyle(order.status)}`}>
                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-center text-gray-400 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("ar-DZ")}
                      <div>{new Date(order.createdAt).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    {/* Edit */}
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setEditOrder(order)}
                        className="opacity-0 group-hover:opacity-100 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-all">
                        تعديل
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="lg:hidden p-4 flex flex-col gap-4">
          {paginatedOrders.length === 0 ? (
            <div className="py-16 text-center text-gray-400">لا توجد طلبات مطابقة</div>
          ) : (
            paginatedOrders.map((order: any) => (
              <div key={order.id} className={`bg-white dark:bg-gray-800 border rounded-2xl p-4 shadow-sm relative ${selected.has(order.id) ? 'border-primary ring-1 ring-primary' : 'border-gray-100 dark:border-gray-700'} ${getRowBg(order.status)}`}>
                {/* Header: Select + Status + Options */}
                <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 accent-primary rounded"
                      checked={selected.has(order.id)}
                      onChange={() => toggleOne(order.id)} />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 6)}</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("ar-DZ")}</span>
                    </div>
                  </div>
                  <select value={order.status}
                    onChange={e => handleStatusQuick(order.id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg border appearance-none cursor-pointer outline-none max-w-[120px] ${getStatusStyle(order.status)}`}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                {/* Body: Customer details */}
                <div className="mb-4">
                  <div className="font-bold text-gray-900 dark:text-white text-lg">{order.fullName}</div>
                  <a href={`tel:${order.phone}`} className="text-primary hover:underline font-bold flex items-center gap-2 mt-2 bg-primary/10 w-max px-3 py-1.5 rounded-lg text-sm" dir="ltr">
                    <Phone size={14} /> {order.phone}
                  </a>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {order.hasRetour && <span className="text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded-md font-bold">⚠️ روتور</span>}
                    {order.hasCancelled && !order.hasRetour && <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded-md font-bold">⚠️ ملغاة سابقا</span>}
                    {order.isDuplicate && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md font-bold">🟡 مكررة</span>}
                    {isAdmin && order.assignedTo && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md flex items-center gap-1 font-bold w-max"><User size={10} /> {order.assignedTo.name}</span>}
                  </div>
                </div>

                {/* Footer: Product, Location, Actions */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-sm grid grid-cols-2 gap-3 mb-3 border border-gray-100 dark:border-gray-800">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">المنتج</div>
                    <div className="font-bold text-primary">{order.pageSlug?.toUpperCase()}</div>
                    {order.offerLabel && <div className="text-xs text-gray-600 mt-0.5">{order.offerLabel} {order.quantity > 1 && <span className="text-primary font-bold">× {order.quantity}</span>}</div>}
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">العنوان</div>
                    <div className="font-bold">{order.wilaya}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{order.baladiya}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setEditOrder(order)}
                    className="flex-1 text-sm font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 py-2.5 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                    📝 تعديل
                  </button>
                  {order.bordereauUrl && (
                    <a href={order.bordereauUrl} target="_blank" className="flex-1 text-sm font-bold bg-blue-50 text-blue-600 py-2.5 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                      🖨️ طباعة
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Loading Overlay */}
        {isNavigating && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="mt-2 font-bold text-primary text-sm">جاري التحميل...</div>
            </div>
          )}
        {totalOrders > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              عرض {paginatedOrders.length} من {totalOrders} طلب
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 font-bold transition-colors">
                  السابق
                </button>
                <div className="px-2 flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                          currentPage === pageNum 
                            ? "bg-primary text-white" 
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 font-bold transition-colors">
                  التالي
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
