"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Receipt, Wallet, TrendingDown } from "lucide-react";

type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
};

const CATEGORIES = [
  "إعلانات",
  "تغليف",
  "مواد أولية",
  "اشتراكات برامج",
  "تنقل ولوجستيك",
  "رواتب ومكافآت",
  "أخرى"
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/expenses?month=${filterMonth}`);
      const data = await res.json();
      setExpenses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filterMonth]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return alert("الرجاء ملء الحقول الأساسية");

    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), category, description, date })
      });
      if (res.ok) {
        setAmount("");
        setDescription("");
        fetchExpenses();
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
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;
    try {
      await fetch(`/api/admin/expenses?id=${id}`, { method: "DELETE" });
      fetchExpenses();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // Aggregations
  const totalThisMonth = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const categoryTotals: Record<string, number> = {};
  CATEGORIES.forEach(c => categoryTotals[c] = 0);
  expenses.forEach(exp => {
    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += exp.amount;
    } else {
      categoryTotals["أخرى"] = (categoryTotals["أخرى"] || 0) + exp.amount;
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-primary" /> تتبع المصاريف (Expense Tracker)
          </h2>
          <p className="text-gray-500 text-sm mt-1">سجل كل مصاريفك لتعرف أرباحك الصافية الحقيقية.</p>
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
              <Plus size={18} className="text-green-500" /> إضافة مصروف جديد
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1">المبلغ (د.ج)*</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="مثال: 5000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1">التصنيف*</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

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
                <label className="block text-sm text-gray-600 font-medium mb-1">وصف (اختياري)</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="مثال: إعلانات منتج الساعة"
                />
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Plus size={18} /> حفظ المصروف
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-sm">
            <h3 className="font-medium text-white/80 text-sm mb-1">إجمالي مصاريف هذا الشهر</h3>
            <div className="text-4xl font-black">{totalThisMonth.toLocaleString()} د.ج</div>
          </div>
        </div>

        {/* Right Col: Table & Categories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown size={18} className="text-gray-500" /> توزيع المصاريف
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {CATEGORIES.map(c => (
                <div key={c} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium mb-1">{c}</div>
                  <div className="font-bold text-gray-800">{categoryTotals[c].toLocaleString()} د.ج</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <Receipt size={18} className="text-gray-500" /> 
              <h3 className="font-bold text-gray-800">سجل المصاريف</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
            ) : expenses.length === 0 ? (
              <div className="p-8 text-center text-gray-400">لا توجد مصاريف مسجلة في هذا الشهر.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-white border-b border-gray-100 text-gray-500 font-medium">
                    <tr>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">التصنيف</th>
                      <th className="p-3">الوصف</th>
                      <th className="p-3">المبلغ</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-600">
                          {new Date(exp.date).toISOString().split("T")[0]}
                        </td>
                        <td className="p-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{exp.description || "-"}</td>
                        <td className="p-3 font-bold text-red-500">-{exp.amount.toLocaleString()} د.ج</td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => handleDelete(exp.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={16} />
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

      </div>
    </div>
  );
}
