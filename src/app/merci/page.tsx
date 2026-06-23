import Link from "next/link";
import { CheckCircle, Phone, Clock, ArrowRight } from "lucide-react";
import PurchasePixel from "@/components/PurchasePixel";

export default function MerciPage() {
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-secondary via-secondary to-slate-800 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      dir="rtl"
    >
      <PurchasePixel />
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary/40 animate-pulse">
            <CheckCircle className="text-primary" size={52} strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
          شكراً لك! 🎉
        </h1>
        <p className="text-primary font-bold text-xl mb-6">
          تم استلام طلبك بنجاح
        </p>

        {/* Message Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 mb-8 text-right">
          <p className="text-gray-200 text-lg leading-loose mb-4">
            مرحباً بك في عائلة{" "}
            <span className="text-primary font-bold">POWER UP</span>!
          </p>
          <p className="text-gray-300 leading-loose">
            لقد استلمنا طلبك وسيتواصل معك أحد فريقنا{" "}
            <span className="text-white font-semibold">في أقرب وقت ممكن</span>{" "}
            لتأكيد الطلب والإجابة على جميع استفساراتك.
          </p>
        </div>

        {/* Info Steps */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-right">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
              <Phone className="text-primary" size={22} />
            </div>
            <div>
              <p className="text-white font-bold">اتصال هاتفي قريباً</p>
              <p className="text-gray-400 text-sm">سنتصل بك لتأكيد الطلب وتحديد موعد التوصيل</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-right">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
              <Clock className="text-primary" size={22} />
            </div>
            <div>
              <p className="text-white font-bold">توصيل خلال 24-48 ساعة</p>
              <p className="text-gray-400 text-sm">نوصل لجميع ولايات الجزائر</p>
            </div>
          </div>
        </div>

        {/* CTA Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/30"
        >
          <ArrowRight size={20} />
          العودة للصفحة الرئيسية
        </Link>

        <p className="text-gray-500 text-sm mt-6">
          📞 في حال لم نتصل بك خلال 24 ساعة، لا تتردد في التواصل معنا
        </p>
      </div>
    </main>
  );
}
