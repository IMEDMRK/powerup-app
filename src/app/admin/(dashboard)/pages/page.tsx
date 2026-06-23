"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Edit, Trash2, ToggleLeft, ToggleRight, Copy, Globe } from "lucide-react";

export default function PagesListPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPage, setNewPage] = useState({ productName: "", slug: "", headline: "" });
  const [showForm, setShowForm] = useState(false);

  const fetchPages = async () => {
    const res = await fetch("/api/admin/pages");
    setPages(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPage),
    });
    setNewPage({ productName: "", slug: "", headline: "" });
    setShowForm(false);
    setCreating(false);
    fetchPages();
  };

  const toggleActive = async (page: any) => {
    await fetch(`/api/admin/pages/${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !page.isActive }),
    });
    fetchPages();
  };

  const deletePage = async (id: string) => {
    if (!confirm("هل تريد حذف هذه الصفحة؟")) return;
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    fetchPages();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📄 صفحات الهبوط</h1>
          <p className="text-gray-500 text-sm mt-1">إنشاء وإدارة صفحات هبوط لمنتجاتك</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-all"
        >
          <Plus size={18} /> صفحة جديدة
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">إنشاء صفحة هبوط جديدة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">اسم المنتج</label>
              <input required value={newPage.productName} onChange={e => setNewPage({...newPage, productName: e.target.value})}
                placeholder="مثال: POWER UP" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">الرابط (slug)</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <span className="bg-gray-50 px-3 py-2 text-gray-400 text-sm border-r">/p/</span>
                <input required value={newPage.slug} onChange={e => setNewPage({...newPage, slug: e.target.value.toLowerCase().replace(/\s+/g,"-")})}
                  placeholder="powerup" className="flex-1 px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">العنوان الرئيسي</label>
              <input required value={newPage.headline} onChange={e => setNewPage({...newPage, headline: e.target.value})}
                placeholder="عزز وزنك مع POWER UP" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={creating} className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary-dark disabled:opacity-60">
              {creating ? "جاري الإنشاء..." : "إنشاء الصفحة"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm">
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Pages List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">جاري التحميل...</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <Globe size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">لا توجد صفحات هبوط بعد</p>
          <p className="text-gray-400 text-sm mt-1">ابدأ بإنشاء صفحتك الأولى</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-gray-900 text-lg">{page.productName}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${page.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {page.isActive ? "🟢 مفعّل" : "⚫ معطّل"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm truncate mb-2">{page.headline}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="bg-gray-100 px-2 py-1 rounded font-mono">/p/{page.slug}</span>
                    <span>•</span>
                    <span>{page.offers?.length || 0} عروض</span>
                    <span>•</span>
                    <span>{new Date(page.createdAt).toLocaleDateString("ar-DZ")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* View */}
                  <a href={`/p/${page.slug}`} target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="معاينة">
                    <ExternalLink size={18} />
                  </a>
                  {/* Copy link */}
                  <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${page.slug}`)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="نسخ الرابط">
                    <Copy size={18} />
                  </button>
                  {/* Toggle */}
                  <button onClick={() => toggleActive(page)}
                    className={`p-2 rounded-lg transition-colors ${page.isActive ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`} title="تفعيل/تعطيل">
                    {page.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  {/* Edit */}
                  <Link href={`/admin/pages/${page.id}`}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors" title="تعديل">
                    <Edit size={18} />
                  </Link>
                  {/* Delete */}
                  <button onClick={() => deletePage(page.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
