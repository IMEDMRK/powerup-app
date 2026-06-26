import React from "react";

const defaultIngredients = [
  {
    name: "بودرة حليب كامل الدسم",
    emoji: "🥛",
    benefit: "مصدر غني بالبروتين والكالسيوم لبناء العضلات وتقوية العظام",
    tag: "بروتين",
    tagColor: "#3b82f6",
    bgColor: "#eff6ff",
  },
  {
    name: "السمسم",
    emoji: "🌾",
    benefit: "يحتوي على زيوت طبيعية وأحماض دهنية تساعد على زيادة الوزن الصحي",
    tag: "دهون صحية",
    tagColor: "#f59e0b",
    bgColor: "#fffbeb",
  },
  {
    name: "الفول السوداني",
    emoji: "🥜",
    benefit: "غني بالسعرات الحرارية والبروتين النباتي — الأفضل لزيادة الكتلة العضلية",
    tag: "سعرات عالية",
    tagColor: "#f97316",
    bgColor: "#fff7ed",
  },
  {
    name: "الكاكاو الطبيعي",
    emoji: "🍫",
    benefit: "مضادات أكسدة قوية تعزز الطاقة وتحسّن المزاج والتركيز",
    tag: "طاقة",
    tagColor: "#92400e",
    bgColor: "#fef3c7",
  },
  {
    name: "القرفة",
    emoji: "🌿",
    benefit: "تنظّم مستوى السكر في الدم وتعزز الهضم وتفتح الشهية بشكل طبيعي",
    tag: "شهية",
    tagColor: "#16a34a",
    bgColor: "#f0fdf4",
  },
  {
    name: "الزنجبيل",
    emoji: "🫚",
    benefit: "يحفز الجهاز الهضمي، يقلل الالتهابات، ويعزز امتصاص العناصر الغذائية",
    tag: "هضم",
    tagColor: "#dc2626",
    bgColor: "#fef2f2",
  },
  {
    name: "حب العزيز",
    emoji: "🌰",
    benefit: "يفتح الشهية ويعالج النحافة، غني بالبروتينات والدهون الصحية التي تزيد الوزن",
    tag: "زيادة الوزن",
    tagColor: "#8b5cf6",
    bgColor: "#f5f3ff",
  },
  {
    name: "رشة ملح الهمالايا",
    emoji: "🧂",
    benefit: "غني بـ 84 معدناً أساسياً، يعزز الهضم، يحسن امتصاص العناصر الغذائية، ويوازن الأملاح في الجسم",
    tag: "معادن",
    tagColor: "#ec4899",
    bgColor: "#fdf2f8",
  },
];

export default function Ingredients({ page }: { page?: any }) {
  let ingredientsList = defaultIngredients;
  if (page?.ingredientsJson) {
    try {
      const parsed = JSON.parse(page.ingredientsJson);
      if (Array.isArray(parsed) && parsed.length > 0) ingredientsList = parsed;
    } catch {}
  }

  if (ingredientsList.length === 0) return null;

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block bg-green-50 text-green-700 font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full mb-3 border border-green-200">
            🌿 طبيعي 100% — بدون كيمياء
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary mb-3 leading-tight">
            مكونات{" "}
            <span className="text-primary">المكمل الغذائي</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            8 مكونات طبيعية مختارة بعناية — كل واحد له دور محدد في مساعدتك على زيادة الوزن بصحة
          </p>
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-10 sm:mb-14">
          {ingredientsList.map((ing: any, i: number) => (
            <div
              key={i}
              className="rounded-2xl p-4 sm:p-5 border flex flex-col gap-2 hover:shadow-md transition-shadow duration-300"
              style={{ background: ing.bgColor || "#f9fafb", borderColor: (ing.tagColor || "#d1d5db") + "30" }}
            >
              {/* Emoji */}
              <div className="text-3xl sm:text-4xl mb-1">{ing.emoji}</div>

              {/* Tag */}
              <span
                className="inline-block text-xs font-black px-2.5 py-0.5 rounded-full self-start"
                style={{ background: ing.tagColor + "20", color: ing.tagColor }}
              >
                {ing.tag}
              </span>

              {/* Name */}
              <h3 className="font-black text-secondary text-sm sm:text-base leading-tight">
                {ing.name}
              </h3>

              {/* Benefit */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {ing.benefit}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div
          className="rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-8"
          style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "2px solid #fed7aa" }}
        >
          <div className="text-4xl sm:text-5xl shrink-0">🔬</div>
          <div className="text-center sm:text-right flex-1">
            <h3 className="font-black text-secondary text-base sm:text-xl mb-1.5">
              تركيبة علمية مدروسة
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              تم تصميم POWER UP بنسب دقيقة لضمان أقصى فائدة — كل مكوّن يكمّل الآخر لزيادة الوزن بطريقة صحية وطبيعية، بعيداً عن الهرمونات والمواد الكيميائية الضارة.
            </p>
          </div>
          <a
            href="#order"
            className="shrink-0 bg-primary hover:bg-orange-600 text-white font-black px-6 py-3 rounded-2xl text-sm sm:text-base transition-all hover:scale-105 shadow-md shadow-primary/30 whitespace-nowrap"
          >
            🛒 اطلب الآن
          </a>
        </div>

      </div>
    </section>
  );
}
