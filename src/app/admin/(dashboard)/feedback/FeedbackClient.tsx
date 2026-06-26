"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { MessageSquareWarning, Send, Clock, UserX } from "lucide-react";

export default function FeedbackClient({ isAdmin }: { isAdmin: boolean }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(isAdmin); // Only load list if admin
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isAdmin) {
      fetchFeedbacks();
    }
  }, [isAdmin]);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (res.ok) setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        toast.success("تم إرسال رسالتك بسرية تامة!");
        setMessage("");
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
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: text }),
      });
      if (res.ok) {
        toast.success("تم إضافة الرد بنجاح");
        setReplyText({ ...replyText, [id]: "" });
        fetchFeedbacks();
      } else {
        toast.error("خطأ في إضافة الرد");
      }
    } catch (e) {
      toast.error("خطأ في إضافة الرد");
    }
  };

  if (isAdmin && isLoading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>;

  return (
    <div className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6 bg-blue-50 p-4 rounded-xl text-blue-800">
            <UserX size={32} className="text-blue-500" />
            <div>
              <h3 className="font-bold text-lg">هذا الصندوق سري ومجهول 100%</h3>
              <p className="text-sm">لا يتم تسجيل اسمك، بريدك، أو أي معلومة تدل عليك. الإدارة ستقرأ الرسالة فقط.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رسالتك، شكواك، أو اقتراحك:</label>
              <textarea 
                required 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                rows={6} 
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-lg resize-none" 
                placeholder="اكتب كل ما يدور في ذهنك هنا... (عن الراتب، ضغط العمل، مشاكل مع زملاء، اقتراحات لتطوير العمل...)"
              ></textarea>
            </div>

            <button type="submit" disabled={isSubmitting || !message.trim()} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
              <Send size={20} />
              {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة للإدارة"}
            </button>
          </form>
        </div>

      {isAdmin && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquareWarning className="text-primary" />
            الرسائل الواردة ({feedbacks.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-center py-8">لا توجد رسائل في الصندوق حتى الآن.</p>
            ) : (
              feedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-gray-900 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm border-b border-gray-50 pb-3">
                    <Clock size={16} />
                    {new Date(feedback.createdAt).toLocaleString("ar-DZ", { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">{feedback.message}</p>
                  
                  {/* Admin Reply Section */}
                  {feedback.adminReply ? (
                    <div className="mt-2 bg-green-50 border border-green-100 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-green-800 mb-1">رد الإدارة:</h4>
                      <p className="text-green-700 text-sm whitespace-pre-wrap">{feedback.adminReply}</p>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="إضافة رد للإدارة يراه صاحب الرسالة..." 
                        value={replyText[feedback.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [feedback.id]: e.target.value })}
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                      />
                      <button 
                        onClick={() => handleReply(feedback.id)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                      >
                        إضافة رد
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
