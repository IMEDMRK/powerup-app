"use client";

import { useState } from "react";
import { saveGoogleSheetsConfig } from "../actions";
import { Copy, CheckCircle, Save, ExternalLink } from "lucide-react";
import Link from "next/link";

const APP_SCRIPT_CODE = `
// هذا السكربت يستقبل الطلبيات ويضعها في جوجل شيت
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // إذا كانت هذه أول مرة، نقوم بإضافة العناوين
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "رقم الطلب", "تاريخ الطلب", "الاسم الكامل", "الهاتف", 
        "الولاية", "البلدية", "المنتج", "العرض", "الكمية", 
        "سعر الوحدة", "التوصيل", "الإجمالي", "المنصة", "تيك توك", "فيسبوك"
      ]);
      // تلوين العناوين
      sheet.getRange("A1:O1").setBackground("#f97316").setFontColor("white").setFontWeight("bold");
    }

    var row = [
      data.orderId || "",
      data.createdAt || "",
      data.fullName || "",
      data.phone || "",
      data.wilaya || "",
      data.baladiya || "",
      data.productName || "",
      data.offerLabel || "",
      data.quantity || "",
      data.unitPrice || "",
      data.deliveryPrice || "",
      data.totalPrice || "",
      data.pageSlug || "",
      data.ttclid || "",
      data.fbclid || ""
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export default function GoogleSheetsForm({ initialConfig }: { initialConfig: any }) {
  const [active, setActive] = useState(initialConfig?.active || false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(APP_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("active", active.toString());
    
    try {
      await saveGoogleSheetsConfig(formData);
      alert("تم حفظ الإعدادات بنجاح!");
    } catch (error) {
      alert("حدث خطأ أثناء حفظ الإعدادات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">إعدادات الربط</h2>
            <p className="text-sm text-gray-500 mt-1">قم بتفعيل الربط وضع الرابط المخصص (Webhook)</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600">حالة الربط:</span>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${active ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${active ? 'translate-x-1' : 'translate-x-6'}`} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-700">رابط Webhook (Deployment URL)</label>
          <input 
            type="url" 
            name="webhookUrl"
            defaultValue={initialConfig?.webhookUrl || ""}
            required={active}
            dir="ltr"
            placeholder="https://script.google.com/macros/s/AKfycby.../exec"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none text-left"
          />
          <p className="text-xs text-gray-500">
            الصق الرابط الذي حصلت عليه بعد نشر السكربت في Google Sheets.
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            {!loading && <Save size={18} />}
          </button>
        </div>
      </form>

      {/* Instructions */}
      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
          كيفية استخراج رابط Webhook من Google Sheets؟
        </h3>
        <ol className="list-decimal list-inside space-y-4 text-blue-900 text-sm leading-relaxed font-medium">
          <li>قم بفتح ملف Google Sheets جديد.</li>
          <li>من القائمة العلوية، اضغط على <strong>Extensions (الإضافات)</strong> ثم اختر <strong>Apps Script</strong>.</li>
          <li>سيفتح لك محرر أكواد، قم بحذف الكود الموجود هناك والصق الكود التالي:</li>
        </ol>

        <div className="my-4 relative" dir="ltr">
          <div className="absolute top-2 right-2 flex gap-2">
            <button 
              onClick={handleCopy}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
            >
              {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? "تم النسخ!" : "نسخ الكود"}
            </button>
          </div>
          <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-5 rounded-xl overflow-x-auto text-xs font-mono border border-gray-800 shadow-inner">
            <code>{APP_SCRIPT_CODE.trim()}</code>
          </pre>
        </div>

        <ol className="list-decimal list-inside space-y-4 text-blue-900 text-sm leading-relaxed font-medium" start={4}>
          <li>بعد لصق الكود، اضغط على زر <strong>Save (حفظ 💾)</strong>.</li>
          <li>اضغط على زر <strong>Deploy</strong> (أزرق في أعلى اليمين) واختر <strong>New deployment</strong>.</li>
          <li>انقر على أيقونة الترس ⚙️ بجوار "Select type" واختر <strong>Web app</strong>.</li>
          <li>في خانة "Who has access"، اختر <strong>Anyone (أي شخص)</strong>.</li>
          <li>اضغط <strong>Deploy</strong> (قد يطلب منك الموافقة على الصلاحيات، اضغط Allow access).</li>
          <li>أخيراً، انسخ الرابط الموجود أسفل <strong>Web app URL</strong> والصقه في الخانة بالأعلى!</li>
        </ol>
      </div>
    </div>
  );
}
