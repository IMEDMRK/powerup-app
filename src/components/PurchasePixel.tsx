"use client";
import { useEffect } from "react";

export default function PurchasePixel() {
  useEffect(() => {
    // Fire Meta Pixel Purchase event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase');
    }
    // Fire TikTok Pixel CompletePayment event
    if (typeof window !== "undefined" && (window as any).ttq) {
      (window as any).ttq.track('CompletePayment');
    }
  }, []);

  return null;
}
