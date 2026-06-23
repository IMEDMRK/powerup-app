"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Offer {
  id: string;
  label: string;
  quantity: number;
  originalPrice: number;
  salePrice: number;
  badge?: string | null;
  isDefault: boolean;
  freeShipping: boolean;
}

interface Props {
  page: {
    id: string;
    slug: string;
    productName: string;
    offers: Offer[];
    primaryColor?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
  };
}

export default function DynamicOrderForm({ page }: Props) {
  const router = useRouter();
  let pColor = page.primaryColor || '#f97316';
  // Prevent white background for the header so the white text remains visible
  if (pColor.toLowerCase() === '#ffffff' || pColor.toLowerCase() === '#fff' || pColor.toLowerCase() === 'white') {
    pColor = '#f97316';
  }
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wilayasLoading, setWilayasLoading] = useState(true);
  const [communesLoading, setCommunesLoading] = useState(false);

  // Offer
  const defaultOffer = page.offers.find(o => o.isDefault) || page.offers[0] || null;
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(defaultOffer);

  // Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayasList, setWilayasList] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [baladiya, setBaladiya] = useState("");
  const [delivery, setDelivery] = useState<{ deliveryPrice: number; estimatedDays: string; isEnabled: boolean } | null>(null);
  const [draftOrderId, setDraftOrderId] = useState<string | null>(null);

  useEffect(() => {
    setWilayasLoading(true);
    fetch("/api/geo/wilayas").then(r => r.json()).then(data => {
      setWilayasList(data);
      setWilayasLoading(false);
    }).catch(() => setWilayasLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedWilaya) { setCommunes([]); setDelivery(null); setBaladiya(""); return; }
    setCommunesLoading(true);
    const code = parseInt(selectedWilaya);
    fetch(`/api/geo/communes?wilaya=${code}`)
      .then(r => r.json())
      .then(d => { setCommunes(d || []); setCommunesLoading(false); })
      .catch(() => { setCommunes([]); setCommunesLoading(false); });
    fetch(`/api/delivery/${code}`).then(r => r.json()).then(setDelivery).catch(() => setDelivery(null));
  }, [selectedWilaya]);

  const unitPrice = selectedOffer?.salePrice || 0;
  const isFreeShipping = selectedOffer?.freeShipping ?? false;
  const totalDelivery = isFreeShipping ? 0 : (delivery?.deliveryPrice || 0);
  const grandTotal = unitPrice + totalDelivery;

  // Save Draft Order silently
  const saveDraftOrder = async () => {
    if (!phone || phone.replace(/\s/g, "").length < 10) return;
    try {
      const res = await fetch("/api/orders/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.replace(/\s/g, ""), pageSlug: page.slug, draftOrderId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orderId) setDraftOrderId(data.orderId);
      }
    } catch (e) { /* silent fail for draft */ }
  };

  // Validation step 1
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) e.fullName = "أدخل اسمك الكامل";
    if (!/^0[567]\d{8}$/.test(phone.replace(/\s/g, ""))) e.phone = "رقم غير صحيح (مثال: 0555123456)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goStep2 = () => {
    if (validateStep1()) {
      setStep(2);
      saveDraftOrder();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedWilaya || !baladiya) {
      setErrors(prev => ({ ...prev, wilaya: !selectedWilaya ? "اختر الولاية" : "", baladiya: !baladiya ? "اختر البلدية" : "" }));
      return;
    }
    setLoading(true);
    const data = {
      fullName: fullName.trim(),
      phone: phone.replace(/\s/g, ""),
      wilaya: wilayasList.find(w => String(w.code) === selectedWilaya)?.name_ar || selectedWilaya,
      baladiya,
      offerId: selectedOffer?.id || null,
      offerLabel: selectedOffer?.label || null,
      quantity: selectedOffer?.quantity || 1,
      unitPrice,
      deliveryPrice: totalDelivery,
      totalPrice: grandTotal,
      pageSlug: page.slug,
      draftOrderId, // pass draftOrderId to convert it to a full order
    };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) router.push("/thankyou");
      else alert("حدث خطأ، يرجى المحاولة مرة أخرى.");
    } catch { alert("حدث خطأ."); }
    finally { setLoading(false); }
  };

  const inputBase = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "16px",         // prevents iOS zoom on focus
    borderRadius: "14px",
    border: "2px solid #e5e7eb",
    outline: "none",
    background: "#f9fafb",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  } as React.CSSProperties;

  const inputError = { ...inputBase, borderColor: "#ef4444", background: "#fff5f5" };
  const inputFocusStyle = "focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white";

  return (
    <div
      className="rounded-3xl overflow-hidden shadow-2xl"
      style={{ border: "2px solid #fed7aa", background: "#fff" }}
    >
      {/* ── Header ── */}
      <div
        className="px-5 py-4 text-center"
        style={{ background: pColor }}
      >
        <p className="text-white font-black text-lg sm:text-xl">🛒 اطلب الآن — الدفع عند الاستلام</p>
        <p className="text-orange-100 text-xs mt-0.5">توصيل لجميع الولايات الـ 69</p>
      </div>

      {/* ── Step Indicator ── */}
      <div className="flex border-b" style={{ borderColor: "#fed7aa" }}>
        {[
          { n: 1, label: "معلوماتك" },
          { n: 2, label: "العنوان" },
        ].map(s => (
          <button
            key={s.n}
            type="button"
            onClick={() => s.n === 1 ? setStep(1) : validateStep1() && setStep(2)}
            className="flex-1 py-3 text-sm font-black transition-colors flex items-center justify-center gap-2"
            style={{
              background: step === s.n ? "#fff7ed" : "#fafafa",
              color: step === s.n ? pColor : "#9ca3af",
              borderBottom: step === s.n ? `3px solid ${pColor}` : "3px solid transparent",
            }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: step === s.n ? pColor : "#e5e7eb",
                color: step === s.n ? "white" : "#6b7280",
              }}
            >
              {s.n}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">

        {/* ══ STEP 1 ══ */}
        {step === 1 && (
          <>
            {/* Offers */}
            {page.offers.length > 0 && (
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">اختر عرضك</p>
                <div className="space-y-2">
                  {page.offers.map(offer => {
                    const isSelected = selectedOffer?.id === offer.id;
                    const discount = offer.originalPrice > offer.salePrice
                      ? Math.round((1 - offer.salePrice / offer.originalPrice) * 100)
                      : 0;
                    return (
                      <label
                        key={offer.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-2xl cursor-pointer transition-all"
                        style={{
                          border: isSelected ? `2px solid ${pColor}` : "2px solid #e5e7eb",
                          background: isSelected ? "#fff7ed" : "#fff",
                          boxShadow: isSelected ? `0 2px 12px ${pColor}22` : "none",
                        }}
                      >
                        {/* Radio + Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                            style={{
                              borderColor: isSelected ? pColor : "#d1d5db",
                              background: isSelected ? pColor : "white",
                            }}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <input type="radio" name="offer" value={offer.id}
                            checked={isSelected} onChange={() => setSelectedOffer(offer)}
                            className="sr-only" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-black text-secondary text-sm">{offer.label}</span>
                              {offer.badge && (
                                <span className="text-xs font-black px-2 py-0.5 rounded-full text-white"
                                  style={{ background: pColor }}>
                                  {offer.badge}
                                </span>
                              )}
                              {discount > 0 && (
                                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                                  style={{ background: "#fee2e2", color: "#dc2626" }}>
                                  -{discount}%
                                </span>
                              )}
                            </div>
                            {offer.freeShipping && (
                              <p className="text-xs font-bold mt-0.5" style={{ color: "#16a34a" }}>
                                🚚 توصيل مجاني
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p className="font-black text-lg leading-tight" style={{ color: isSelected ? pColor : "#1a1208" }}>
                            {offer.salePrice.toLocaleString()}
                            <span className="text-xs font-bold"> دج</span>
                          </p>
                          {offer.originalPrice > 0 && offer.originalPrice !== offer.salePrice && (
                            <p className="text-xs text-gray-400 line-through text-right">
                              {offer.originalPrice.toLocaleString()} دج
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-black mb-1.5" style={{ color: "#374151" }}>
                الاسم الكامل <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={fullName}
                onChange={e => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: "" })); }}
                placeholder="مثال: أحمد بن علي"
                autoComplete="name"
                className={inputFocusStyle}
                style={errors.fullName ? inputError : inputBase}
              />
              {errors.fullName && (
                <p className="text-xs mt-1 font-bold" style={{ color: "#ef4444" }}>⚠️ {errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-black mb-1.5" style={{ color: "#374151" }}>
                رقم الهاتف <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: "" })); }}
                onBlur={saveDraftOrder}
                placeholder="0555 12 34 56"
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                className={inputFocusStyle}
                style={errors.phone ? { ...inputError, textAlign: "right" } : { ...inputBase, textAlign: "right" }}
              />
              {errors.phone && (
                <p className="text-xs mt-1 font-bold" style={{ color: "#ef4444" }}>⚠️ {errors.phone}</p>
              )}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={goStep2}
              className="w-full text-white font-black py-4 rounded-2xl text-base transition-all active:scale-95"
              style={{ background: pColor, boxShadow: "0 6px 20px rgba(249,115,22,0.35)" }}
            >
              التالي: اختر عنوانك ←
            </button>
          </>
        )}

        {/* ══ STEP 2 ══ */}
        {step === 2 && (
          <>
            {/* Wilaya */}
            <div>
              <label className="block text-sm font-black mb-1.5" style={{ color: "#374151" }}>
                الولاية <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <select
                  name="wilaya"
                  required
                  value={selectedWilaya}
                  onChange={e => { setSelectedWilaya(e.target.value); setErrors(prev => ({ ...prev, wilaya: "" })); }}
                  className={`${inputFocusStyle} appearance-none pr-4`}
                  style={{ ...inputBase, paddingLeft: "32px" }}
                  disabled={wilayasLoading}
                >
                  <option value="" disabled>
                    {wilayasLoading ? "⏳ جاري تحميل الولايات..." : "📍 اختر الولاية"}
                  </option>
                  {wilayasList.map((w: any) => (
                    <option key={w.code} value={String(w.code)}>{w.code} - {w.name_ar}</option>
                  ))}
                </select>
                <span className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</span>
              </div>
              {errors.wilaya && (
                <p className="text-xs mt-1 font-bold" style={{ color: "#ef4444" }}>⚠️ {errors.wilaya}</p>
              )}
              {/* Delivery info */}
              {delivery && selectedWilaya && (
                <div className="mt-2 flex items-center gap-2 text-xs font-bold rounded-xl px-3 py-2"
                  style={{ background: isFreeShipping ? "#f0fdf4" : "#fff7ed", color: isFreeShipping ? "#16a34a" : "#ea580c" }}>
                  {isFreeShipping
                    ? "🚚 التوصيل مجاني لهذا العرض"
                    : `🚚 تكلفة التوصيل: ${delivery.deliveryPrice.toLocaleString()} دج ${delivery.estimatedDays ? `(${delivery.estimatedDays})` : ""}`
                  }
                </div>
              )}
            </div>

            {/* Baladiya */}
            <div>
              <label className="block text-sm font-black mb-1.5" style={{ color: "#374151" }}>
                البلدية <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <select
                  name="baladiya"
                  required
                  value={baladiya}
                  onChange={e => { setBaladiya(e.target.value); setErrors(prev => ({ ...prev, baladiya: "" })); }}
                  disabled={!selectedWilaya || communesLoading}
                  className={`${inputFocusStyle} appearance-none`}
                  style={{ ...inputBase, paddingLeft: "32px", opacity: (!selectedWilaya || communesLoading) ? 0.5 : 1 }}
                >
                  <option value="" disabled>
                    {!selectedWilaya ? "اختر الولاية أولاً" : communesLoading ? "⏳ جاري التحميل..." : "🏘️ اختر البلدية"}
                  </option>
                  {communes.map((c: any) => (
                    <option key={c.code ?? c.name_ar} value={c.name_ar}>{c.name_ar}</option>
                  ))}
                </select>
                <span className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</span>
              </div>
              {errors.baladiya && (
                <p className="text-xs mt-1 font-bold" style={{ color: "#ef4444" }}>⚠️ {errors.baladiya}</p>
              )}
            </div>

            {/* Price Summary */}
            {selectedOffer && (
              <div className="rounded-2xl p-4 space-y-2.5"
                style={{ background: "#fff7ed", border: "2px solid #fed7aa" }}>
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider">ملخص الطلب</p>
                <div className="flex justify-between text-sm" style={{ color: "#374151" }}>
                  <span className="font-medium">{selectedOffer.label}</span>
                  <span className="font-bold">{unitPrice.toLocaleString()} دج</span>
                </div>
                {(delivery !== null || isFreeShipping) && (
                  <div className="flex justify-between text-sm" style={{ color: "#374151" }}>
                    <span className="font-medium">التوصيل {delivery?.estimatedDays ? `(${delivery.estimatedDays})` : ""}</span>
                    {isFreeShipping ? (
                      <span className="font-black" style={{ color: "#16a34a" }}>🚚 مجاني!</span>
                    ) : (
                      <span className="font-bold">{totalDelivery.toLocaleString()} دج</span>
                    )}
                  </div>
                )}
                <div className="border-t pt-2.5 flex justify-between items-center" style={{ borderColor: "#fed7aa" }}>
                  <span className="font-black text-base" style={{ color: "#1a1208" }}>💰 الإجمالي</span>
                  <span className="font-black text-xl" style={{ color: pColor }}>{grandTotal.toLocaleString()} دج</span>
                </div>
              </div>
            )}

            {/* Back + Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-4 rounded-2xl font-bold text-sm transition-all"
                style={{ background: "#f3f4f6", color: "#374151", minWidth: "80px" }}
              >
                ← رجوع
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-white font-black py-4 rounded-2xl text-base transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background: pColor,
                  boxShadow: "0 6px 20px rgba(249,115,22,0.4)",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري الإرسال...
                  </>
                ) : "✅ تأكيد الطلب الآن"}
              </button>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {["🛡️ بياناتك آمنة", "💳 دفع عند الاستلام", "↩️ ضمان الاسترجاع"].map((t, i) => (
                <span key={i} className="text-xs font-medium" style={{ color: "#9ca3af" }}>{t}</span>
              ))}
            </div>
          </>
        )}

      </form>
    </div>
  );
}
