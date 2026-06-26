import React from "react";
import OrderForm from "./OrderForm";
import { CheckCircle2, Package, Truck } from "lucide-react";

export default function OrderSection() {
  return (
    <section id="order" className="py-12 sm:py-20 bg-orange-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/20 text-primary font-bold text-sm mb-3">
            خطوة واحدة فقط!
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary leading-tight">
            اطلب <span className="text-primary">POWER UP</span> الآن
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-md mx-auto">
            أدخل معلوماتك وسنتصل بك لتأكيد طلبك وتوصيله إلى باب منزلك
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">

          {/* Left: Info + Guarantees */}
          <div className="lg:flex-1">
            {/* Price Box */}
            <div className="bg-white rounded-2xl border border-orange-200 shadow-md p-5 mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">السعر الخاص:</div>
                <div className="text-3xl sm:text-4xl font-black text-secondary">
                  2900 <span className="text-lg font-bold">دج</span>
                </div>
                <div className="text-sm text-red-500 line-through">بدلاً من 4500 دج</div>
              </div>
              <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                خصم 35%
              </div>
            </div>

            {/* Guarantees */}
            <div className="space-y-3 mb-5">
              {[
                { icon: CheckCircle2, text: "الدفع عند الاستلام (خلص كي تلحقك السلعة)" },
                { icon: Truck, text: "توصيل سريع 24-48 ساعة لجميع الولايات" },
                { icon: Package, text: "ضمان الجودة أو استرداد كامل" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                  <Icon className="text-primary shrink-0" size={20} />
                  <span className="text-sm sm:text-base text-secondary font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* Product mini image */}
            <div className="hidden lg:block rounded-2xl overflow-hidden shadow-lg border border-orange-100 max-h-64">
              <img
                src="https://i.ibb.co/DP0FrY8x/1753504381054.png"
                alt="POWER UP"
                className="w-full h-64 object-cover object-top"
              />
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:flex-1 w-full">
            <OrderForm />
          </div>

        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/15 blur-[100px] rounded-full z-0 pointer-events-none" />
    </section>
  );
}
