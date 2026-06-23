"use client";

import React, { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";

const defaultReviews = [
  {
    name: "أمين خ.",
    wilaya: "الجزائر العاصمة",
    rating: 5,
    days: "15 يوم",
    kg: "+4 كلغ",
    text: "والله كنت نقول على روحي راه ما راني نزيدش، جربت منتجات كثيرة بدون فايدة. غير بدأت زدت 4 كيلو في 15 يوم بالزبط والشهية تفتحت بزاف. شكراً لكم من القلب!",
  },
  {
    name: "سارة م.",
    wilaya: "وهران",
    rating: 5,
    days: "3 أسابيع",
    kg: "+3.5 كلغ",
    text: "الذوق تاعو روعة مع الحليب وما شكلتش عليه بصح. وليت نحس بطاقة كبيرة في النهار وقدرت نركز أكثر. كل بنت نعرفها دلّيتها عليه!",
  },
  {
    name: "كريم ب.",
    wilaya: "سطيف",
    rating: 5,
    days: "أسبوعين",
    kg: "+2.8 كلغ",
    text: "التوصيل كان سريع والنتيجة بانت من السمانة الثانية. اللي عجبني أكثر أنه طبيعي 100% ومفيهش حاجة كيميائية. أنصح به بشدة!",
  },
];

export default function Testimonials({ page }: { page?: any }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  let reviewsList = defaultReviews;
  if (page?.testimonialsJson) {
    try {
      const parsed = JSON.parse(page.testimonialsJson);
      if (Array.isArray(parsed) && parsed.length > 0) reviewsList = parsed;
    } catch {}
  }

  if (reviewsList.length === 0) return null;

  const pColor = page?.primaryColor || "#f97316";

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block bg-yellow-50 text-yellow-600 font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full mb-3 border border-yellow-200">
            ⭐⭐⭐⭐⭐ تقييم 5/5
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight">
            ماذا قالوا عن{" "}
            <span style={{ color: pColor }}>{page?.productName || "المنتج"}؟</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            تجارب حقيقية من زبائننا — بدون مبالغة
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {reviewsList.map((review: any, index: number) => {
            const isExpanded = expanded === index;
            const textStr = review.text || "";
            const shortText = textStr.slice(0, 100) + (textStr.length > 100 ? "..." : "");
            return (
              <div key={index} className="p-5 sm:p-6 rounded-3xl border relative mt-6 flex flex-col"
                style={{ backgroundColor: pColor + "0A", borderColor: pColor + "20" }}>
                {/* Quote icon */}
                <div className="absolute -top-5 right-5 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-xl">
                  💬
                </div>

                {/* Stars */}
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                {/* Result badges (optional) */}
                {(review.kg || review.days) && (
                  <div className="flex gap-2 mb-3">
                    {review.kg && (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {review.kg}
                      </span>
                    )}
                    {review.days && (
                      <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">
                        في {review.days}
                      </span>
                    )}
                  </div>
                )}

                {/* Review text */}
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3 flex-1">
                  "{isExpanded ? textStr : shortText}"
                </p>
                {textStr.length > 100 && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : index)}
                    className="text-xs font-bold flex items-center gap-1 mb-3"
                    style={{ color: pColor }}
                  >
                    {isExpanded ? <><ChevronUp size={14} /> أقل</> : <><ChevronDown size={14} /> اقرأ أكثر</>}
                  </button>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: pColor + "15" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ background: `linear-gradient(to top right, ${pColor}, ${pColor}80)` }}>
                    {review.name?.charAt(0) || "ز"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{review.name}</h4>
                    {review.wilaya && <p className="text-xs text-gray-500">{review.wilaya}</p>}
                  </div>
                  <div className="mr-auto">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded text-green-600 bg-green-50 border border-green-100">
                      ✅ مشترٍ مؤكد
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
