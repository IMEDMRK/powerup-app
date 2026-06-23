import React from "react";

export default function Hero() {
  return (
    <section className="relative text-white overflow-hidden bg-secondary" style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%)" }}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 sm:w-96 sm:h-96 bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 sm:w-96 sm:h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-[100px] opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 py-8 lg:py-24">

          {/* === Product Image with Premium Frame === */}
          <div className="w-full flex justify-center lg:order-2 lg:flex-1 relative mt-4 lg:mt-0 px-2 sm:px-0">
            {/* Glowing background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] bg-primary/40 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Glassmorphism frame */}
            <div className="relative w-full max-w-sm lg:max-w-md bg-white/10 backdrop-blur-xl border border-white/30 p-8 sm:p-12 lg:p-14 rounded-[3rem] shadow-2xl shadow-black/50 group flex justify-center items-center">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-full group-hover:translate-x-full skew-x-12 pointer-events-none" />
              
              <img
                src="/product.png"
                alt="POWER UP - مكمل غذائي طبيعي لزيادة الوزن"
                className="w-full h-auto object-contain relative z-10 drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* === Text Content === */}
          <div className="flex-1 text-center lg:text-right lg:order-1 z-10">
            {/* Badge */}
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary/20 text-primary font-bold text-xs sm:text-sm mb-4 border border-primary/30">
              🇩🇿 الأكثر مبيعاً في الجزائر
            </span>

            {/* Headline */}
            <h1 className="text-[1.75rem] sm:text-4xl lg:text-6xl font-black mb-4 leading-[1.2]">
              هل تعاني من{" "}
              <span className="text-primary">النحافة والخمول؟</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-lg lg:text-xl mb-5 text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
              POWER UP هو المكمل الغذائي الطبيعي 100% الذي يفتح شهيتك، يزيد وزنك بشكل صحي، ويمنحك طاقة تدوم طوال اليوم — <strong className="text-white">نتائج من الأسبوع الأول</strong>.
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-5">
              <div className="flex -space-x-1 rtl:space-x-reverse">
                {["ع","م","خ","ب","س"].map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-orange-400 border-2 border-secondary flex items-center justify-center text-white text-xs font-bold">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-gray-300 text-xs sm:text-sm">
                <strong className="text-white">+1200</strong> زبون جزائري راضي
              </p>
            </div>

            {/* Benefits pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
              {["✅ زيادة الوزن", "✅ فتح الشهية", "✅ طاقة وحيوية", "✅ طبيعي 100%"].map((b) => (
                <span key={b} className="bg-white/10 text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full border border-white/20">
                  {b}
                </span>
              ))}
            </div>

            {/* CTA */}
            <a
              href="#order"
              className="inline-block w-full sm:w-auto bg-primary hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/40 text-center"
            >
              🛒 اطلب الآن — الدفع عند الاستلام
            </a>
            <p className="mt-3 text-xs sm:text-sm text-gray-400">
              🚚 توصيل لجميع الولايات الـ 69 &nbsp;·&nbsp; 🔒 الدفع عند الاستلام
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
