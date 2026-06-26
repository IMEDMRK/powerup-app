import { CheckCircle, Phone, Clock } from "lucide-react";
import PurchasePixel from "@/components/PurchasePixel";
import PagePixels from "@/components/PagePixels";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ slug?: string }>;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const { slug } = await searchParams;
  let page = null;
  if (slug) {
    page = await prisma.landingPage.findFirst({ where: { slug } });
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      dir="rtl"
      style={{ background: "linear-gradient(135deg, #1a1208 0%, #2d1a0a 60%, #1a1208 100%)" }}
    >
      <PurchasePixel />
      {page && <PagePixels page={page} />}
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(249,115,22,0.15)", filter: "blur(120px)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(249,115,22,0.08)", filter: "blur(120px)" }} />

      <div className="relative z-10 w-full max-w-lg text-center">

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center animate-bounce"
            style={{ background: "rgba(249,115,22,0.2)", border: "4px solid rgba(249,115,22,0.5)" }}
          >
            <CheckCircle size={56} strokeWidth={1.5} style={{ color: "#f97316" }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight">
          شكراً لك! 🎉
        </h1>
        <p className="font-black text-xl mb-8" style={{ color: "#f97316" }}>
          تم استلام طلبك بنجاح ✅
        </p>

        {/* Message Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 mb-6 text-right"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
        >
          <p className="text-gray-200 text-lg leading-loose mb-3">
            مرحباً بك في عائلة{" "}
            <span className="font-black" style={{ color: "#f97316" }}>POWER UP</span>!
          </p>
          <p className="text-gray-300 leading-loose text-sm sm:text-base">
            لقد استلمنا طلبك وسيتواصل معك أحد فريقنا{" "}
            <span className="text-white font-semibold">في أقرب وقت ممكن</span>{" "}
            لتأكيد الطلب والإجابة على جميع استفساراتك.
          </p>
        </div>

        {/* Info Steps */}
        <div className="grid grid-cols-1 gap-3 mb-2">
          {[
            {
              icon: Phone,
              title: "اتصال هاتفي قريباً",
              desc: "سنتصل بك لتأكيد الطلب وتحديد موعد التوصيل",
            },
            {
              icon: Clock,
              title: "توصيل خلال 24-48 ساعة",
              desc: "نوصل لجميع ولايات الجزائر الـ 69",
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl p-4 text-right"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(249,115,22,0.2)" }}
              >
                <Icon size={22} style={{ color: "#f97316" }} />
              </div>
              <div>
                <p className="text-white font-black text-sm">{title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-xs mt-6">
          📞 في حال لم نتصل بك خلال 24 ساعة، لا تتردد في التواصل معنا
        </p>
      </div>
    </main>
  );
}
