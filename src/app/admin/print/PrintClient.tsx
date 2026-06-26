"use client";

import React, { useEffect } from "react";
import { Printer } from "lucide-react";

export default function PrintClient({ orders, storeName }: { orders: any[]; storeName: string }) {
  useEffect(() => {
    // Automatically trigger print when the page loads
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-container">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-grid { 
            display: grid !important; 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 20px !important; 
          }
          .bordereau-card { 
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border: 2px solid #000 !important;
          }
        }
      `}} />
      
      <div className="p-4 bg-white shadow-sm border-b border-gray-200 no-print flex justify-between items-center sticky top-0 z-10">
        <div className="font-bold">جارٍ تجهيز {orders.length} ملصق للطباعة...</div>
        <button 
          onClick={() => window.print()} 
          className="bg-primary text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all">
          <Printer size={18} /> طباعة الآن
        </button>
      </div>

      <div className="p-8">
        <div className="print-grid grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {orders.map((order, idx) => (
            <div key={order.id} className="bordereau-card border-2 border-gray-800 rounded-2xl p-6 bg-white flex flex-col justify-between h-auto min-h-[300px]">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{storeName}</h2>
                  <p className="text-sm text-gray-500 font-mono mt-1">N°: {order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Bordereau D'expédition</div>
                  <div className="text-xs text-gray-400 font-mono">{new Date(order.createdAt).toLocaleDateString("en-GB")}</div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3 flex-1">
                <div>
                  <div className="text-xs text-gray-500 font-bold mb-1">إلى السيد(ة) / Destinataire:</div>
                  <div className="text-xl font-black text-gray-900">{order.fullName || "بدون اسم"}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 font-bold mb-1">الهاتف / Téléphone:</div>
                  <div className="text-lg font-bold text-gray-800 font-mono" dir="ltr">{order.phone}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-bold mb-1">العنوان / Adresse:</div>
                  <div className="text-base font-bold text-gray-800">{order.wilaya} - {order.baladiya}</div>
                </div>
                
                {order.notes && (
                  <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 mt-2">
                    <div className="text-[10px] text-gray-500 font-bold mb-0.5">ملاحظة / Note:</div>
                    <div className="text-sm font-bold text-gray-800">{order.notes}</div>
                  </div>
                )}
              </div>

              {/* Footer / Product & Price */}
              <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 flex justify-between items-end">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 font-bold mb-1">المنتج / Produit:</div>
                  <div className="text-sm font-black text-gray-900">
                    {order.offerLabel ? `${order.offerLabel}` : (order.pageSlug || "منتج")}
                    <span className="text-primary font-black mx-2">× {order.quantity || 1}</span>
                  </div>
                </div>
                <div className="text-left bg-gray-900 text-white px-4 py-2 rounded-xl">
                  <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wide mb-0.5 text-center">الإجمالي (COD)</div>
                  <div className="text-xl font-black">{order.finalTotal.toLocaleString()} دج</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
