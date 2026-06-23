import React from "react";
import { Plus, Info } from "lucide-react";

const defaultUsage = [
  {
    title: "ملعقة واحدة",
    description: "ملعقة من 10 إلى 15 غرام من بودرة POWER UP مرتين يومياً.",
  },
  {
    title: "حليب أو ياغورت",
    description: "اخلطها مع كأس حليب كامل الدسم أو ياغورت طبيعي.",
  }
];

export default function Usage({ page }: { page?: any }) {
  let usageList = defaultUsage;
  if (page?.usageJson) {
    try {
      const parsed = JSON.parse(page.usageJson);
      if (Array.isArray(parsed) && parsed.length > 0) usageList = parsed;
    } catch {}
  }

  if (usageList.length === 0) return null;

  const pColor = page?.primaryColor || "#f97316";

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: page?.backgroundColor || "#FFF8F2" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
            طريقة الاستخدام للحصول على <span style={{ color: pColor }}>أفضل النتائج</span>
          </h2>
          <p className="text-lg text-gray-600">
            خطوات بسيطة يومياً تفصلك عن الوصول لهدفك.
          </p>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-8 lg:gap-12">
          {usageList.map((u: any, i: number) => (
            <React.Fragment key={i}>
              {/* Step Card */}
              <div className="p-8 rounded-3xl w-full max-w-sm text-center border bg-white"
                style={{ borderColor: pColor + "33", boxShadow: `0 4px 24px ${pColor}15` }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 font-black text-2xl text-white"
                  style={{ background: pColor, boxShadow: `0 10px 30px ${pColor}55` }}>
                  {i + 1}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{u.title}</h3>
                <p className="text-gray-600">
                  {u.description}
                </p>
              </div>

              {/* Plus separator (except for last item) */}
              {i < usageList.length - 1 && (
                <div className="hidden md:block" style={{ color: pColor }}>
                  <Plus size={40} opacity={0.6} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Tip Box */}
        <div className="mt-16 p-6 rounded-2xl max-w-2xl mx-auto flex gap-4 items-start bg-white/50"
          style={{ border: `2px solid ${pColor}55` }}>
          <Info size={24} style={{ color: pColor, flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 className="font-bold text-lg mb-1" style={{ color: pColor }}>نصيحة إضافية!</h4>
            <p className="text-gray-700 font-medium">
              للحصول على أفضل نتيجة المرجو الالتزام بالاستخدام اليومي والمستمر.
            </p>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 blur-[120px] rounded-full z-0 pointer-events-none"
        style={{ background: pColor + "15" }} />
    </section>
  );
}
