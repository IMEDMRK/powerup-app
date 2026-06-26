"use client";
import React, { useState, useEffect } from "react";

interface DailyRecord {
  id?: string;
  monthYear: string;
  day: number;
  adSpend: number;
  leads: number;
  confirmed: number;
  delivered: number;
}

export default function PerformanceCalculatorPage() {
  const [currentMonthYear, setCurrentMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [data, setData] = useState<Record<number, DailyRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  // Exchange rate configuration
  const [usdRate, setUsdRate] = useState(250);

  useEffect(() => {
    fetchData(currentMonthYear);
  }, [currentMonthYear]);

  const fetchData = async (monthYear: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/performance?monthYear=${monthYear}`);
      const json = await res.json();
      if (json.success) {
        const map: Record<number, DailyRecord> = {};
        json.data.forEach((r: DailyRecord) => {
          map[r.day] = r;
        });
        setData(map);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (monthYear: string) => {
    const [y, m] = monthYear.split("-");
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };

  const numDays = daysInMonth(currentMonthYear);
  const rows = Array.from({ length: numDays }, (_, i) => i + 1);

  const handleInputChange = (day: number, field: keyof DailyRecord, value: string) => {
    const num = parseFloat(value) || 0;
    setData(prev => {
      const existing = prev[day] || { monthYear: currentMonthYear, day, adSpend: 0, leads: 0, confirmed: 0, delivered: 0 };
      return {
        ...prev,
        [day]: { ...existing, [field]: num }
      };
    });
  };

  const handleBlur = async (day: number) => {
    const record = data[day];
    if (!record) return;

    setSaving(day);
    try {
      await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  };

  // Totals Calculation
  let totalAdSpend = 0;
  let totalLeads = 0;
  let totalConfirmed = 0;
  let totalDelivered = 0;

  rows.forEach(day => {
    const row = data[day];
    if (row) {
      totalAdSpend += row.adSpend;
      totalLeads += row.leads;
      totalConfirmed += row.confirmed;
      totalDelivered += row.delivered;
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📊 حاسبة الأداء اليومي</h1>
          <p className="text-gray-500 text-sm mt-1">تتبع تكلفة الإعلانات وحساب الأرباح بدقة</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <span className="text-sm font-bold text-gray-600">سعر الصرف ($):</span>
            <input 
              type="number" 
              value={usdRate}
              onChange={(e) => setUsdRate(Number(e.target.value) || 0)}
              className="w-20 bg-white border border-gray-300 rounded text-center font-bold outline-none focus:border-orange-500"
            />
          </div>
          
          <input
            type="month"
            value={currentMonthYear}
            onChange={(e) => setCurrentMonthYear(e.target.value)}
            className="p-3 border-2 border-orange-200 rounded-xl font-bold text-gray-800 outline-none focus:border-orange-500 transition-all bg-orange-50"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-500 font-bold animate-pulse">جاري تحميل البيانات...</div>
        ) : (
          <div className="overflow-x-auto" dir="rtl">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200 text-orange-900">
                  <th className="p-4 font-black whitespace-nowrap">اليوم</th>
                  <th className="p-4 font-black whitespace-nowrap bg-red-50 text-red-700">💰 صرف الإعلانات ($)</th>
                  <th className="p-4 font-black whitespace-nowrap">📥 Leads</th>
                  <th className="p-4 font-black whitespace-nowrap">✅ طلبيات مأكدة</th>
                  <th className="p-4 font-black whitespace-nowrap">📦 طلبيات مستلمة</th>
                  <th className="p-4 font-black whitespace-nowrap bg-blue-50 text-blue-700">CPL ($)</th>
                  <th className="p-4 font-black whitespace-nowrap bg-blue-50 text-blue-700">CPO ($)</th>
                  <th className="p-4 font-black whitespace-nowrap bg-green-50 text-green-700">الكوست النهائي CPA ($)</th>
                  <th className="p-4 font-black whitespace-nowrap bg-green-100 text-green-800">الكوست بالدينار (DZD)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(day => {
                  const row = data[day];
                  const adSpend = row?.adSpend || 0;
                  const leads = row?.leads || 0;
                  const confirmed = row?.confirmed || 0;
                  const delivered = row?.delivered || 0;

                  const cpl = leads > 0 ? (adSpend / leads) : 0;
                  const cpo = confirmed > 0 ? (adSpend / confirmed) : 0;
                  const cpa = delivered > 0 ? (adSpend / delivered) : 0;
                  const cpaDzd = cpa * usdRate;

                  return (
                    <tr key={day} className="border-b border-gray-100 hover:bg-orange-50/50 transition-colors">
                      <td className="p-4 font-black text-gray-700">
                        {day} {saving === day && <span className="text-xs text-orange-500 animate-pulse">...</span>}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row?.adSpend || ""}
                          onChange={(e) => handleInputChange(day, "adSpend", e.target.value)}
                          onBlur={() => handleBlur(day)}
                          className="w-24 p-2 border border-red-200 bg-red-50/50 rounded-lg text-center font-bold outline-none focus:border-red-500 focus:bg-white transition-all"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row?.leads || ""}
                          onChange={(e) => handleInputChange(day, "leads", e.target.value)}
                          onBlur={() => handleBlur(day)}
                          className="w-24 p-2 border border-gray-200 rounded-lg text-center font-bold outline-none focus:border-orange-500 focus:bg-white transition-all"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row?.confirmed || ""}
                          onChange={(e) => handleInputChange(day, "confirmed", e.target.value)}
                          onBlur={() => handleBlur(day)}
                          className="w-24 p-2 border border-gray-200 rounded-lg text-center font-bold outline-none focus:border-orange-500 focus:bg-white transition-all"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={row?.delivered || ""}
                          onChange={(e) => handleInputChange(day, "delivered", e.target.value)}
                          onBlur={() => handleBlur(day)}
                          className="w-24 p-2 border border-gray-200 rounded-lg text-center font-bold outline-none focus:border-orange-500 focus:bg-white transition-all"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-4 font-bold text-blue-600 bg-blue-50/30">${cpl.toFixed(2)}</td>
                      <td className="p-4 font-bold text-blue-600 bg-blue-50/30">${cpo.toFixed(2)}</td>
                      <td className="p-4 font-black text-green-600 bg-green-50/50">${cpa.toFixed(2)}</td>
                      <td className="p-4 font-black text-green-700 bg-green-100/50">{cpaDzd.toFixed(0)} دج</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-900 text-white">
                <tr>
                  <td className="p-4 font-black">المجموع</td>
                  <td className="p-4 font-black text-red-300">${totalAdSpend.toFixed(2)}</td>
                  <td className="p-4 font-black">{totalLeads}</td>
                  <td className="p-4 font-black">{totalConfirmed}</td>
                  <td className="p-4 font-black">{totalDelivered}</td>
                  <td className="p-4 font-black text-blue-300">
                    ${(totalLeads > 0 ? totalAdSpend / totalLeads : 0).toFixed(2)}
                  </td>
                  <td className="p-4 font-black text-blue-300">
                    ${(totalConfirmed > 0 ? totalAdSpend / totalConfirmed : 0).toFixed(2)}
                  </td>
                  <td className="p-4 font-black text-green-300">
                    ${(totalDelivered > 0 ? totalAdSpend / totalDelivered : 0).toFixed(2)}
                  </td>
                  <td className="p-4 font-black text-green-300 bg-black/20">
                    {((totalDelivered > 0 ? totalAdSpend / totalDelivered : 0) * usdRate).toFixed(0)} دج
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
