import React from "react";

const defaultBenefits = [
  {
    emoji: "⚖️",
    title: "زيادة الوزن بسرعة",
    description: "سعرات عالية وبروتين طبيعي لبناء كتلة عضلية وجسم ممتلئ في وقت قياسي.",
  },
  {
    emoji: "🍽️",
    title: "فتح الشهية فوراً",
    description: "مكونات طبيعية مجربة تحفز الجوع وتعيد شهيتك للأكل من الأسبوع الأول.",
  },
  {
    emoji: "⚡",
    title: "طاقة لا تنضب",
    description: "فيتامينات ومعادن طبيعية تمنحك نشاطاً وحيوية طوال اليوم بدون كفتيرة.",
  },
  {
    emoji: "🌿",
    title: "طبيعي 100% آمن",
    description: "بدون مواد كيميائية أو هرمونات — فقط مكونات طبيعية معتمدة وآمنة للجميع.",
  },
  {
    emoji: "🛡️",
    title: "نتائج مضمونة",
    description: "أكثر من 1200 زبون جزائري شهدوا نتائج ملموسة خلال أسبوعين فقط.",
  },
  {
    emoji: "🥄",
    title: "سهل الاستعمال",
    description: "ملعقة واحدة مع الحليب أو الياغورت — لا تعقيد ولا وصفات — أي وقت أي مكان.",
  },
];

export default function Benefits({ page }: { page?: any }) {
  let benefitsList = defaultBenefits;
  if (page?.benefitsJson) {
    try {
      const parsed = JSON.parse(page.benefitsJson);
      if (Array.isArray(parsed) && parsed.length > 0) benefitsList = parsed;
    } catch {}
  }

  if (benefitsList.length === 0) return null;

  const pColor = page?.primaryColor || "#f97316";

  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block py-1.5 px-4 rounded-full font-bold text-xs sm:text-sm mb-3 border bg-white shadow-sm"
            style={{ color: pColor, borderColor: pColor }}>
            لماذا تختار {page?.productName || "هذا المنتج"}؟ 🤔
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 leading-tight text-gray-900">
            فوائد <span style={{ color: pColor }}>مذهلة</span> في وقت قياسي
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            استمتع بنتائج سريعة وآمنة بفضل المكونات الطبيعية والمدروسة.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {benefitsList.map((benefit: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Decorative background shape */}
              <div 
                className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"
                style={{ background: pColor }}
              />

              {/* Icon / Emoji */}
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 mb-5 sm:mb-6 rounded-2xl flex justify-center items-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 text-3xl sm:text-4xl"
                style={{ background: pColor + "20", color: pColor }}
              >
                {benefit.emoji}
              </div>

              {/* Text */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base relative z-10">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10 sm:mt-14">
          <a
            href="#order"
            className="inline-block text-white font-black py-3.5 px-8 rounded-2xl text-sm sm:text-base transition-all transform hover:scale-105"
            style={{ background: pColor, boxShadow: `0 8px 20px ${pColor}55` }}
          >
            🛒 اطلب {page?.productName || "المنتج"} الآن
          </a>
          <p className="mt-3 text-xs text-gray-400">الدفع عند الاستلام · توصيل لجميع الولايات</p>
        </div>
      </div>
    </section>
  );
}
