"use client";

import React, { useState, useEffect } from "react";
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

// ── Edit Modal ─────────────────────────────────────────────
function EditModal({ order, onClose, onSaved, canViewStats, offers, wilayas }: { order: any; onClose: () => void; onSaved: (updated: any) => void; canViewStats: boolean, offers: any[], wilayas: any[] }) {
  const [form, setForm] = useState({ ...order });
  const [saving, setSaving] = useState(false);

  const [localBaladiyas, setLocalBaladiyas] = useState<string[]>([]);
  useEffect(() => {
    if (form.wilaya) {
      fetch(`/api/geo/communes?wilaya=${encodeURIComponent(form.wilaya)}`)
        .then(res => res.json())
        .then(data => setLocalBaladiyas(data))
        .catch(() => setLocalBaladiyas([]));
    }
  }, [form.wilaya]);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  // auto-compute total
  useEffect(() => {
    const total = (Number(form.unitPrice) || 0) + (Number(form.deliveryPrice) || 0) - (Number(form.discount) || 0);
    setForm((p: any) => ({ ...p, totalPrice: total }));
  }, [form.unitPrice, form.deliveryPrice, form.discount]);

  const handleQuantityChange = (newQ: number) => {
    let updates: any = { quantity: newQ };

    // Try to find matching offer
    if (form.pageSlug && offers && offers.length > 0) {
      // Find offer matching the pageSlug and the exact quantity
      const matchingOffer = offers.find(o => 
        (o.page?.slug === form.pageSlug || o.pageId === form.pageSlug) && o.quantity === newQ
      );
      
      // If we couldn't match by page object, we can just try to match by quantity if there's only one page
      // But usually offers have `page` object populated
      
      const offer = matchingOffer || offers.find(o => o.quantity === newQ);

      if (offer) {
        updates.unitPrice = offer.salePrice;
        updates.offerId = offer.id;
        updates.offerLabel = offer.label;

        if (offer.freeShipping) {
          updates.deliveryPrice = 0;
        } else {
          // Restore normal wilaya price if not free shipping
          const wMatch = wilayas?.find((w: any) => w.wilayaName === form.wilaya);
          if (wMatch) {
            updates.deliveryPrice = wMatch.deliveryPrice;
          }
        }
      }
    }
    setForm((p: any) => ({ ...p, ...updates }));
  };

  const save = async () => {
    if (form.status === "ملغاة" && !form.cancelReason) {
      alert("الرجاء اختيار سبب الإلغاء");
      return;
    }
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
            {form.status === "ملغاة" && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                <label className="block text-xs font-black text-red-800 mb-1">سبب الإلغاء (إجباري)</label>
                <select 
                  value={form.cancelReason || ""}
                  onChange={e => set("cancelReason", e.target.value)}
                  className={input + " border-red-200 text-red-900"}
                >
                  <option value="" disabled>-- اختر السبب --</option>
                  {[
                    "السعر غالي",
                    "غيّر رأيه",
                    "اشترى من مكان آخر",
                    "رقم خاطئ / لا يعمل",
                    "لا يرد",
                    "مكررة",
                    "غير ذلك"
                  ].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
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
                <select value={form.wilaya || ""} onChange={e => {
                  set("wilaya", e.target.value);
                  set("baladiya", "");
                }} className={input}>
                  <option value="" disabled>-- اختر الولاية --</option>
                  {wilayas.map((w: any) => (
                    <option key={w.wilayaCode} value={w.wilayaName}>{w.wilayaCode} - {w.wilayaName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">البلدية</label>
                {localBaladiyas.length > 0 ? (
                  <select value={form.baladiya || ""} onChange={e => set("baladiya", e.target.value)} className={input}>
                    <option value="" disabled>-- اختر البلدية --</option>
                    {localBaladiyas.map((b: string) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                ) : (
                  <input value={form.baladiya || ""} onChange={e => set("baladiya", e.target.value)} className={input} placeholder="ادخل اسم البلدية" />
                )}
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
                  <button type="button" onClick={() => {
                    const newQ = Math.max(1, (form.quantity || 1) - 1);
                    handleQuantityChange(newQ);
                  }}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-gray-100 shrink-0">−</button>
                  <input type="number" min={1} value={form.quantity || 1} onChange={e => {
                    const newQ = parseInt(e.target.value) || 1;
                    handleQuantityChange(newQ);
                  }}
                    className={input + " text-center font-bold"} />
                  <button type="button" onClick={() => {
                    const newQ = (form.quantity || 1) + 1;
                    handleQuantityChange(newQ);
                  }}
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
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">سعر المنتج (دج)</label>
                  <input type="number" value={form.unitPrice || 0} onChange={e => set("unitPrice", parseInt(e.target.value) || 0)}
                    className={input + " text-center font-bold"} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">تكلفة الشراء (دج)</label>
                  <input type="number" value={form.productCost || 0} onChange={e => set("productCost", parseInt(e.target.value) || 0)}
                    className={input + " text-center font-bold text-red-600 bg-red-50 border-red-200"} title="سعر الشراء الأصلي (لحساب صافي الربح)" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">سعر التوصيل (دج)</label>
                  <input type="number" value={form.deliveryPrice || 0} onChange={e => set("deliveryPrice", parseInt(e.target.value) || 0)}
                    className={input + " text-center font-bold"} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">تخفيض (دج)</label>
                  <input type="number" value={form.discount || 0} onChange={e => set("discount", parseInt(e.target.value) || 0)}
                    className={input + " text-center font-bold text-green-600 border-green-200 focus:ring-green-500"} title="قيمة التخفيض" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الإجمالي (دج)</label>
                  <div className={input + " text-center font-black text-primary bg-orange-50 border-primary/30"}>
                    {((form.unitPrice || 0) + (form.deliveryPrice || 0) - (form.discount || 0)).toLocaleString()}
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

// ── New Order Modal ─────────────────────────────────────────────
function NewOrderModal({ onClose, onCreated, offers, wilayas, products = [] }: { onClose: () => void; onCreated: (order: any) => void; offers: any[], wilayas: any[], products: any[] }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [form, setForm] = useState<any>({
    fullName: "",
    phone: "",
    wilaya: "",
    baladiya: "",
    pageSlug: "",
    offerId: "",
    offerLabel: "",
    quantity: 1,
    unitPrice: 0,
    deliveryPrice: 0,
    discount: 0,
    totalPrice: 0,
    notes: ""
  });
  const [saving, setSaving] = useState(false);
  const [localBaladiyas, setLocalBaladiyas] = useState<string[]>([]);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (form.wilaya) {
      fetch(`/api/geo/communes?wilaya=${encodeURIComponent(form.wilaya)}`)
        .then(res => res.json())
        .then(data => setLocalBaladiyas(data))
        .catch(() => setLocalBaladiyas([]));
    }
  }, [form.wilaya]);

  // auto-compute total
  useEffect(() => {
    const total = (Number(form.unitPrice) || 0) + (Number(form.deliveryPrice) || 0) - (Number(form.discount) || 0);
    setForm((p: any) => ({ ...p, totalPrice: total }));
  }, [form.unitPrice, form.deliveryPrice, form.discount]);

  const handleOfferChange = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    let updates: any = {
      offerId: offer.id,
      offerLabel: offer.label,
      quantity: offer.quantity,
      unitPrice: offer.salePrice,
      pageSlug: offer.page?.slug || offer.pageId
    };

    if (offer.freeShipping) {
      updates.deliveryPrice = 0;
    } else {
      const wMatch = wilayas.find((w: any) => w.wilayaName === form.wilaya);
      if (wMatch) {
        updates.deliveryPrice = wMatch.deliveryPrice;
      }
    }
    setForm((p: any) => ({ ...p, ...updates }));
  };

  const handleWilayaChange = (wilayaName: string) => {
    set("wilaya", wilayaName);
    set("baladiya", "");
    // Update delivery price if not free shipping
    const offer = offers.find(o => o.id === form.offerId);
    if (!offer?.freeShipping) {
      const wMatch = wilayas.find((w: any) => w.wilayaName === wilayaName);
      if (wMatch) set("deliveryPrice", wMatch.deliveryPrice);
    }
  };

  const create = async () => {
    if (!form.fullName || !form.phone || !form.wilaya || !form.baladiya) {
      alert("الرجاء إدخال الاسم، الهاتف، الولاية والبلدية");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { 
      const data = await res.json();
      if (data.order) onCreated(data.order);
      onClose(); 
    } else {
      const err = await res.json();
      alert("حدث خطأ: " + (err.error || ""));
    }
    setSaving(false);
  };

  const input = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900">إضافة طلبية يدوية جديدة ✍️</h2>
            <p className="text-xs text-gray-400 mt-0.5">قم بإدخال بيانات الطلبية مباشرة</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer Info */}
          <div>
            <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">
              <User size={13} /> معلومات الزبون
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">الاسم الكامل *</label>
                <input value={form.fullName} onChange={e => set("fullName", e.target.value)} className={input} placeholder="اسم الزبون" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">رقم الهاتف *</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)} dir="ltr" className={input + " text-right"} placeholder="05XX XX XX XX" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">الولاية *</label>
                <select value={form.wilaya} onChange={e => handleWilayaChange(e.target.value)} className={input}>
                  <option value="" disabled>-- اختر الولاية --</option>
                  {wilayas.map((w: any) => (
                    <option key={w.wilayaCode} value={w.wilayaName}>{w.wilayaCode} - {w.wilayaName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">البلدية *</label>
                {localBaladiyas.length > 0 ? (
                  <select value={form.baladiya} onChange={e => set("baladiya", e.target.value)} className={input}>
                    <option value="" disabled>-- اختر البلدية --</option>
                    {localBaladiyas.map((b: string) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                ) : (
                  <input value={form.baladiya} onChange={e => set("baladiya", e.target.value)} className={input} placeholder="ادخل اسم البلدية" />
                )}
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
                <label className="block text-xs text-gray-500 mb-1">اختر المنتج (لربط المخزون)</label>
                <select value={selectedProduct} onChange={e => {
                  setSelectedProduct(e.target.value);
                  set("offerId", "");
                  set("offerLabel", "");
                  set("pageSlug", "");
                  set("unitPrice", 0);
                  set("deliveryPrice", 0);
                }} className={input}>
                  <option value="" disabled>-- اختر المنتج --</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.productName || p.slug} (المخزون المتبقي: {p.stockCount})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">اختر العرض</label>
                  <select value={form.offerId || ""} onChange={e => handleOfferChange(e.target.value)} className={input}>
                    <option value="" disabled>-- اختر العرض المتاح --</option>
                    {offers.filter((o: any) => o.pageId === selectedProduct).map((o: any) => (
                      <option key={o.id} value={o.id}>
                        {o.label} ({o.salePrice} دج)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="col-span-2 mt-2">
                <label className="block text-xs text-gray-500 mb-1">ملاحظات للموظف / التوصيل</label>
                <textarea 
                  value={form.notes} 
                  onChange={e => set("notes", e.target.value)}
                  placeholder="ملاحظات..." 
                  className={input + " min-h-[80px] resize-y"} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
            إلغاء
          </button>
          <button onClick={create} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark disabled:opacity-60 transition-all">
            <Save size={16} />
            {saving ? "جاري الإضافة..." : "حفظ وإنشاء الطلبية"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
export default function OrdersTable({ initialOrders = [], user, agents = [], offers = [], deliveryProviders = [], wilayas = [], products = [] }: any) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const { t } = useDashboard();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [editOrder, setEditOrder] = useState<any | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendingBulk, setSendingBulk] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [assigningBulk, setAssigningBulk] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [cancelingBulk, setCancelingBulk] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ id: string, reason: string } | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
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

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedOrders = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterProduct]);

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
            placeholder={t("searchPlaceholder")}
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl pr-9 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[180px]">
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
        <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
          <Download size={16} /> {t("exportExcel")}
        </button>
        <button onClick={() => setShowNewOrder(true)} className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap">
          ➕ إضافة طلبية
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              عرض {paginatedOrders.length} من {filtered.length} طلب
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 font-bold transition-colors">
                  السابق
                </button>
                <div className="px-2 flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                        currentPage === page 
                          ? "bg-primary text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
