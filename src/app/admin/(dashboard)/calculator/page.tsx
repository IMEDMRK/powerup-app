"use client";

import React, { useState } from "react";
import { Calculator, DollarSign, Target, TrendingUp, TrendingDown, ShoppingCart, Percent, AlertCircle } from "lucide-react";

export default function ProfitCalculatorPage() {
  // Inputs
  const [sellingPrice, setSellingPrice] = useState(4500);
  const [productCost, setProductCost] = useState(1200);
  const [deliveryCost, setDeliveryCost] = useState(400);
  const [packagingCost, setPackagingCost] = useState(50);
  const [returnCost, setReturnCost] = useState(400);
  const [cpa, setCpa] = useState(300); // Cost per lead/sale
  
  const [totalLeads, setTotalLeads] = useState(100);
  const [confirmationRate, setConfirmationRate] = useState(70);
  const [deliveryRate, setDeliveryRate] = useState(60);

  // Calculations
  const confirmedOrders = Math.round(totalLeads * (confirmationRate / 100));
  const deliveredOrders = Math.round(confirmedOrders * (deliveryRate / 100));
  const returnedOrders = confirmedOrders - deliveredOrders;

  // Revenue & Costs
  const totalRevenue = deliveredOrders * sellingPrice;
  const totalProductCost = deliveredOrders * productCost;
  const totalDeliveryCost = deliveredOrders * deliveryCost;
  const totalReturnCost = returnedOrders * returnCost;
  const totalPackagingCost = confirmedOrders * packagingCost;
  const totalAdSpend = totalLeads * cpa;

  // Net Profit
  const totalExpenses = totalProductCost + totalDeliveryCost + totalReturnCost + totalPackagingCost + totalAdSpend;
  const netProfit = totalRevenue - totalExpenses;
  const netProfitPerDelivered = deliveredOrders > 0 ? Math.round(netProfit / deliveredOrders) : 0;
  
  // ROI
  const roi = totalExpenses > 0 ? Math.round((netProfit / totalExpenses) * 100) : 0;
  
  // True CPA
  const trueCpa = deliveredOrders > 0 ? Math.round(totalAdSpend / deliveredOrders) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Calculator className="text-primary w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-secondary">حاسبة الفائدة (Profit Calculator)</h1>
          <p className="text-gray-500">قم بمحاكاة توقعات أرباحك بناءً على تكاليف المنتج والإعلانات ومعدلات التوصيل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-gray-500" /> تكاليف المنتج والمبيعات
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">سعر البيع للزبون (د.ج)</label>
                <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">سعر شراء المنتج (د.ج)</label>
                <input type="number" value={productCost} onChange={(e) => setProductCost(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">توصيل (د.ج)</label>
                  <input type="number" value={deliveryCost} onChange={(e) => setDeliveryCost(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">روتور (د.ج)</label>
                  <input type="number" value={returnCost} onChange={(e) => setReturnCost(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">تغليف (د.ج)</label>
                  <input type="number" value={packagingCost} onChange={(e) => setPackagingCost(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">تكلفة الإعلان (CPA)</label>
                  <input type="number" value={cpa} onChange={(e) => setCpa(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target size={18} className="text-gray-500" /> الأداء والتوقعات
            </h2>
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>إجمالي الطلبيات المتوقعة (Leads)</span>
                  <span className="text-primary">{totalLeads} طلبية</span>
                </label>
                <input type="range" min="10" max="1000" step="10" value={totalLeads} onChange={(e) => setTotalLeads(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>نسبة التأكيد (Confirmation %)</span>
                  <span className="text-blue-500">{confirmationRate}%</span>
                </label>
                <input type="range" min="0" max="100" value={confirmationRate} onChange={(e) => setConfirmationRate(Number(e.target.value))} className="w-full accent-blue-500" />
              </div>
              <div>
                <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>نسبة التوصيل (Delivery %)</span>
                  <span className="text-green-500">{deliveryRate}%</span>
                </label>
                <input type="range" min="0" max="100" value={deliveryRate} onChange={(e) => setDeliveryRate(Number(e.target.value))} className="w-full accent-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Outputs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main KPI */}
          <div className={`p-8 rounded-3xl shadow-sm text-white ${netProfit > 0 ? "bg-gradient-to-br from-green-600 to-green-500" : "bg-gradient-to-br from-red-600 to-red-500"}`}>
            <h3 className="text-white/80 font-medium text-lg mb-2">الربح الصافي الإجمالي (Net Profit)</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">{netProfit.toLocaleString()}</span>
              <span className="text-xl font-medium">د.ج</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/20">
              <div>
                <div className="text-white/80 text-sm mb-1">الربح الصافي في كل مبيعة تم توصيلها</div>
                <div className="text-2xl font-bold">{netProfitPerDelivered.toLocaleString()} د.ج</div>
              </div>
              <div>
                <div className="text-white/80 text-sm mb-1">التكلفة الحقيقية للإعلان للمبيعة الواحدة</div>
                <div className="text-2xl font-bold">{trueCpa.toLocaleString()} د.ج</div>
              </div>
              <div>
                <div className="text-white/80 text-sm mb-1">العائد على الاستثمار (ROI)</div>
                <div className="text-2xl font-bold">{roi}%</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2 font-medium">
                <ShoppingCart size={16} /> مؤكدة
              </div>
              <div className="text-2xl font-bold text-gray-800">{confirmedOrders}</div>
              <div className="text-xs text-gray-400 mt-1">من أصل {totalLeads} طلبية</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-green-500 mb-2 font-medium">
                <TrendingUp size={16} /> مُسَلَّمَة
              </div>
              <div className="text-2xl font-bold text-gray-800">{deliveredOrders}</div>
              <div className="text-xs text-gray-400 mt-1">نسبة التوصيل {deliveryRate}%</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-red-500 mb-2 font-medium">
                <TrendingDown size={16} /> روتور
              </div>
              <div className="text-2xl font-bold text-gray-800">{returnedOrders}</div>
              <div className="text-xs text-gray-400 mt-1">تكلفة الإرجاع الكلية {totalReturnCost.toLocaleString()} د.ج</div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle size={18} className="text-gray-500" /> تفاصيل التكاليف والمداخيل
              </h3>
            </div>
            <div className="p-0">
              <table className="w-full text-right text-sm">
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="p-4 font-medium text-gray-600">إجمالي المداخيل (الطلبيات المسلمة × السعر)</td>
                    <td className="p-4 font-bold text-green-600 text-left">+{totalRevenue.toLocaleString()} د.ج</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="p-4 font-medium text-gray-600">تكلفة شراء المنتجات (التي تم توصيلها فقط)</td>
                    <td className="p-4 font-bold text-red-500 text-left">-{totalProductCost.toLocaleString()} د.ج</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="p-4 font-medium text-gray-600">تكلفة الإعلانات الكلية</td>
                    <td className="p-4 font-bold text-red-500 text-left">-{totalAdSpend.toLocaleString()} د.ج</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="p-4 font-medium text-gray-600">تكلفة التوصيل للزبائن المستلمين</td>
                    <td className="p-4 font-bold text-red-500 text-left">-{totalDeliveryCost.toLocaleString()} د.ج</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="p-4 font-medium text-gray-600">خسائر الإرجاع (الروتور)</td>
                    <td className="p-4 font-bold text-red-500 text-left">-{totalReturnCost.toLocaleString()} د.ج</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-600">تكلفة التغليف (لجميع الطلبيات المؤكدة)</td>
                    <td className="p-4 font-bold text-red-500 text-left">-{totalPackagingCost.toLocaleString()} د.ج</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
