"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <a
        href="#order"
        className="flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-2xl shadow-2xl shadow-primary/40 text-base sm:text-lg w-full sm:w-auto transition-all active:scale-95"
      >
        <ShoppingCart size={22} />
        اطلب الآن — الدفع عند الاستلام 🚀
      </a>
    </div>
  );
}
