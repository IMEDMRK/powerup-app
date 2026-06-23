import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import Ingredients from "@/components/landing/Ingredients";
import Usage from "@/components/landing/Usage";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import OrderSection from "@/components/landing/OrderSection";
import StickyCTA from "@/components/landing/StickyCTA";

export default function Home() {
  return (
    <main className="relative flex flex-col min-h-screen">
      <Hero />
      <Benefits />
      <Ingredients />
      <Usage />
      <Testimonials />
      <FAQ />
      <OrderSection />
      <StickyCTA />
    </main>
  );
}
