"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Trash2, Phone, User, MapPin, Package, Tag, Truck, DollarSign, Search, Filter, Download } from "lucide-react";

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

// ── Edit Modal ─────────────────────────────────────────────
function EditModal({ order, onClose, onSaved, canViewStats }: { order: any; onClose: () => void; onSaved: (updated: any) => void; canViewStats: boolean }) {
  const [form, setForm] = useState({ ...order });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  // auto-compute total
  useEffect(() => {
    const total = (Number(form.unitPrice) || 0) + (Number(form.deliveryPrice) || 0);
    setForm((p: any) => ({ ...p, totalPrice: total }));
  }, [form.unitPrice, form.deliveryPrice]);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { onSaved(await res.json()); onClose(); }
    else alert("حدث خطأ أثناء الحفظ");
    setSaving(false);
  };

  const del = async () => {
    if (!confirm("هل تريد حذف هذا الطلب نهائياً؟")) return;
    await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
    onClose();
    window.location.reload();
  };

  const input = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900">تعديل الطلبية</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.id.slice(0, 8)}...</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div>
            <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-wide">حالة الطلبية</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => (
                <button key={s.value} type="button"
                  onClick={() => set("status", s.value)}
                  className={`text-right px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${form.status === s.value ? s.color + " border-current scale-[1.02] shadow-sm" : "border-gray-100 hover:border-gray-300 text-gray-600"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Customer Info */}
          <div>
            <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">
              <User size={13} /> معلومات الزبون
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">الاسم الكامل</label>
                <input value={form.fullName} onChange={e => set("fullName", e.target.value)} className={input} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">رقم الهاتف</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)} dir="ltr" className={input + " text-right"} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">الولاية</label>
                <input value={form.wilaya} onChange={e => set("wilaya", e.target.value)} className={input} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">البلدية</label>
                <input value={form.baladiya} onChange={e => set("baladiya", e.target.value)} className={input} />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Order Details */}
          <div>
            <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">
              <Package size={13} /> تفاصيل الطلبية
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">العرض المختار</label>
                <input value={form.offerLabel || ""} onChange={e => set("offerLabel", e.target.value)}
                  placeholder="مثال: علبتان" className={input} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">الكمية</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => set("quantity", Math.max(1, (form.quantity || 1) - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-gray-100 shrink-0">−</button>
                  <input type="number" min={1} value={form.quantity || 1} onChange={e => set("quantity", parseInt(e.target.value) || 1)}
                    className={input + " text-center font-bold"} />
                  <button type="button" onClick={() => set("quantity", (form.quantity || 1) + 1)}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-gray-100 shrink-0">+</button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">المنتج</label>
                <input value={form.pageSlug || ""} onChange={e => set("pageSlug", e.target.value)}
                  placeholder="powerup" className={input} />
              </div>
              <div className="col-span-2 mt-2">
                <label className="block text-xs text-gray-500 mb-1">ملاحظات (تظهر لشركة التوصيل والموظفين)</label>
                <textarea 
                  value={form.notes || ""} 
                  onChange={e => set("notes", e.target.value)}
                  placeholder="اكتب أي ملاحظة هنا (مثال: الزبون يطلب التوصيل بعد الساعة 4 مساءً)" 
                  className={input + " min-h-[80px] resize-y"} 
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Pricing */}
          {canViewStats && (
            <div>
              <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <DollarSign size={13} /> الأسعار والتكاليف
              </label>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">سعر المنتج (دج)</label>
                  <input type="number" value={form.unitPrice || 0} onChange={e => set("unitPrice", parseInt(e.target.value) || 0)}
                    className={input + " text-center font-bold"} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">تكلفة الشراء الأصلية (دج)</label>
                  <input type="number" value={form.productCost || 0} onChange={e => set("productCost", parseInt(e.target.value) || 0)}
                    className={input + " text-center font-bold text-red-600 bg-red-50 border-red-200"} title="سعر الشراء الأصلي (لحساب صافي الربح)" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">سعر التوصيل (دج)</label>
                  <input type="number" value={form.deliveryPrice || 0} onChange={e => set("deliveryPrice", parseInt(e.target.value) || 0)}
                    className={input + " text-center font-bold"} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الإجمالي (دج)</label>
                  <div className={input + " text-center font-black text-primary bg-orange-50 border-primary/30"}>
                    {((form.unitPrice || 0) + (form.deliveryPrice || 0)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          <button onClick={del} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-bold transition-colors">
            <Trash2 size={16} /> حذف الطلبية
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              إلغاء
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark disabled:opacity-60 transition-all">
              <Save size={16} />
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Table ─────────────────────────────────────────────
export default function OrdersTable({ initialOrders, deliveryProviders = [], agents = [], user }: { initialOrders: any[], deliveryProviders?: any[], agents?: any[], user?: any }) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [editOrder, setEditOrder] = useState<any | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendingBulk, setSendingBulk] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [assigningBulk, setAssigningBulk] = useState(false);

  const isAdmin = user?.role === "ADMIN" || !user?.role;
  const perms = user?.permissions || {};
  const canViewStats = isAdmin || perms.canViewStats;
  const canManageDelivery = isAdmin || perms.canManageDelivery;

  // Stats
  const total = orders.length;
  const confirmed = orders.filter(o => o.status === "مؤكدة").length;
  const cancelled = orders.filter(o => o.status === "ملغاة").length;
  const drafts = orders.filter(o => o.status === "غير مكتملة").length;
  const pending = orders.filter(o => !["مؤكدة", "ملغاة", "غير مكتملة"].includes(o.status)).length;

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = o.fullName?.includes(q) || o.phone?.includes(q) || o.wilaya?.includes(q);
    const matchStatus = filterStatus ? o.status === filterStatus : true;
    const matchProduct = filterProduct ? o.pageSlug === filterProduct : true;
    return matchSearch && matchStatus && matchProduct;
  });

  const products = [...new Set(orders.map(o => o.pageSlug).filter(Boolean))];

  const handleStatusQuick = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleSaved = (updated: any) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
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
        <EditModal order={editOrder} onClose={() => setEditOrder(null)} onSaved={handleSaved} canViewStats={canViewStats} />
      )}

      {/* Provider Selection Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-black mb-4">اختر شركة التوصيل</h3>
            <div className="space-y-3 mb-6">
              {deliveryProviders.map(p => (
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
            <h3 className="text-xl font-black mb-4">تحويل الطلبيات إلى:</h3>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto p-1">
              <button onClick={() => handleBulkAssign("UNASSIGNED")}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl hover:border-red-500 hover:bg-red-50 font-bold transition-all text-gray-800">
                إلغاء التعيين (مفتوحة للجميع)
              </button>
              {agents.map((a: any) => (
                <button key={a.id} onClick={() => handleBulkAssign(a.id)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl hover:border-primary hover:bg-orange-50 font-bold transition-all text-gray-800 flex flex-col items-center">
                  <span>{a.name || "بدون اسم"}</span>
                  <span className="text-xs text-gray-400 font-normal">{a.username}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowAgentModal(false)} className="text-gray-500 font-bold">إلغاء</button>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selected.size > 0 && canManageDelivery && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-4 flex items-center justify-between sticky top-4 z-10 backdrop-blur-md">
          <span className="font-bold text-primary">تم تحديد {selected.size} طلب</span>
          <div className="flex gap-2">
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
          { label: "إجمالي الطلبات", val: total, color: "text-gray-800", bg: "bg-white" },
          { label: "قيد المعالجة", val: pending, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "غير مكتملة", val: drafts, color: "text-orange-700", bg: "bg-orange-50" },
          { label: "مؤكدة", val: confirmed, color: "text-green-700", bg: "bg-green-50" },
          { label: "ملغاة", val: cancelled, color: "text-red-700", bg: "bg-red-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl border border-gray-100 p-4 shadow-sm text-center`}>
            <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو الولاية..."
            className="w-full border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[180px]">
          <option value="">كل الحالات</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {products.length > 0 && (
          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[150px]">
            <option value="">كل المنتجات</option>
            {products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
          <Download size={16} /> تصدير Excel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <input type="checkbox" className="w-4 h-4 accent-primary rounded" 
                    checked={selected.size === filtered.length && filtered.length > 0} 
                    onChange={toggleAll} />
                </th>
                <th className="px-4 py-3">الزبون</th>
                <th className="px-4 py-3">الهاتف</th>
                <th className="px-4 py-3">الولاية</th>
                <th className="px-4 py-3">المنتج / العرض</th>
                <th className="px-4 py-3 text-center">التوصيل</th>
                {canViewStats && <th className="px-4 py-3 text-center">الإجمالي</th>}
                <th className="px-4 py-3 text-center">الحالة</th>
                <th className="px-4 py-3 text-center">التاريخ</th>
                <th className="px-4 py-3 text-center">تعديل</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="py-16 text-center text-gray-400">لا توجد طلبات مطابقة</td></tr>
              ) : (
                filtered.map(order => (
                  <tr key={order.id} className={`border-b border-gray-100 transition-colors group ${getRowBg(order.status)}`}>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" className="w-4 h-4 accent-primary rounded"
                        checked={selected.has(order.id)}
                        onChange={() => toggleOne(order.id)} />
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{order.fullName}</div>
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
                    {/* Delivery Status */}
                    <td className="px-4 py-3 text-center">
                      {order.trackingId ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
                            {order.deliveryProvider || "مُرسل"}
                          </span>
                          {order.bordereauUrl && (
                            <a href={order.bordereauUrl} target="_blank" className="text-blue-600 hover:underline text-xs flex items-center gap-1 font-mono">
                              🖨️ طباعة
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    {/* Total */}
                    {canViewStats && (
                      <td className="px-4 py-3 text-center">
                        {order.totalPrice > 0 ? (
                          <div>
                            <div className="font-black text-gray-800">{order.totalPrice.toLocaleString()} دج</div>
                            {order.deliveryPrice > 0 && (
                              <div className="text-xs text-gray-400 flex items-center justify-center gap-0.5">
                                <Truck size={10} /> {order.deliveryPrice} دج توصيل
                              </div>
                            )}
                          </div>
                        ) : <span className="text-gray-300">—</span>}
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
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-left">
            عرض {filtered.length} من {total} طلب
          </div>
        )}
      </div>
    </>
  );
}
