"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const defaultFaqs = [
  {
    q: "متى تبدأ نشوف النتائج؟",
    a: "الأغلبية يحسوا بفرق في الشهية والطاقة من الأسبوع الأول. أما زيادة الوزن الملحوظة فتبدأ عادة في الأسبوع الثاني مع الالتزام بملعقتين يومياً.",
  },
  {
    q: "هل فيه أعراض جانبية؟",
    a: "لا إطلاقاً. المنتج مصنوع من مكونات طبيعية 100%. آمن تماماً ولا يحتوي على أي مواد كيميائية.",
  },
  {
    q: "واش يصلح للأطفال؟",
    a: "نعم، آمن للأطفال لفتح الشهية ومساعدتهم على النمو الصحي. ويُفضّل استشارة الطبيب لتحديد الكمية المناسبة.",
  },
  {
    q: "كيفاش نستعملوه؟",
    a: "ملعقة واحدة مع كأس حليب أو ياغورت، مرتين في اليوم. صباحاً ومساءً للحصول على أفضل النتائج. يمكن إضافة ملعقة عسل لتحسين الطعم.",
  },
  {
    q: "هل التوصيل متوفر لجميع الولايات؟",
    a: "نعم! التوصيل متوفر وسريع لجميع الـ 69 ولاية جزائرية. والدفع يكون عند الاستلام — أي أنك تدفع فقط عند استلام المنتج.",
  },
  {
    q: "كيفاش نطلب؟",
    a: "سهلة! اختار عرضك من الصفحة، دخل اسمك ورقم هاتفك وعنوانك، واضغط 'تأكيد الطلب'. فريقنا يتصل بيك خلال 24 ساعة لتأكيد الطلبية.",
  },
];

export default function FAQ({ page }: { page?: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  let faqList = defaultFaqs;
  if (page?.faqJson) {
    try {
      const parsed = JSON.parse(page.faqJson);
      if (Array.isArray(parsed) && parsed.length > 0) faqList = parsed;
    } catch {}
  }

  if (faqList.length === 0) return null;

  const pColor = page?.primaryColor || "#f97316";

  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full mb-3"
            style={{ backgroundColor: pColor + "15", color: pColor }}>
            ❓ كل أسئلتك هنا
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight">
            الأسئلة <span style={{ color: pColor }}>الشائعة</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            كل ما تحتاج تعرفه قبل الطلب — بدون غموض
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqList.map((faq: any, index: number) => (
            <div
              key={index}
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                openIndex === index ? "shadow-md" : "border-gray-200"
              }`}
              style={{ borderColor: openIndex === index ? pColor : undefined }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-right"
              >
                <h3 className={`font-bold text-sm sm:text-base leading-snug ${openIndex === index ? "" : "text-gray-800"}`}
                  style={{ color: openIndex === index ? pColor : undefined }}>
                  <span className="ml-2 text-xl">💡</span>
                  {faq.q}
                </h3>
                <div className={`shrink-0 mr-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  openIndex === index ? "text-white" : "bg-gray-100 text-gray-400"
                }`} style={{ backgroundColor: openIndex === index ? pColor : undefined }}>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
              }`}>
                <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
