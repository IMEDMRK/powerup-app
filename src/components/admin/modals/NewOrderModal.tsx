"use client";

import React, { useState, useEffect } from "react";
import { X, Save, User, Package } from "lucide-react";

export default function NewOrderModal({ onClose, onCreated, offers, wilayas, products = [] }: { onClose: () => void; onCreated: (order: any) => void; offers: any[], wilayas: any[], products: any[] }) {
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
