"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FileText, Plus, User, Calendar, MessageSquare, AlertCircle } from "lucide-react";

export default function ReportsClient({ isAdmin }: { isAdmin: boolean }) {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [confirmedOrders, setConfirmedOrders] = useState("");
  const [deliveredOrders, setDeliveredOrders] = useState("");
  const [upsells, setUpsells] = useState("");
  const [commonObjections, setCommonObjections] = useState("");
  const [commonQuestions, setCommonQuestions] = useState("");
  const [notes, setNotes] = useState("");

  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (res.ok) setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedOrders,
          deliveredOrders,
          upsells,
          commonObjections,
          commonQuestions,
          notes,
        }),
      });

      if (res.ok) {
        toast.success("تم إرسال التقرير بنجاح!");
        // Reset form
        setConfirmedOrders("");
        setDeliveredOrders("");
        setUpsells("");
        setCommonObjections("");
        setCommonQuestions("");
        setNotes("");
        fetchReports();
      } else {
        toast.error("حدث خطأ أثناء الإرسال");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الإرسال");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (id: string) => {
    const text = replyText[id];
    if (!text) return;
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: text }),
      });
      if (res.ok) {
        toast.success("تم إضافة الرد بنجاح");
        setReplyText({ ...replyText, [id]: "" });
        fetchReports();
      } else {
        toast.error("خطأ في إضافة الرد");
      }
    } catch (e) {
      toast.error("خطأ في إضافة الرد");
    }
  };

  if (isLoading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>;

  return (
    <div className="space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="text-primary" />
            إضافة تقرير يومي جديد
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الطلبيات المؤكدة</label>
                <input type="number" required value={confirmedOrders} onChange={(e) => setConfirmedOrders(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الطلبيات المستلمة (Livré)</label>
                <input type="number" required value={deliveredOrders} onChange={(e) => setDeliveredOrders(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مبيعات الـ Upsell (علب إضافية)</label>
                <input type="number" required value={upsells} onChange={(e) => setUpsells(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اعتراضات ومشاكل الزبائن المتكررة اليوم</label>
              <textarea value={commonObjections} onChange={(e) => setCommonObjections(e.target.value)} rows={2} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="مثال: الكثير يشتكي من سعر التوصيل لولاية أدرار..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">أسئلة الزبائن المتكررة اليوم</label>
              <textarea value={commonQuestions} onChange={(e) => setCommonQuestions(e.target.value)} rows={2} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="مثال: هل المنتج يصلح لمرضى السكري؟..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات أخرى (اختياري)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50">
              {isSubmitting ? "جاري الإرسال..." : "إرسال التقرير"}
            </button>
          </form>
        </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="text-primary" />
          {isAdmin ? "سجل تقارير الموظفين" : "تقاريري السابقة"}
        </h2>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد تقارير حتى الآن.</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-4">
                    {isAdmin && (
                      <div className="flex items-center gap-2 text-primary font-bold bg-orange-50 px-3 py-1 rounded-lg">
                        <User size={16} />
                        {report.user?.name || report.user?.username}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar size={16} />
                      {new Date(report.date).toLocaleDateString("ar-DZ", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm font-medium">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">مؤكدة: {report.confirmedOrders}</span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg">مستلمة: {report.deliveredOrders}</span>
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg">Upsell: {report.upsells}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {report.commonObjections && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-red-500" />
                        الاعتراضات المتكررة
                      </h4>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap bg-red-50/50 p-3 rounded-lg">{report.commonObjections}</p>
                    </div>
                  )}
                  {report.commonQuestions && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                        <MessageSquare size={16} className="text-blue-500" />
                        الأسئلة المتكررة
                      </h4>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap bg-blue-50/50 p-3 rounded-lg">{report.commonQuestions}</p>
                    </div>
                  )}
                  {report.notes && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">ملاحظات إضافية</h4>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{report.notes}</p>
                    </div>
                  )}
                </div>

                {/* Admin Reply Section */}
                {report.adminReply ? (
                  <div className="mt-4 bg-green-50 border border-green-100 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-green-800 mb-1">رد الإدارة:</h4>
                    <p className="text-green-700 text-sm whitespace-pre-wrap">{report.adminReply}</p>
                  </div>
                ) : (
                  isAdmin && (
                    <div className="mt-4 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="إضافة رد أو ملاحظة على هذا التقرير..." 
                        value={replyText[report.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [report.id]: e.target.value })}
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                      />
                      <button 
                        onClick={() => handleReply(report.id)}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors"
                      >
                        إضافة الرد
                      </button>
                    </div>
                  )
                )}

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
