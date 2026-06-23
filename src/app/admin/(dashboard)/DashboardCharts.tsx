"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Package, CheckCircle, Truck, XCircle, DollarSign } from "lucide-react";

const COLORS = ["#f97316", "#22c55e", "#3b82f6", "#ef4444", "#a855f7", "#eab308"];

const STATUS_LABELS: Record<string, string> = {
  "جديد": "جديد",
  "مؤكد": "مؤكد",
  "تم الاتصال للمرة الأولى": "اتصال 1",
  "تم الاتصال للمرة الثانية": "اتصال 2",
  "تم الاتصال للمرة الثالثة": "اتصال 3",
  "تم التسليم": "تم التسليم",
  "ملغاة": "ملغاة",
  "الزبون لا يرد": "لا يرد",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

type AnalyticsData = {
  dailyData: { date: string; label: string; total: number; confirmed: number; delivered: number; cancelled: number; revenue: number }[];
  statusData: { name: string; value: number }[];
  total: number;
  newOrders: number;
  staleOrdersCount: number;
  confirmed: number;
  delivered: number;
  cancelled: number;
  revenue: number;
  totalProductCost: number;
  totalDeliveryCost: number;
  totalExpenses: number;
  netProfit: number;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-1">
          <span className="font-bold">{p.value}</span> {p.name}
        </p>
      ))}
    </div>
  );
};

export default function DashboardCharts() {
  const [mode, setMode] = useState<"day" | "range">("range");
  const [singleDay, setSingleDay] = useState(todayStr());
  const [fromDate, setFromDate] = useState(daysAgoStr(13));
  const [toDate, setToDate] = useState(todayStr());
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const from = mode === "day" ? singleDay : fromDate;
    const to   = mode === "day" ? singleDay : toDate;
    try {
      const res = await fetch(`/api/admin/analytics?from=${from}&to=${to}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [mode, singleDay, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpis = data ? [
    { label: "إجمالي الطلبات",  value: data.total,     icon: Package,      color: "#3b82f6" },
    { label: "طلبات جديدة",    value: data.newOrders, icon: Truck,        color: "#f97316" },
    { label: "طلبات مؤكدة",    value: data.confirmed,  icon: CheckCircle,  color: "#a855f7" },
    { label: "تم التسليم",     value: data.delivered,  icon: CheckCircle,  color: "#22c55e" },
    { label: "رقم الأعمال",    value: data.revenue.toLocaleString() + " دج", icon: DollarSign, color: "#eab308" },
  ] : [];

  const financeKpis = data ? [
    { label: "تكلفة السلع", value: data.totalProductCost.toLocaleString() + " دج", color: "text-red-500", bg: "bg-red-50" },
    { label: "تكلفة التوصيل", value: data.totalDeliveryCost.toLocaleString() + " دج", color: "text-orange-500", bg: "bg-orange-50" },
    { label: "المصاريف الكلية", value: data.totalExpenses.toLocaleString() + " دج", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "صافي الربح", value: data.netProfit.toLocaleString() + " دج", color: data.netProfit >= 0 ? "text-green-600" : "text-red-600", bg: data.netProfit >= 0 ? "bg-green-100" : "bg-red-100", highlight: true },
  ] : [];

  const confirmationRate = data && data.total > 0
    ? Math.round((data.confirmed / data.total) * 100)
    : 0;
  const deliveryRate = data && data.total > 0
    ? Math.round((data.delivered / data.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* ── Stale Orders Alert ── */}
      {data && data.staleOrdersCount > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold">تنبيه هام: يوجد {data.staleOrdersCount} طلبية في حالة "جديد" منذ أكثر من 24 ساعة!</p>
            <p className="text-sm">هذه الطلبيات لم يقم الموظفون بمعالجتها أو تغيير حالتها حتى الآن.</p>
          </div>
        </div>
      )}

      {/* ── Date Filter ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 self-start">
            <button
              onClick={() => setMode("day")}
              className={`px-4 py-2 text-sm font-bold transition-colors ${mode === "day" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              📅 يوم محدد
            </button>
            <button
              onClick={() => setMode("range")}
              className={`px-4 py-2 text-sm font-bold transition-colors ${mode === "range" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              📆 فترة زمنية
            </button>
          </div>

          {mode === "day" ? (
            <input
              type="date"
              value={singleDay}
              onChange={e => setSingleDay(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <span className="text-gray-400 text-sm">→</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          )}

          {/* Quick shortcuts */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "اليوم",    onClick: () => { setMode("day"); setSingleDay(todayStr()); } },
              { label: "7 أيام",  onClick: () => { setMode("range"); setFromDate(daysAgoStr(6)); setToDate(todayStr()); } },
              { label: "30 يوم",  onClick: () => { setMode("range"); setFromDate(daysAgoStr(29)); setToDate(todayStr()); } },
            ].map(s => (
              <button
                key={s.label}
                onClick={s.onClick}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-primary hover:text-white text-gray-600 font-bold transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm">جاري تحميل البيانات...</div>
      )}

      {!loading && data && (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: kpi.color + "20" }}>
                  <kpi.icon size={20} style={{ color: kpi.color }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium leading-tight">{kpi.label}</p>
                  <p className="text-lg font-black text-gray-800">{kpi.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Financial Tracking ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" />
                حساب صافي الربح الحقيقي
              </h3>
              <a href="/admin/expenses" className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                💼 إدارة المصاريف
              </a>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {financeKpis.map((kpi, i) => (
                <div key={i} className={`rounded-xl p-4 border border-gray-100 ${kpi.bg} text-center ${kpi.highlight ? 'ring-2 ring-green-500 scale-105 shadow-md' : ''}`}>
                  <p className="text-xs text-gray-500 font-bold mb-1">{kpi.label}</p>
                  <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Rates ── */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "معدل التأكيد", value: confirmationRate, color: "#a855f7" },
              { label: "معدل التسليم", value: deliveryRate, color: "#22c55e" },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-bold text-gray-700">{r.label}</p>
                  <p className="text-xl font-black" style={{ color: r.color }}>{r.value}%</p>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${r.value}%`, background: r.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Bar Chart + Pie Chart ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                الطلبيات اليومية
              </h3>
              {data.dailyData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات في هذه الفترة</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="total" name="إجمالي" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="confirmed" name="مؤكدة" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="delivered" name="تم التسليم" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package size={18} className="text-primary" />
                توزيع الحالات
              </h3>
              {data.statusData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={data.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {data.statusData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any, name: any) => [v, STATUS_LABELS[name] || name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="space-y-1.5 mt-2">
                    {data.statusData.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-600">{STATUS_LABELS[s.name] || s.name}</span>
                        </div>
                        <span className="font-bold text-gray-700">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
