"use client";

import React, { useState } from "react";
import { Database, CheckCircle, AlertTriangle } from "lucide-react";

export default function MigrationButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleMigrate = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/migrate-db", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage("تم تحديث قاعدة البيانات بنجاح! يمكنك الآن استخدام الخصائص الجديدة.");
      } else {
        setStatus("error");
        setMessage(data.error || "حدث خطأ أثناء التحديث.");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "فشل الاتصال بالخادم");
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
          <Database size={20} className="text-orange-600" />
          تحديث قاعدة البيانات (خطوة ضرورية)
        </h3>
        <p className="text-sm text-orange-700 mt-1">
          بسبب تحديثات نظام التوصيل، يجب تحديث قاعدة البيانات لتتوافق مع الخصائص الجديدة. اضغط على الزر ليتم التحديث تلقائياً وبأمان.
        </p>
        {status === "success" && (
          <p className="text-sm font-bold text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={14} /> {message}</p>
        )}
        {status === "error" && (
          <p className="text-sm font-bold text-red-600 mt-2 flex items-center gap-1"><AlertTriangle size={14} /> {message}</p>
        )}
      </div>
      <button 
        onClick={handleMigrate}
        disabled={status === "loading" || status === "success"}
        className="shrink-0 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all whitespace-nowrap"
      >
        {status === "loading" ? "جاري التحديث..." : status === "success" ? "تم التحديث ✅" : "🚀 تحديث الآن"}
      </button>
    </div>
  );
}
