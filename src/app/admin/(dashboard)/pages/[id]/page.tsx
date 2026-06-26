"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowRight, GripVertical, Plus, Trash2, ExternalLink, Video, Play } from "lucide-react";
import DynamicSectionsEditor from "@/components/admin/DynamicSectionsEditor";

const SECTION_LABELS: Record<string, string> = {
  hero: "🏠 الهيدر (Hero)",
  benefits: "✨ الفوائد",
  ingredients: "🌿 المكونات",
  usage: "📋 طريقة الاستخدام",
  comparison: "🆚 جدول المقارنة",
  testimonials: "💬 آراء العملاء",
  faq: "❓ الأسئلة الشائعة",
  order: "📦 نموذج الطلب",
  videos: "🎬 الفيديوهات",
};

function getYoutubeThumbnail(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/);
  if (!m) return null;
  const id = m[0].split(/v=|\//).pop();
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

export default function PageEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<any>(null);
  const [tab, setTab] = useState<"content" | "details" | "offers" | "videos" | "sections" | "scarcity" | "theme">("content");
  const [videos, setVideos] = useState<any[]>([]);
  const [videosSaving, setVideosSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`)
      .then(r => r.json())
      .then(data => {
        setPage({
          ...data,
          sectionsOrder: typeof data.sectionsOrder === "string"
            ? JSON.parse(data.sectionsOrder)
            : data.sectionsOrder,
        });
      });
    // Load videos
    fetch(`/api/admin/pages/${id}/videos`)
      .then(r => r.json())
      .then(data => setVideos(Array.isArray(data) ? data : []))
      .catch(() => setVideos([]));
  }, [id]);

  const saveVideos = async () => {
    setVideosSaving(true);
    await fetch(`/api/admin/pages/${id}/videos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(videos),
    });
    setVideosSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addVideo = () => setVideos(prev => [...prev, { id: Date.now().toString(), title: "", url: "", description: "" }]);
  const removeVideo = (i: number) => setVideos(prev => prev.filter((_, idx) => idx !== i));
  const updateVideo = (i: number, k: string, v: string) => setVideos(prev => prev.map((vid, idx) => idx === i ? { ...vid, [k]: v } : vid));


  const save = async () => {
    setSaving(true);
    const payload = {
      ...page,
      sectionsOrder: JSON.stringify(page.sectionsOrder),
    };
    await fetch(`/api/admin/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Offers helpers
  const addOffer = () => {
    setPage((p: any) => ({
      ...p,
      offers: [...(p.offers || []), { label: "عرض جديد", quantity: 1, originalPrice: 0, salePrice: 0, badge: "", isDefault: false }],
    }));
  };
  const removeOffer = (i: number) => {
    setPage((p: any) => ({ ...p, offers: p.offers.filter((_: any, idx: number) => idx !== i) }));
  };
  const updateOffer = (i: number, field: string, value: any) => {
    setPage((p: any) => {
      const offers = [...p.offers];
      offers[i] = { ...offers[i], [field]: value };
      // only one default at a time
      if (field === "isDefault" && value) offers.forEach((o, idx) => { if (idx !== i) o.isDefault = false; });
      return { ...p, offers };
    });
  };

  // Drag & Drop for sections
  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    setPage((p: any) => {
      const arr = [...p.sectionsOrder];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(i, 0, moved);
      setDragIdx(i);
      return { ...p, sectionsOrder: arr };
    });
  };
  const onDragEnd = () => setDragIdx(null);

  if (!page) return <div className="text-center py-20 text-gray-400">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/pages")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">تعديل: {page.productName}</h1>
            <a href={`/p/${page.slug}`} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              /p/{page.slug} <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary-dark"} disabled:opacity-60`}>
          <Save size={16} />
          {saved ? "✓ تم الحفظ!" : saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 flex-wrap">
        {(["content", "details", "offers", "videos", "scarcity", "sections", "theme"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "content" ? "📝 المحتوى" : t === "details" ? "✨ التفاصيل" : t === "offers" ? "💰 العروض" : t === "videos" ? "🎬 الفيديوهات" : t === "scarcity" ? "⚡ المحفزات" : t === "sections" ? "🔀 الترتيب" : "🎨 الألوان"}
          </button>
        ))}
      </div>

      {/* ── TAB: CONTENT ── */}
      {tab === "content" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">اسم المنتج</label>
              <input value={page.productName} onChange={e => setPage({...page, productName: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">الرابط (slug)</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <span className="bg-gray-50 px-3 py-2.5 text-gray-400 text-sm border-r">/p/</span>
                <input value={page.slug} onChange={e => setPage({...page, slug: e.target.value})}
                  className="flex-1 px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">العنوان الرئيسي</label>
            <input value={page.headline} onChange={e => setPage({...page, headline: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">العنوان الثانوي</label>
            <input value={page.subheadline || ""} onChange={e => setPage({...page, subheadline: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">وصف المنتج</label>
            <textarea rows={3} value={page.description || ""} onChange={e => setPage({...page, description: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
          </div>

          {/* ─── Prices ─── */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <p className="text-xs font-black text-orange-700 mb-3 uppercase tracking-wide">💰 سعر المنتج في صفحة الهبوط</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  السعر بعد التخفيض (دج) <span className="text-primary">★</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={page.salePrice ?? ""}
                  onChange={e => setPage({...page, salePrice: e.target.value ? parseInt(e.target.value) : null})}
                  placeholder="مثال: 2900"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  السعر الأصلي قبل التخفيض (دج)
                </label>
                <input
                  type="number"
                  min={0}
                  value={page.originalPrice ?? ""}
                  onChange={e => setPage({...page, originalPrice: e.target.value ? parseInt(e.target.value) : null})}
                  placeholder="مثال: 4500"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            {page.salePrice && page.originalPrice && page.originalPrice > page.salePrice && (
              <div className="mt-3 flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-orange-100">
                <span className="text-red-400 line-through text-sm">{page.originalPrice.toLocaleString()} دج</span>
                <span className="text-primary font-black text-lg">{page.salePrice.toLocaleString()} دج</span>
                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                  خصم {Math.round((1 - page.salePrice / page.originalPrice) * 100)}%
                </span>
                <span className="text-xs text-gray-400 mr-auto">👆 هكذا ستظهر في صفحة الهبوط</span>
              </div>
            )}
          </div>

          {/* ─── Inventory ─── */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-xs font-black text-green-700 mb-3 uppercase tracking-wide">📦 إدارة المخزون</p>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                الكمية المتوفرة حالياً (عدد العلب)
              </label>
              <input
                type="number"
                min={0}
                value={page.stockCount ?? 0}
                onChange={e => setPage({...page, stockCount: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full md:w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none font-bold"
              />
              <p className="text-xs text-green-600 mt-2">
                يتم إنقاص هذا العدد أوتوماتيكياً في كل مرة تتغير فيها حالة طلبية إلى <strong>"مستلمة"</strong>.
              </p>
            </div>
          </div>

          {/* ─── Tracking Pixels ─── */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
            <p className="text-xs font-black text-purple-700 mb-3 uppercase tracking-wide">🎯 تتبع التحويلات (البيكسل)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  فيسبوك بيكسل (اختياري)
                </label>
                <input
                  type="text"
                  value={page.metaPixelIds ?? ""}
                  onChange={e => setPage({...page, metaPixelIds: e.target.value})}
                  placeholder="مثال: 1234567, 890123"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  تيك توك بيكسل (اختياري)
                </label>
                <input
                  type="text"
                  value={page.tiktokPixelIds ?? ""}
                  onChange={e => setPage({...page, tiktokPixelIds: e.target.value})}
                  placeholder="مثال: CABCD123456"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              يمكنك وضع أكثر من بيكسل مفصولين بفاصلة (<code>,</code>). هذه البيكسلات ستعمل جنباً إلى جنب مع البيكسلات العامة في صفحة الإعدادات.
            </p>
          </div>
          {/* ── Video Section Titles ── */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
              🎬 عنوان قسم الفيديوهات
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">العنوان الرئيسي</label>
              <input
                value={page.videoTitle || ""}
                onChange={e => setPage({...page, videoTitle: e.target.value})}
                placeholder="مثال: ماذا يقول الناس عن المنتج؟"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">العنوان الثانوي (اختياري)</label>
              <input
                value={page.videoSubtitle || ""}
                onChange={e => setPage({...page, videoSubtitle: e.target.value})}
                placeholder="مثال: آراء حقيقية من عملاء جربوا المنتج"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
              />
            </div>
            {page.videoTitle && (
              <div className="bg-white rounded-xl px-4 py-3 border border-blue-100 text-center">
                <p className="font-black text-gray-900 text-base">{page.videoTitle}</p>
                {page.videoSubtitle && <p className="text-gray-400 text-xs mt-1">{page.videoSubtitle}</p>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">رابط صورة المنتج</label>
            <input value={page.productImage || ""} onChange={e => setPage({...page, productImage: e.target.value})}
              placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
            {page.productImage && (
              <img src={page.productImage} alt="" className="mt-3 h-32 w-auto rounded-xl border object-cover" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={page.isActive} onChange={e => setPage({...page, isActive: e.target.checked})}
              className="w-4 h-4 accent-primary" />
            <label htmlFor="isActive" className="text-sm font-bold text-gray-700">الصفحة مفعّلة ومرئية للزوار</label>
          </div>
        </div>
      )}

      {/* ── TAB: CONTENT DETAILS ── */}
      {tab === "details" && (
        <DynamicSectionsEditor page={page} setPage={setPage} />
      )}

      {/* ── TAB: OFFERS ── */}
      {tab === "offers" && (
        <div className="space-y-4">
          {(page.offers || []).map((offer: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input type="radio" name="defaultOffer" checked={offer.isDefault}
                    onChange={() => updateOffer(i, "isDefault", true)}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-gray-500">العرض الافتراضي</span>
                </div>
                <button onClick={() => removeOffer(i)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">اسم العرض</label>
                  <input value={offer.label} onChange={e => updateOffer(i, "label", e.target.value)}
                    placeholder="علبة واحدة" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">الكمية</label>
                  <input type="number" min={1} value={offer.quantity} onChange={e => updateOffer(i, "quantity", parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">شارة (اختياري)</label>
                  <input value={offer.badge || ""} onChange={e => updateOffer(i, "badge", e.target.value)}
                    placeholder="الأكثر مبيعاً" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">السعر الأصلي (دج)</label>
                  <input type="number" value={offer.originalPrice} onChange={e => updateOffer(i, "originalPrice", parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">سعر البيع (دج)</label>
                  <input type="number" value={offer.salePrice} onChange={e => updateOffer(i, "salePrice", parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="col-span-2 flex items-end">
                  <div className="bg-orange-50 rounded-lg px-4 py-2 w-full text-center">
                    <p className="text-xs text-gray-500">التوفير</p>
                    <p className="font-black text-primary text-lg">
                      {offer.originalPrice - offer.salePrice > 0
                        ? `${offer.originalPrice - offer.salePrice} دج`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Free Shipping Toggle */}
              <div className={`mt-4 flex items-center justify-between rounded-xl px-4 py-3 border-2 cursor-pointer transition-all ${offer.freeShipping ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}
                onClick={() => updateOffer(i, "freeShipping", !offer.freeShipping)}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{offer.freeShipping ? "🚚" : "📦"}</span>
                  <div>
                    <p className={`text-sm font-bold ${offer.freeShipping ? "text-green-700" : "text-gray-600"}`}>
                      {offer.freeShipping ? "التوصيل مجاني مع هذا العرض ✓" : "التوصيل مدفوع مع هذا العرض"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {offer.freeShipping ? "الزبون لن يدفع سعر التوصيل" : "سيُضاف سعر التوصيل حسب الولاية"}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all relative ${offer.freeShipping ? "bg-green-500" : "bg-gray-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${offer.freeShipping ? "left-7" : "left-1"}`} />
                </div>
              </div>

            </div>
          ))}

          <button onClick={addOffer}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-primary hover:text-primary flex items-center justify-center gap-2 transition-colors font-medium">
            <Plus size={18} /> إضافة عرض جديد
          </button>
        </div>
      )}

      {/* ── TAB: VIDEOS ── */}
      {tab === "videos" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
            <strong>🎬 الفيديوهات المدعومة:</strong> YouTube — TikTok — Instagram Reels — Facebook
            <br />أضف رابط الفيديو مباشرة (مثال: https://www.youtube.com/watch?v=...)
          </div>

          {videos.map((video, i) => {
            const thumb = getYoutubeThumbnail(video.url);
            return (
              <div key={video.id || i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex gap-4">
                  {/* Thumbnail preview */}
                  <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center border border-gray-200">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Play size={24} className="text-gray-300" />
                    )}
                  </div>
                  {/* Fields */}
                  <div className="flex-1 grid grid-cols-1 gap-3">
                    <input
                      value={video.title}
                      onChange={e => updateVideo(i, "title", e.target.value)}
                      placeholder="عنوان الفيديو (مثال: كوتش أحمد يتكلم عن POWER UP)"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-bold"
                    />
                    <input
                      value={video.url}
                      onChange={e => updateVideo(i, "url", e.target.value)}
                      placeholder="رابط الفيديو https://www.youtube.com/watch?v=..."
                      dir="ltr"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-mono text-xs"
                    />
                    <input
                      value={video.description || ""}
                      onChange={e => updateVideo(i, "description", e.target.value)}
                      placeholder="وصف قصير (اختياري)"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <button onClick={() => removeVideo(i)} className="text-red-400 hover:text-red-600 p-1 self-start">
                    <Trash2 size={18} />
                  </button>
                </div>
                {video.url && (
                  <a href={video.url} target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-xs text-blue-500 hover:underline">
                    <ExternalLink size={12} /> فتح الفيديو للمعاينة
                  </a>
                )}
              </div>
            );
          })}

          <button onClick={addVideo}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-primary hover:text-primary flex items-center justify-center gap-2 transition-colors font-medium">
            <Plus size={18} /> إضافة فيديو جديد
          </button>

          <div className="flex justify-end pt-2">
            <button onClick={saveVideos} disabled={videosSaving}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-60 shadow-sm">
              <Save size={16} />
              {videosSaving ? "جاري الحفظ..." : `💾 حفظ الفيديوهات (${videos.length})`}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: SCARCITY ── */}
      {tab === "scarcity" && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-black text-yellow-800 text-sm">⏳ العداد التنازلي (Countdown Timer)</h3>
                <p className="text-xs text-yellow-600 mt-1">يظهر في أعلى الشاشة لإخبار الزبون أن العرض سينتهي قريباً.</p>
              </div>
              <div className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${page.timerActive ? "bg-yellow-500" : "bg-gray-300"}`}
                onClick={() => setPage({...page, timerActive: !page.timerActive})}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${page.timerActive ? "left-7" : "left-1"}`} />
              </div>
            </div>
            {page.timerActive && (
              <div className="mt-4 bg-white rounded-xl p-4 border border-yellow-100">
                <label className="block text-xs font-bold text-gray-600 mb-1">وقت العداد (بالدقائق)</label>
                <input type="number" min={1} value={page.timerMinutes} onChange={e => setPage({...page, timerMinutes: parseInt(e.target.value)})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none mb-3" />
                
                <label className="block text-xs font-bold text-gray-600 mb-1">لون العداد التنازلي 🎨</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={page.timerColor || "#fef08a"} onChange={e => setPage({...page, timerColor: e.target.value})}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={page.timerColor || "#fef08a"} onChange={e => setPage({...page, timerColor: e.target.value})}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none font-mono" dir="ltr" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-black text-red-800 text-sm">🔥 إشعار نفاذ المخزون (Stock Alert)</h3>
                <p className="text-xs text-red-600 mt-1">نص أحمر ملفت يظهر فوق زر الشراء ليحفز الزبون على الطلب بسرعة.</p>
              </div>
              <div className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${page.scarcityActive ? "bg-red-500" : "bg-gray-300"}`}
                onClick={() => setPage({...page, scarcityActive: !page.scarcityActive})}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${page.scarcityActive ? "left-7" : "left-1"}`} />
              </div>
            </div>
            {page.scarcityActive && (
              <div className="mt-4 bg-white rounded-xl p-4 border border-red-100">
                <label className="block text-xs font-bold text-gray-600 mb-1">نص الإشعار</label>
                <input value={page.scarcityText || ""} onChange={e => setPage({...page, scarcityText: e.target.value})}
                  placeholder="مثال: بقيت 3 قطع فقط في المخزن، سارع بالطلب!"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 outline-none font-bold text-red-600 mb-3" />

                <label className="block text-xs font-bold text-gray-600 mb-1">لون الإشعار 🎨</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={page.scarcityColor || "#fee2e2"} onChange={e => setPage({...page, scarcityColor: e.target.value})}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={page.scarcityColor || "#fee2e2"} onChange={e => setPage({...page, scarcityColor: e.target.value})}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none font-mono" dir="ltr" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-black text-indigo-800 text-sm">👥 إشعارات الشراء الوهمية (Social Proof)</h3>
                <p className="text-xs text-indigo-600 mt-1">إشعارات تظهر وتختفي تلقائياً بأسماء مشترين لمنح الثقة للزبون الجديد.</p>
              </div>
              <div className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${page.socialProofActive ? "bg-indigo-500" : "bg-gray-300"}`}
                onClick={() => setPage({...page, socialProofActive: !page.socialProofActive})}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${page.socialProofActive ? "left-7" : "left-1"}`} />
              </div>
            </div>
            {page.socialProofActive && (
              <div className="mt-4 bg-white rounded-xl p-4 border border-indigo-100">
                <label className="block text-xs font-bold text-gray-600 mb-1">أسماء المشترين (افصل بينها بفاصلة)</label>
                <textarea rows={3} value={page.socialProofMessages || ""} onChange={e => setPage({...page, socialProofMessages: e.target.value})}
                  placeholder="أمين من وهران, سارة من الجزائر, رياض من قسنطينة"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-y" />
                <p className="text-xs text-gray-400 mt-2 mb-3">ستظهر إشعارات على شكل: "أمين من وهران اشترى هذا المنتج للتو".</p>

                <label className="block text-xs font-bold text-gray-600 mb-1">لون الإشعارات 🎨</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={page.socialProofColor || "#e0e7ff"} onChange={e => setPage({...page, socialProofColor: e.target.value})}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={page.socialProofColor || "#e0e7ff"} onChange={e => setPage({...page, socialProofColor: e.target.value})}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none font-mono" dir="ltr" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: SECTIONS ORDER ── */}
      {tab === "sections" && (() => {
        // ALL available sections
        const ALL_SECTIONS = [
          { key: "hero",         label: "🏠 الهيدر (Hero)",           locked: false },
          { key: "benefits",     label: "✨ الفوائد",                  locked: false },
          { key: "ingredients",  label: "🌿 المكونات",                 locked: false },
          { key: "usage",        label: "📋 طريقة الاستخدام",          locked: false },
          { key: "videos",       label: "🎬 الفيديوهات",              locked: false },
          { key: "testimonials", label: "💬 آراء العملاء",            locked: false },
          { key: "faq",          label: "❓ الأسئلة الشائعة",         locked: false },
          { key: "order",        label: "📦 نموذج الطلب",             locked: false },
        ];

        // Normalize sectionsOrder to objects {key, visible}
        const rawOrder: any[] = page.sectionsOrder || [];
        const normalizedOrder: { key: string; visible: boolean }[] = rawOrder.map((s: any) =>
          typeof s === "string" ? { key: s, visible: true } : s
        );

        // Merge: all sections in order, unordered ones appended at end hidden
        const orderedKeys = normalizedOrder.map((s: any) => s.key);
        const missing = ALL_SECTIONS.filter(s => !orderedKeys.includes(s.key));
        const fullOrder: { key: string; visible: boolean }[] = [
          ...normalizedOrder,
          ...missing.map(s => ({ key: s.key, visible: false })),
        ];

        const setFullOrder = (updated: { key: string; visible: boolean }[]) => {
          setPage({ ...page, sectionsOrder: updated });
        };

        const toggleVisible = (key: string) => {
          setFullOrder(fullOrder.map(s => s.key === key ? { ...s, visible: !s.visible } : s));
        };

        const moveUp = (i: number) => {
          if (i === 0) return;
          const arr = [...fullOrder];
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
          setFullOrder(arr);
        };

        const moveDown = (i: number) => {
          if (i === fullOrder.length - 1) return;
          const arr = [...fullOrder];
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          setFullOrder(arr);
        };

        return (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-5">
              رتّب الأقسام بالأسهم ▲▼ وفعّل أو أخفِ كل قسم بالمفتاح.
            </p>
            <div className="space-y-2">
              {fullOrder.map((section, i) => {
                const meta = ALL_SECTIONS.find(s => s.key === section.key);
                const label = meta?.label || section.key;
                const isLocked = meta?.locked ?? false;
                return (
                  <div key={section.key}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                      section.visible
                        ? "border-gray-200 bg-white"
                        : "border-dashed border-gray-200 bg-gray-50 opacity-60"
                    }`}>
                    {/* Move buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={() => moveUp(i)} disabled={i === 0}
                        className="w-6 h-6 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center disabled:opacity-20 text-xs transition-all">
                        ▲
                      </button>
                      <button onClick={() => moveDown(i)} disabled={i === fullOrder.length - 1}
                        className="w-6 h-6 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center disabled:opacity-20 text-xs transition-all">
                        ▼
                      </button>
                    </div>

                    {/* Rank */}
                    <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">
                      {i + 1}
                    </span>

                    {/* Label */}
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${section.visible ? "text-gray-800" : "text-gray-400"}`}>
                        {label}
                      </p>
                      {!section.visible && (
                        <p className="text-xs text-gray-400">مخفي — لن يظهر في الصفحة</p>
                      )}
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleVisible(section.key)}
                      disabled={isLocked}
                      title={isLocked ? "لا يمكن إخفاء هذا القسم" : section.visible ? "إخفاء القسم" : "إظهار القسم"}
                      className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${
                        isLocked ? "opacity-40 cursor-not-allowed" :
                        section.visible ? "bg-primary cursor-pointer" : "bg-gray-300 cursor-pointer"
                      }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        section.visible ? "left-6" : "left-1"
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              الترتيب يُحفظ تلقائياً عند الضغط على زر "حفظ التغييرات" في الأعلى
            </p>
          </div>
        );
      })()}

      {/* ── TAB: THEME ── */}
      {tab === "theme" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div>
            <h3 className="font-black text-gray-800 text-lg mb-2 flex items-center gap-2">
              🎨 الألوان والتصميم
            </h3>
            <p className="text-sm text-gray-500 mb-6">خصص ألوان صفحة الهبوط لتتماشى مع منتجك بدقة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">اللون الرئيسي 🎨</label>
              <p className="text-xs text-gray-500 mb-3">سيستخدم في أزرار الشراء، الأيقونات، الإطارات، والتأثيرات.</p>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={page.primaryColor || "#f97316"} 
                  onChange={e => setPage({...page, primaryColor: e.target.value})}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  value={page.primaryColor || "#f97316"}
                  onChange={e => setPage({...page, primaryColor: e.target.value})}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">لون الخلفية 🖼️</label>
              <p className="text-xs text-gray-500 mb-3">سيستخدم كخلفية للقسم العلوي (Hero) والأقسام البارزة.</p>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={page.backgroundColor || "#FFF8F2"} 
                  onChange={e => setPage({...page, backgroundColor: e.target.value})}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  value={page.backgroundColor || "#FFF8F2"}
                  onChange={e => setPage({...page, backgroundColor: e.target.value})}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">لون النصوص 📝</label>
              <p className="text-xs text-gray-500 mb-3">سيستخدم للون العناوين الرئيسية.</p>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={page.textColor || "#1a1208"} 
                  onChange={e => setPage({...page, textColor: e.target.value})}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  value={page.textColor || "#1a1208"}
                  onChange={e => setPage({...page, textColor: e.target.value})}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-6 rounded-2xl border border-gray-200" style={{ backgroundColor: page.backgroundColor || "#FFF8F2" }}>
            <h4 className="text-sm font-bold mb-4 text-center text-gray-500">معاينة حية للألوان</h4>
            <div className="text-center">
              <h2 className="text-2xl font-black mb-4" style={{ color: page.textColor || "#1a1208" }}>
                العنوان الرئيسي سيكون بهذا اللون
              </h2>
              <button 
                className="px-8 py-3 rounded-xl font-bold text-white shadow-lg"
                style={{ backgroundColor: page.primaryColor || "#f97316" }}
              >
                اطلب المنتج الآن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
