import React from "react";
import { Check, X } from "lucide-react";

const features = [
  { label: "مكونات طبيعية 100%",         powerup: true,  others: false },
  { label: "نتائج من الأسبوع الأول",      powerup: true,  others: false },
  { label: "بدون هرمونات أو كيمياء",      powerup: true,  others: false },
  { label: "فتح الشهية بشكل طبيعي",       powerup: true,  others: false },
  { label: "طاقة وحيوية طوال اليوم",       powerup: true,  others: false },
  { label: "آمن للأطفال فوق 12 سنة",      powerup: true,  others: false },
  { label: "طعم لذيذ مع الحليب",          powerup: true,  others: null  },
  { label: "سعر مناسب لكل الجزائريين",    powerup: true,  others: null  },
  { label: "الدفع عند الاستلام",           powerup: true,  others: false },
  { label: "توصيل لجميع الولايات الـ 69", powerup: true,  others: false },
];

export default function Comparison() {
  return (
    <section className="py-12 sm:py-20" style={{ background: "#FFF8F2" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block bg-orange-100 text-orange-600 font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full mb-3">
            🆚 مقارنة صادقة
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 leading-tight" style={{ color: "#1a1208" }}>
            لماذا <span style={{ color: "#f97316" }}>POWER UP</span> وليس غيره؟
          </h2>
          <p className="text-sm sm:text-base" style={{ color: "#6b7280" }}>
            قارن بنفسك — الفرق واضح
          </p>
        </div>

        {/* Table */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-orange-100">
          {/* Header Row */}
          <div className="grid grid-cols-3 text-center">
            <div className="py-4 sm:py-5 px-2 font-bold text-sm sm:text-base" style={{ background: "#f3f4f6", color: "#6b7280" }}>
              الميزة
            </div>
            <div className="py-4 sm:py-5 px-2 font-black text-sm sm:text-base text-white"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">💪</span>
                <span>POWER UP</span>
              </div>
            </div>
            <div className="py-4 sm:py-5 px-2 font-bold text-sm sm:text-base" style={{ background: "#e5e7eb", color: "#9ca3af" }}>
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">😐</span>
                <span>المنتجات الأخرى</span>
              </div>
            </div>
          </div>

          {/* Feature Rows */}
          {features.map((f, i) => (
            <div
              key={i}
              className="grid grid-cols-3 text-center items-center border-t"
              style={{ borderColor: "#fed7aa", background: i % 2 === 0 ? "#ffffff" : "#fffaf7" }}
            >
              {/* Label */}
              <div className="py-3.5 px-3 text-xs sm:text-sm font-medium text-right sm:text-center" style={{ color: "#374151" }}>
                {f.label}
              </div>

              {/* POWER UP */}
              <div className="py-3.5 flex justify-center items-center" style={{ background: i % 2 === 0 ? "rgba(249,115,22,0.04)" : "rgba(249,115,22,0.08)" }}>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                  style={{ background: "#dcfce7" }}>
                  <Check size={16} style={{ color: "#16a34a" }} strokeWidth={3} />
                </div>
              </div>

              {/* Others */}
              <div className="py-3.5 flex justify-center items-center">
                {f.others === false ? (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                    style={{ background: "#fee2e2" }}>
                    <X size={16} style={{ color: "#dc2626" }} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                    style={{ background: "#fef9c3" }}>
                    <span className="text-sm">⚠️</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Footer Row */}
          <div className="grid grid-cols-3 text-center border-t" style={{ borderColor: "#fed7aa" }}>
            <div className="py-4 px-3 font-black text-sm sm:text-base" style={{ background: "#f3f4f6", color: "#374151" }}>
              الحكم النهائي
            </div>
            <div className="py-4 font-black text-sm sm:text-base text-white"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              ✅ الأفضل
            </div>
            <div className="py-4 font-bold text-sm sm:text-base" style={{ background: "#e5e7eb", color: "#9ca3af" }}>
              ❌ لا يُقارن
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-10">
          <a
            href="#order"
            className="inline-block text-white font-black py-4 px-10 rounded-2xl text-base sm:text-lg transition-all transform hover:scale-105"
            style={{ background: "#f97316", boxShadow: "0 8px 24px rgba(249,115,22,0.4)" }}
          >
            🛒 اختر POWER UP الآن
          </a>
          <p className="mt-3 text-xs" style={{ color: "#9ca3af" }}>
            الدفع عند الاستلام — لا مخاطرة
          </p>
        </div>
      </div>
    </section>
  );
}
