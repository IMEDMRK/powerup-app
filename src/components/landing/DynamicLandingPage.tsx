"use client";
import React from "react";
import DynamicOrderForm from "./DynamicOrderForm";
import Benefits from "./Benefits";
import Ingredients from "./Ingredients";
import Usage from "./Usage";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import StickyCTA from "./StickyCTA";
import VideoSection from "./VideoSection";
import Comparison from "./Comparison";
import { CheckCircle2, Truck, Package } from "lucide-react";

interface Props {
  page: {
    id: string;
    slug: string;
    productName: string;
    productImage?: string | null;
    headline: string;
    subheadline?: string | null;
    description?: string | null;
    salePrice?: number | null;
    originalPrice?: number | null;
    videoTitle?: string | null;
    videoSubtitle?: string | null;
    primaryColor?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    sectionsOrder: string[];
    offers: any[];
    videos?: any[];
    orderBoxDeliveryText?: string | null;
    orderBoxPaymentText?: string | null;
    orderFeaturesJson?: string | null;
    orderFeaturesTextAlign?: string | null;
    orderFeaturesFontSize?: string | null;
  };
}

const SECTION_COMPONENTS: Record<string, React.FC<any>> = {
  benefits: Benefits,
  ingredients: Ingredients,
  usage: Usage,
  testimonials: Testimonials,
  faq: FAQ,
  comparison: Comparison,
};

function HeroSection({ page }: { page: Props["page"] }) {
  const bgColor = page.backgroundColor || "#FFF8F2";
  const pColor = page.primaryColor || "#f97316";
  const txtColor = page.textColor || "#1a1208";

  // Convert hex to rgb for rgba usage if needed, but for simplicity we'll just use a generic light overlay or the exact color
  // A simple hack to get a lighter version for the blobs is to use the primaryColor with opacity in CSS or just use a fixed light blob if hex parsing is complex.
  // Actually, we can just use the primary color directly for blobs and borders, and set opacity on the element.

  return (
    <section className="relative overflow-hidden" style={{ background: bgColor }}>
      {/* Subtle decor blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none -mt-16 -mr-16 opacity-10"
        style={{ background: pColor, filter: "blur(80px)" }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none -mb-16 -ml-16 opacity-10"
        style={{ background: pColor, filter: "blur(80px)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 py-12 lg:py-24">
          {/* Image */}
          <div className="w-full flex justify-center lg:order-2 lg:flex-1">
            {page.productImage ? (
              <div className="relative p-3 sm:p-5 rounded-3xl border-[6px] bg-white shadow-2xl overflow-hidden group"
                   style={{ borderColor: pColor }}>
                <img
                  src={page.productImage}
                  alt={page.productName}
                  className="w-56 sm:w-80 lg:w-[420px] object-contain animate-float-scale rounded-xl"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            ) : (
              <div className="w-44 h-56 sm:w-64 sm:h-80 rounded-[2rem] flex items-center justify-center"
                style={{ background: pColor }}>
                <span className="text-4xl font-black text-white">{page.productName}</span>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex-1 text-center lg:text-right lg:order-1 z-10">
            <span className="inline-block py-1.5 px-4 rounded-full font-bold text-sm mb-4 border"
              style={{ color: pColor, borderColor: pColor, backgroundColor: `${pColor}1A` }}>
              🇩🇿 الخيار الأول في الجزائر
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-5 leading-tight" style={{ color: txtColor }}>
              {page.headline}
            </h1>
            {page.subheadline && (
              <p className="text-base sm:text-lg lg:text-xl mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed" style={{ color: txtColor, opacity: 0.8 }}>
                {page.subheadline}
              </p>
            )}

            {/* Price Badge */}
            {page.salePrice && (
              <div className="inline-flex items-center gap-3 rounded-2xl px-5 py-3 mb-6 border"
                style={{ background: "#fff", borderColor: pColor, boxShadow: `0 2px 12px ${pColor}33` }}>
                <div className="text-center">
                  {page.originalPrice && page.originalPrice > page.salePrice && (
                    <div className="text-red-400 line-through text-sm font-medium leading-none mb-1">
                      {page.originalPrice.toLocaleString()} دج
                    </div>
                  )}
                  <div className="font-black text-2xl sm:text-3xl leading-none" style={{ color: txtColor }}>
                    {page.salePrice.toLocaleString()} <span className="text-base font-bold">دج</span>
                  </div>
                </div>
                {page.originalPrice && page.originalPrice > page.salePrice && (
                  <div className="bg-red-500 text-white text-xs font-black px-2.5 py-1.5 rounded-xl">
                    خصم {Math.round((1 - page.salePrice / page.originalPrice) * 100)}%
                  </div>
                )}
                <div className="text-xs border-r pr-3" style={{ color: "#6b5344", borderColor: "#fed7aa" }}>
                  <div>💳 الدفع عند</div>
                  <div>الاستلام</div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-white text-xl shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-3 group"
                style={{ backgroundColor: pColor }}
              >
                🛒 اطلب الآن وادفع عند الاستلام
              </button>
            </div>
            
            <p className="mt-4 text-sm font-medium" style={{ color: "#9a7c6e" }}>🚀 التوصيل لجميع الولايات الـ 69</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrderSection({ page }: { page: Props["page"] }) {
  const pColor = page.primaryColor || "#f97316";
  const txtColor = page.textColor || "#1a1208";

  return (
    <section id="order" className="py-12 sm:py-20 bg-orange-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/20 text-primary font-bold text-sm mb-3" style={{ color: pColor }}>خطوة واحدة فقط!</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary" style={{ color: txtColor }}>اطلب <span style={{ color: pColor }}>{page.productName}</span> الآن</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">
          {/* Info */}
          <div className="lg:flex-1 space-y-3">
            <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-orange-100 mb-6">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: pColor }}>التوصيل</span>
                <span className="font-black text-sm" style={{ color: txtColor }}>{page.orderBoxDeliveryText || "حتى باب المنزل 🚚"}</span>
              </div>
              <div className="h-10 w-[2px] opacity-20" style={{ background: pColor }} />
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: pColor }}>الدفع</span>
                <span className="font-black text-sm" style={{ color: txtColor }}>{page.orderBoxPaymentText || "عند الاستلام 💵"}</span>
              </div>
            </div>

            <ul className={`space-y-3 mb-8 w-full text-${page.orderFeaturesTextAlign || "right"}`}>
              {(page.orderFeaturesJson ? JSON.parse(page.orderFeaturesJson) : ["جودة مضمونة 100%", "الدفع عند الاستلام", "توصيل سريع لـ 69 ولاية"]).map((feat: string, i: number) => (
                <li key={i} className={`flex items-center gap-3 font-medium justify-${page.orderFeaturesTextAlign === "center" ? "center" : page.orderFeaturesTextAlign === "left" ? "end" : "start"} text-${page.orderFeaturesFontSize || "lg"}`} style={{ color: txtColor }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: pColor }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
          {/* Form */}
          <div className="lg:flex-1">
            <DynamicOrderForm page={page} />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/15 blur-[100px] rounded-full z-0 pointer-events-none" />
    </section>
  );
}

export default function DynamicLandingPage({ page }: Props) {
  const sections: { key: string; visible: boolean }[] = (page.sectionsOrder || []).map((s: any) =>
    typeof s === "string" ? { key: s, visible: true } : s
  );

  return (
    <main className="relative flex flex-col min-h-screen" dir="rtl">
      {sections.filter(s => s.visible !== false).map((section) => {
        const key = section.key;
        if (key === "hero") return <HeroSection key="hero" page={page} />;
        if (key === "order") return <OrderSection key="order" page={page} />;
        if (key === "videos") return <VideoSection key="videos" videos={page.videos || []} title={page.videoTitle} subtitle={page.videoSubtitle} primaryColor={page.primaryColor} />;
        const Comp = SECTION_COMPONENTS[key];
        return Comp ? <Comp key={key} page={page} /> : null;
      })}
      <StickyCTA />
    </main>
  );
}
