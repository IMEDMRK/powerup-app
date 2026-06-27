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
  "جديدة": "جديدة",
  "مؤكدة": "مؤكدة",
  "تم الاتصال للمرة الأولى": "اتصال 1",
  "تم الاتصال للمرة الثانية": "اتصال 2",
  "تم الاتصال للمرة الثالثة": "اتصال 3",
  "مستلمة": "تم التسليم",
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
  dailyData: { date: string; label: string; total: number; confirmed: number; delivered: number; cancelled: number; returned: number; revenue: number }[];
  statusData: { name: string; value: number }[];
  cancelReasonData: { name: string; value: number }[];
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
    { label: "إجمالي الطلبات الوافدة", value: data.total, icon: ShoppingCart, bgClass: "bg-blue-500", shadowClass: "shadow-blue-500/40" },
    { label: "طلبات قيد المعالجة", value: data.newOrders, icon: Clock, bgClass: "bg-orange-500", shadowClass: "shadow-orange-500/40" },
    { label: "تم التأكيد",    value: data.confirmed,  icon: CheckCircle,  bgClass: "bg-purple-500", shadowClass: "shadow-purple-500/40" },
    { label: "تم التسليم",     value: data.delivered,  icon: CheckCircle,  bgClass: "bg-emerald-500", shadowClass: "shadow-emerald-500/40" },
    { label: "رقم الأعمال",    value: data.revenue.toLocaleString() + " دج", icon: DollarSign, bgClass: "bg-yellow-400", shadowClass: "shadow-yellow-400/40" },
  ] : [];

  const financeKpis = data ? [
    { label: "تكلفة السلع", value: data.totalProductCost.toLocaleString() + " دج", icon: Package, bgClass: "bg-red-500", shadowClass: "shadow-red-500/40" },
    { label: "تكلفة التوصيل", value: data.totalDeliveryCost.toLocaleString() + " دج", icon: Truck, bgClass: "bg-orange-500", shadowClass: "shadow-orange-500/40" },
    { label: "المصاريف الكلية", value: data.totalExpenses.toLocaleString() + " دج", icon: DollarSign, bgClass: "bg-blue-500", shadowClass: "shadow-blue-500/40" },
    { label: "صافي الربح", value: data.netProfit.toLocaleString() + " دج", icon: TrendingUp, bgClass: data.netProfit >= 0 ? "bg-emerald-500" : "bg-red-600", shadowClass: data.netProfit >= 0 ? "shadow-emerald-500/40" : "shadow-red-600/40", highlight: true },
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
          {/* ── KPI Cards (Redesigned) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <div key={i} className={`${kpi.bgClass} rounded-[2rem] p-6 shadow-xl ${kpi.shadowClass} text-white flex flex-col justify-between relative overflow-hidden transition-transform hover:-translate-y-1`}>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 translate-y-8 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex flex-col ml-3">
                    <span className="font-bold text-lg opacity-90">{kpi.label}</span>
                    <span className="text-xs opacity-70 mt-1">تتبع أداء الطلبيات</span>
                  </div>
                  {typeof kpi.value === 'number' ? (
                    <div className="bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                      {kpi.value}
                    </div>
                  ) : (
                    <div className="bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm shrink-0">
                      <kpi.icon size={22} />
                    </div>
                  )}
                </div>
                
                <div className="relative z-10">
                  {typeof kpi.value === 'string' && (
                    <div className="text-2xl font-black mb-3">{kpi.value}</div>
                  )}
                  {/* Progress Line */}
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-white/80 rounded-full" style={{ width: `${Math.max(30, Math.random() * 70 + 30)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Financial Tracking ── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" />
                حساب صافي الربح الحقيقي
              </h3>
              <a href="/admin/expenses" className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                💼 إدارة المصاريف
              </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {financeKpis.map((kpi, i) => (
                <div key={i} className={`${kpi.bgClass} rounded-[2rem] p-6 shadow-xl ${kpi.shadowClass} text-white flex flex-col justify-between relative overflow-hidden transition-transform hover:-translate-y-1`}>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 translate-y-8 pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex flex-col ml-3">
                      <span className="font-bold text-lg opacity-90">{kpi.label}</span>
                      <span className="text-xs opacity-70 mt-1">تتبع التدفقات المالية</span>
                    </div>
                    <div className="bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm shrink-0">
                      <kpi.icon size={22} />
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="text-2xl font-black mb-3">{kpi.value}</div>
                    {/* Progress Line */}
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-white/80 rounded-full" style={{ width: `${Math.max(30, Math.random() * 70 + 30)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Rates ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { label: "معدل التأكيد", value: confirmationRate, color: "#a855f7", bg: "bg-purple-50", fill: "bg-purple-500" },
              { label: "معدل التسليم", value: deliveryRate, color: "#22c55e", bg: "bg-emerald-50", fill: "bg-emerald-500" },
            ].map((r, i) => (
              <div key={i} className={`rounded-[2rem] p-6 border border-gray-100 shadow-sm ${r.bg} relative overflow-hidden`}>
                <div className="flex justify-between items-end mb-4 relative z-10">
                  <div className="flex flex-col">
                    <p className="text-gray-500 font-bold mb-1">{r.label}</p>
                    <p className="text-4xl font-black" style={{ color: r.color }}>{r.value}%</p>
                  </div>
                  <div className="bg-white px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-gray-700">
                    أداء ممتاز 🚀
                  </div>
                </div>
                <div className="h-3 bg-white/50 rounded-full overflow-hidden relative z-10 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${r.fill}`}
                    style={{ width: `${r.value}%` }}
                  />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full translate-x-16 -translate-y-16 pointer-events-none mix-blend-overlay" />
              </div>
            ))}
          </div>

          {/* ── Bar Chart + Pie Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left side: 4 Bar Charts in 2x2 grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Chart 1: Total Orders */}
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-center text-sm">الطلبيات الجديدة</h3>
                {data.dailyData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">لا توجد بيانات</div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.dailyData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-5} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px', fontWeight: 600 }} iconType="circle" />
                      <Bar dataKey="total" name="طلبيات جديدة" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Chart 2: Confirmed vs Cancelled */}
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-center text-sm">مؤكدة / ملغاة</h3>
                {data.dailyData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">لا توجد بيانات</div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.dailyData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-5} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px', fontWeight: 600 }} iconType="circle" />
                      <Bar dataKey="confirmed" name="مؤكدة" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={24} />
                      <Bar dataKey="cancelled" name="ملغاة" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Chart 3: Delivered vs Returned */}
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-center text-sm">مستلمة / روتور</h3>
                {data.dailyData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">لا توجد بيانات</div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.dailyData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-5} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px', fontWeight: 600 }} iconType="circle" />
                      <Bar dataKey="delivered" name="مستلمة" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={24} />
                      <Bar dataKey="returned" name="روتور" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Chart 4: Revenue */}
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-center text-sm">المبالغ المحصلة</h3>
                {data.dailyData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">لا توجد بيانات</div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.dailyData} margin={{ top: 10, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-5} tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px', fontWeight: 600 }} iconType="circle" />
                      <Bar dataKey="revenue" name="المبالغ (دج)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Right side: Pie Charts in a flex col */}
            <div className="flex flex-col gap-4">

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col">
              <h3 className="font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Package size={16} />
                </div>
                توزيع الحالات
              </h3>
              {data.statusData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات</div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={6}
                          cornerRadius={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {data.statusData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={<CustomTooltip />}
                          formatter={(v: any, name: any) => [v, STATUS_LABELS[name] || name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="w-full space-y-2 mt-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {data.statusData.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-600 font-bold">{STATUS_LABELS[s.name] || s.name}</span>
                        </div>
                        <span className="font-black text-gray-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cancel Reasons Pie Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col">
              <h3 className="font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2 text-lg text-red-600">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <XCircle size={16} />
                </div>
                أسباب الإلغاء
              </h3>
              {(!data.cancelReasonData || data.cancelReasonData.length === 0) ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">لا توجد طلبات ملغاة</div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.cancelReasonData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={6}
                          cornerRadius={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {data.cancelReasonData.map((_, i) => (
                            <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="w-full space-y-2 mt-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {data.cancelReasonData.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: COLORS[(i + 2) % COLORS.length] }} />
                          <span className="text-gray-600 font-bold truncate max-w-[120px]" title={s.name || "غير معروف"}>{s.name || "غير محدد"}</span>
                        </div>
                        <span className="font-black text-gray-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
