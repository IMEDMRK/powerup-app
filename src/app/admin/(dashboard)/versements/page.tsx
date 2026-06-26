"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Truck, Banknote, History } from "lucide-react";

type Versement = {
  id: string;
  date: string;
  deliveryCompany: string;
  totalReceived: number;
  deliveryFees: number;
  returnFees: number;
  notes: string | null;
};

export default function VersementsPage() {
  const [versements, setVersements] = useState<Versement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliveryCompany, setDeliveryCompany] = useState("Yalidine");
  const [totalReceived, setTotalReceived] = useState("");
  const [deliveryFees, setDeliveryFees] = useState("");
  const [returnFees, setReturnFees] = useState("");
  const [notes, setNotes] = useState("");
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const fetchVersements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/versements?month=${filterMonth}`);
      const data = await res.json();
      setVersements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersements();
  }, [filterMonth]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalReceived || !date) return alert("الرجاء إدخال المبلغ الصافي والتاريخ على الأقل");

    try {
      const res = await fetch("/api/admin/versements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date, 
          deliveryCompany, 
          totalReceived: Number(totalReceived), 
          deliveryFees: Number(deliveryFees || 0), 
          returnFees: Number(returnFees || 0), 
          notes 
        })
      });
      if (res.ok) {
        setTotalReceived("");
        setDeliveryFees("");
        setReturnFees("");
        setNotes("");
        fetchVersements();
      } else {
        const err = await res.json();
        alert("خطأ: " + err.error);
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الإضافة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدفعة؟")) return;
    try {
      await fetch(`/api/admin/versements?id=${id}`, { method: "DELETE" });
      fetchVersements();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // Aggregations
  const sumReceived = versements.reduce((sum, v) => sum + v.totalReceived, 0);
  const sumDeliveryFees = versements.reduce((sum, v) => sum + v.deliveryFees, 0);
  const sumReturnFees = versements.reduce((sum, v) => sum + v.returnFees, 0);
  const totalFees = sumDeliveryFees + sumReturnFees;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-primary" /> أرشيف مدفوعات التوصيل (Versements)
          </h2>
          <p className="text-gray-500 text-sm mt-1">سجل الدفعات التي استلمتها من شركات التوصيل لتتبع أموالك بدقة.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-600">الشهر:</span>
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="text-sm font-bold text-gray-800 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Add Form & Summaries */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-green-500" /> إضافة دفعة جديدة
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-1">التاريخ*</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-1">الشركة*</label>
                  <input 
                    type="text" 
                    value={deliveryCompany}
                    onChange={(e) => setDeliveryCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="مثال: Yalidine"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-green-700 font-bold mb-1">الصافي المستلم (د.ج)*</label>
                <input 
                  type="number" 
                  value={totalReceived}
                  onChange={(e) => setTotalReceived(e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 bg-green-50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-bold"
                  placeholder="المبلغ الذي دخل حسابك"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-orange-600 font-medium mb-1">حقوق التوصيل (مقتطعة)</label>
                  <input 
                    type="number" 
                    value={deliveryFees}
                    onChange={(e) => setDeliveryFees(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-red-600 font-medium mb-1">حقوق الروتور (مقتطعة)</label>
                  <input 
                    type="number" 
                    value={returnFees}
                    onChange={(e) => setReturnFees(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1">ملاحظة (اختياري)</label>
                <input 
                  type="text" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="مثال: دفعة الأسبوع الأول"
                />
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Banknote size={18} /> حفظ الدفعة
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl text-white shadow-sm">
            <h3 className="font-medium text-white/90 text-sm mb-1">إجمالي الصافي المستلم هذا الشهر</h3>
            <div className="text-3xl font-black">{sumReceived.toLocaleString()} د.ج</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-5 rounded-2xl text-white shadow-sm">
            <h3 className="font-medium text-white/90 text-sm mb-1">إجمالي الاقتطاعات (توصيل + روتور)</h3>
            <div className="text-2xl font-bold">{totalFees.toLocaleString()} د.ج</div>
          </div>
        </div>

        {/* Right Col: Table & Categories */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <History size={18} className="text-gray-500" /> 
              <h3 className="font-bold text-gray-800">سجل المدفوعات</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
            ) : versements.length === 0 ? (
              <div className="p-8 text-center text-gray-400">لا توجد دفعات مسجلة في هذا الشهر.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-white border-b border-gray-100 text-gray-500 font-medium">
                    <tr>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">الشركة</th>
                      <th className="p-3">الصافي المستلم</th>
                      <th className="p-3">حقوق (توصيل + روتور)</th>
                      <th className="p-3">الإجمالي الأصلي</th>
                      <th className="p-3">ملاحظات</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {versements.map((v) => {
                      const totalTaken = v.deliveryFees + v.returnFees;
                      const originalTotal = v.totalReceived + totalTaken;
                      
                      return (
                        <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-gray-600">
                            {new Date(v.date).toISOString().split("T")[0]}
                          </td>
                          <td className="p-3">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                              {v.deliveryCompany}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-green-600">+{v.totalReceived.toLocaleString()} د.ج</td>
                          <td className="p-3 text-orange-500 font-medium">
                            {totalTaken > 0 ? `-${totalTaken.toLocaleString()} د.ج` : "-"}
                          </td>
                          <td className="p-3 text-gray-500 font-medium">
                            {originalTotal.toLocaleString()} د.ج
                          </td>
                          <td className="p-3 text-gray-400 text-xs max-w-[120px] truncate" title={v.notes || ""}>
                            {v.notes || "-"}
                          </td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={() => handleDelete(v.id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
