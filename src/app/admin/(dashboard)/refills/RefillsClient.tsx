"use client";

import React, { useState } from "react";
import { Phone, Repeat, X, Clock, Package } from "lucide-react";
import { useDashboard } from "@/components/admin/DashboardProvider";

export default function RefillsClient({ initialCandidates }: { initialCandidates: any[] }) {
  const [candidates, setCandidates] = useState<any[]>(initialCandidates);
  const [loading, setLoading] = useState<string | null>(null);
  const { isDark } = useDashboard();

  const handleAction = async (orderId: string, action: string) => {
    setLoading(orderId);
    try {
      const res = await fetch("/api/admin/refills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      if (res.ok) {
        // Remove from list if successful
        setCandidates(prev => prev.filter(o => o.id !== orderId));
        if (action === "REORDERED") {
          alert("تم إنشاء طلبية التجديد بنجاح! يمكنك رؤيتها في قسم الطلبيات.");
        }
      } else {
        alert("حدث خطأ أثناء تحديث الحالة.");
      }
    } catch (error) {
      alert("حدث خطأ في الاتصال.");
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
          <Repeat size={24} className="text-primary" />
          إعادة الطلب (Refills)
        </h2>
      </div>

      <div className={`p-4 rounded-xl border ${isDark ? "bg-gray-900 border-gray-800 text-gray-300" : "bg-blue-50 border-blue-100 text-blue-800"}`}>
        <p className="font-bold flex items-center gap-2">
          💡 الزبائن في هذه القائمة استلموا منتجاتهم منذ 25 يوماً أو أكثر.
        </p>
        <p className="text-sm mt-1">اتصل بهم واعرض عليهم تجديد الكورس أو إرسال علبة أخرى، فقد يكونون على وشك الانتهاء من العلبة القديمة.</p>
      </div>

      <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className={`border-b text-xs font-bold uppercase tracking-wide ${isDark ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-100 text-gray-500"}`}>
              <tr>
                <th className="px-4 py-3">الزبون</th>
                <th className="px-4 py-3">الهاتف</th>
                <th className="px-4 py-3">تاريخ الاستلام</th>
                <th className="px-4 py-3">المنتج السابق</th>
                <th className="px-4 py-3 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 font-medium">
                    🎉 لا يوجد زبائن حالياً في قائمة الانتظار لإعادة الطلب!
                  </td>
                </tr>
              ) : (
                candidates.map(order => (
                  <tr key={order.id} className={`border-b transition-colors group ${isDark ? "border-gray-800 hover:bg-gray-800/50 text-gray-200" : "border-gray-100 hover:bg-gray-50 text-gray-800"}`}>
                    <td className="px-4 py-3 font-bold">{order.fullName}</td>
                    <td className="px-4 py-3">
                      <a href={`tel:${order.phone}`} className="text-blue-500 hover:underline font-bold flex items-center gap-1 w-max" dir="ltr">
                        <Phone size={14} /> {order.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(order.updatedAt).toLocaleDateString("ar-DZ")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Package size={14} className="text-primary" />
                        <span className="font-bold">{order.pageSlug}</span>
                        {order.offerLabel && <span className="text-xs text-gray-500 ml-2">({order.offerLabel})</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={loading === order.id}
                          onClick={() => handleAction(order.id, "REORDERED")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Repeat size={12} /> أعاد الطلب
                        </button>
                        <button
                          disabled={loading === order.id}
                          onClick={() => handleAction(order.id, "CALL_LATER")}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 disabled:opacity-50 ${isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                        >
                          <Clock size={12} /> لاحقاً
                        </button>
                        <button
                          disabled={loading === order.id}
                          onClick={() => handleAction(order.id, "NOT_INTERESTED")}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <X size={12} /> غير مهتم
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
