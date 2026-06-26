"use client";

import React, { useState, useEffect } from "react";
import { Clock, Flame, ShieldCheck } from "lucide-react";

type ScarcityProps = {
  timerActive: boolean;
  timerMinutes: number;
  timerColor?: string;
  scarcityActive: boolean;
  scarcityText: string;
  scarcityColor?: string;
  socialProofActive: boolean;
  socialProofMessages: string;
  socialProofColor?: string;
};

export default function ScarcityWidgets({
  timerActive,
  timerMinutes,
  timerColor = "#fef08a",
  scarcityActive,
  scarcityText,
  scarcityColor = "#fee2e2",
  socialProofActive,
  socialProofMessages,
  socialProofColor = "#e0e7ff",
}: ScarcityProps) {
  const [timeLeft, setTimeLeft] = useState<number>(timerMinutes * 60);
  const [currentProof, setCurrentProof] = useState<string | null>(null);
  const [showProof, setShowProof] = useState(false);

  // 1. Countdown Timer Logic
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 2. Social Proof Logic
  useEffect(() => {
    if (!socialProofActive || !socialProofMessages) return;
    const messages = socialProofMessages.split(",").map(m => m.trim()).filter(Boolean);
    if (messages.length === 0) return;

    // Show a popup every 15-25 seconds randomly
    const cycleProof = () => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setCurrentProof(randomMsg);
      setShowProof(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setShowProof(false);
      }, 5000);

      // Schedule next popup
      const nextDelay = Math.floor(Math.random() * 10000) + 15000; // 15s to 25s
      setTimeout(cycleProof, nextDelay);
    };

    // Start first popup after 5 seconds
    const initialTimeout = setTimeout(cycleProof, 5000);
    return () => clearTimeout(initialTimeout);
  }, [socialProofActive, socialProofMessages]);

  return (
    <>
      {/* ── COUNTDOWN TIMER ── */}
      {timerActive && timeLeft > 0 && (
        <div className="py-2 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md" dir="rtl" style={{ background: timerColor }}>
          <Clock size={18} className="animate-pulse" style={{ color: "#1a1208" }} />
          <span className="font-bold text-sm" style={{ color: "#1a1208" }}>ينتهي هذا العرض الحصري بعد:</span>
          <span className="font-black text-lg px-2 py-0.5 rounded-md tracking-wider text-white" style={{ background: "rgba(0,0,0,0.8)" }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {/* ── STOCK ALERT ── */}
      {scarcityActive && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-sm pointer-events-none">
          <div className="border-2 rounded-full shadow-2xl py-2 px-4 flex items-center justify-center gap-2 animate-bounce" style={{ background: scarcityColor, borderColor: "rgba(0,0,0,0.1)" }}>
            <Flame size={20} className="text-red-600" />
            <span className="font-black text-red-700 text-sm">{scarcityText}</span>
          </div>
        </div>
      )}

      {/* ── SOCIAL PROOF TOAST ── */}
      {socialProofActive && (
        <div className={`fixed bottom-20 left-4 z-50 transition-all duration-500 transform ${showProof ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}`}>
          <div className="rounded-xl shadow-2xl border border-gray-100 p-3 flex items-center gap-3 w-72" dir="rtl" style={{ background: socialProofColor }}>
            <div className="bg-white p-2 rounded-full shrink-0 shadow-sm">
              <ShieldCheck size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{currentProof}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(0,0,0,0.6)" }}>اشترى هذا المنتج للتو ✓</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
