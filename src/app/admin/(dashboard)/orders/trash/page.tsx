"use client";

import { useEffect, useState } from "react";
import { Package, RotateCcw, AlertTriangle, Search } from "lucide-react";

export default function TrashPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDeletedOrders();
  }, []);

  const fetchDeletedOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/trash");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      // 
    }
    setLoading(false);
  };

  const handleRestore = async (id: string) => {
    if (!confirm("هل تريد استرجاع هذه الطلبية؟")) return;
    setRestoring(id);
    try {
      const res = await fetch("/api/admin/orders/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id })
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
      } else {
        alert("فشل الاسترجاع");
      }
    } catch {
      alert("خطأ في الاتصال");
    }
    setRestoring(null);
  };

  const filtered = orders.filter(o => 
    o.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    o.phone?.includes(search)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> سلة المهملات
          </h2>
          <p className="text-gray-500 text-sm mt-1">عرض الطلبيات المحذوفة وإمكانية استرجاعها</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="البحث بالاسم أو الهاتف..."
            className="w-full border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center">
            <Package size={40} className="mb-4 opacity-20" />
            <p className="font-bold text-lg">سلة المهملات فارغة</p>
            <p className="text-sm mt-1">لا توجد طلبيات محذوفة حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-red-50 border-b border-red-100 text-red-800 text-xs font-bold uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">الزبون</th>
                  <th className="px-4 py-3">الهاتف</th>
                  <th className="px-4 py-3">المنتج</th>
                  <th className="px-4 py-3">تاريخ الإنشاء</th>
                  <th className="px-4 py-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-800">{order.fullName}</td>
                    <td className="px-4 py-3 text-gray-600" dir="ltr">{order.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{order.pageSlug}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString("ar-DZ")}</td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleRestore(order.id)}
                        disabled={restoring === order.id}
                        className="flex items-center gap-1.5 mx-auto bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                      >
                        <RotateCcw size={14} />
                        {restoring === order.id ? "جاري..." : "استرجاع"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
