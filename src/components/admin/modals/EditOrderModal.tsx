"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Trash2, User, Package, DollarSign } from "lucide-react";

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

export default function EditOrderModal({ order, onClose, onSaved, canViewStats, offers, wilayas }: { order: any; onClose: () => void; onSaved: (updated: any) => void; canViewStats: boolean, offers: any[], wilayas: any[] }) {
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

    if (form.pageSlug && offers && offers.length > 0) {
      const matchingOffer = offers.find(o => 
        (o.page?.slug === form.pageSlug || o.pageId === form.pageSlug) && o.quantity === newQ
      );
      
      const offer = matchingOffer || offers.find(o => o.quantity === newQ);

      if (offer) {
        updates.unitPrice = offer.salePrice;
        updates.offerId = offer.id;
        updates.offerLabel = offer.label;

        if (offer.freeShipping) {
          updates.deliveryPrice = 0;
        } else {
          const wMatch = wilayas?.find((w: any) => w.wilayaName === form.wilaya);
          if (wMatch) {
            updates.deliveryPrice = wMatch.deliveryPrice;
          }
        }
      }
    }
    setForm((p: any) => ({ ...p, ...updates }));
  };

  const handleOfferSelect = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    let updates: any = {
      offerId: offer.id,
      offerLabel: offer.label,
      quantity: offer.quantity,
      unitPrice: offer.salePrice,
    };

    if (offer.freeShipping) {
      updates.deliveryPrice = 0;
    } else {
      const wMatch = wilayas?.find((w: any) => w.wilayaName === form.wilaya);
      if (wMatch) {
        updates.deliveryPrice = wMatch.deliveryPrice;
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

          <div>
            <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">
              <Package size={13} /> تفاصيل الطلبية
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">العرض المختار</label>
                <select 
                  value={form.offerId || ""} 
                  onChange={e => {
                    if (e.target.value === "custom") {
                      set("offerId", "");
                      set("offerLabel", "");
                    } else {
                      handleOfferSelect(e.target.value);
                    }
                  }} 
                  className={input}
                >
                  <option value="" disabled>-- اختر عرضاً --</option>
                  <option value="custom">عرض مخصص (إدخال يدوي)</option>
                  {offers.filter(o => !form.pageSlug || o.page?.slug === form.pageSlug || o.pageId === form.pageSlug).map(o => (
                    <option key={o.id} value={o.id}>
                      {o.label} ({o.quantity} علبة) - {o.salePrice} دج
                    </option>
                  ))}
                </select>
                {!form.offerId && (
                  <input 
                    value={form.offerLabel || ""} 
                    onChange={e => set("offerLabel", e.target.value)}
                    placeholder="اكتب اسم العرض يدوياً" 
                    className={input + " mt-2"} 
                  />
                )}
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
