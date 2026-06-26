"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, MapPin, Map } from "lucide-react";

export default function OrderForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [communes, setCommunes] = useState<any[]>([]);
  const [wilayasList, setWilayasList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/geo/wilayas")
      .then((res) => res.json())
      .then(setWilayasList)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedWilaya) {
      try {
        const wilayaCode = parseInt(selectedWilaya);
        fetch(`/api/geo/communes?wilaya=${wilayaCode}`)
          .then((res) => res.json())
          .then((data) => setCommunes(data || []))
          .catch(() => setCommunes([]));
      } catch (err) {
        setCommunes([]);
      }
    } else {
      setCommunes([]);
    }
  }, [selectedWilaya]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      wilaya: formData.get("wilaya"),
      baladiya: formData.get("baladiya"),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/merci");
      } else {
        alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إرسال الطلب.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-base bg-gray-50 focus:bg-white";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 sm:p-8 rounded-3xl shadow-xl border border-gray-100"
    >
      <h3 className="text-xl sm:text-2xl font-black text-secondary mb-1 text-center">
        أدخل معلوماتك
      </h3>
      <p className="text-center text-gray-500 text-sm mb-6">
        وسنتصل بك فوراً لتأكيد الطلب
      </p>

      <div className="space-y-4">

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 mb-1.5">
            الاسم الكامل
          </label>
          <div className="relative">
            <User size={18} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              name="fullName"
              id="fullName"
              required
              placeholder="الاسم واللقب"
              className={inputClass + " pr-10"}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1.5">
            رقم الهاتف
          </label>
          <div className="relative">
            <Phone size={18} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              placeholder="05XX XX XX XX"
              dir="ltr"
              className={inputClass + " pr-10 text-right"}
            />
          </div>
        </div>

        {/* Wilaya */}
        <div>
          <label htmlFor="wilaya" className="block text-sm font-bold text-gray-700 mb-1.5">
            الولاية
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
            <select
              name="wilaya"
              id="wilaya"
              required
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className={inputClass + " pr-10 appearance-none"}
            >
              <option value="" disabled>اختر الولاية</option>
              {wilayasList.map((w: any) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.name_ar}
                </option>
              ))}
            </select>
            <div className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
          </div>
        </div>

        {/* Baladiya */}
        <div>
          <label htmlFor="baladiya" className="block text-sm font-bold text-gray-700 mb-1.5">
            البلدية
          </label>
          <div className="relative">
            <Map size={18} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
            <select
              name="baladiya"
              id="baladiya"
              required
              disabled={!selectedWilaya || communes.length === 0}
              className={inputClass + " pr-10 appearance-none disabled:opacity-60 disabled:cursor-not-allowed"}
            >
              <option value="" disabled selected>
                {selectedWilaya && communes.length === 0 ? "جاري التحميل..." : "اختر البلدية"}
              </option>
              {communes.map((c: any) => (
                <option key={c.code ?? c.name_ar} value={c.name_ar}>
                  {c.name_ar}
                </option>
              ))}
            </select>
            <div className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark active:scale-95 text-white font-black py-4 px-8 rounded-2xl text-lg transition-all shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري الإرسال...
              </>
            ) : (
              "✅ تأكيد الطلب الآن"
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          🛡️ معلوماتك محمية ولن تُشارك مع أي طرف ثالث
        </p>
      </div>
    </form>
  );
}
