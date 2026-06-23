"use client";
import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function DynamicSectionsEditor({ page, setPage }: { page: any, setPage: any }) {

  // Generic helper to update a specific JSON array field
  const updateJson = (field: string, newArr: any[]) => {
    setPage({ ...page, [field]: JSON.stringify(newArr) });
  };

  const getArray = (field: string, defaultArr: any[]) => {
    if (!page[field]) return defaultArr;
    try {
      const parsed = JSON.parse(page[field]);
      return Array.isArray(parsed) ? parsed : defaultArr;
    } catch {
      return defaultArr;
    }
  };

  // --- BENEFITS ---
  const benefits = getArray("benefitsJson", []);
  const addBenefit = () => updateJson("benefitsJson", [...benefits, { emoji: "✨", title: "فائدة جديدة", description: "وصف الفائدة..." }]);
  const updateBenefit = (i: number, key: string, val: string) => {
    const arr = [...benefits];
    arr[i] = { ...arr[i], [key]: val };
    updateJson("benefitsJson", arr);
  };
  const removeBenefit = (i: number) => updateJson("benefitsJson", benefits.filter((_: any, idx: number) => idx !== i));

  // --- INGREDIENTS ---
  const ingredients = getArray("ingredientsJson", []);
  const addIngredient = () => updateJson("ingredientsJson", [...ingredients, { emoji: "🌿", name: "مكون جديد", benefit: "فائدة المكون..." }]);
  const updateIngredient = (i: number, key: string, val: string) => {
    const arr = [...ingredients];
    arr[i] = { ...arr[i], [key]: val };
    updateJson("ingredientsJson", arr);
  };
  const removeIngredient = (i: number) => updateJson("ingredientsJson", ingredients.filter((_: any, idx: number) => idx !== i));

  // --- USAGE ---
  const usage = getArray("usageJson", []);
  const addUsage = () => updateJson("usageJson", [...usage, { title: "خطوة جديدة", description: "وصف الخطوة..." }]);
  const updateUsage = (i: number, key: string, val: string) => {
    const arr = [...usage];
    arr[i] = { ...arr[i], [key]: val };
    updateJson("usageJson", arr);
  };
  const removeUsage = (i: number) => updateJson("usageJson", usage.filter((_: any, idx: number) => idx !== i));

  // --- FAQ ---
  const faq = getArray("faqJson", []);
  const addFaq = () => updateJson("faqJson", [...faq, { q: "سؤال جديد؟", a: "جواب..." }]);
  const updateFaq = (i: number, key: string, val: string) => {
    const arr = [...faq];
    arr[i] = { ...arr[i], [key]: val };
    updateJson("faqJson", arr);
  };
  const removeFaq = (i: number) => updateJson("faqJson", faq.filter((_: any, idx: number) => idx !== i));

  // --- TESTIMONIALS ---
  const testimonials = getArray("testimonialsJson", []);
  const addTestimonial = () => updateJson("testimonialsJson", [...testimonials, { name: "اسم الزبون", text: "رأي الزبون في المنتج...", rating: 5, wilaya: "الولاية" }]);
  const updateTestimonial = (i: number, key: string, val: any) => {
    const arr = [...testimonials];
    arr[i] = { ...arr[i], [key]: val };
    updateJson("testimonialsJson", arr);
  };
  const removeTestimonial = (i: number) => updateJson("testimonialsJson", testimonials.filter((_: any, idx: number) => idx !== i));


  return (
    <div className="space-y-12">
      
      {/* BENEFITS */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">✨ الفوائد (Benefits)</h2>
          <button onClick={addBenefit} className="flex items-center gap-1 text-sm bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200">
            <Plus size={16} /> إضافة فائدة
          </button>
        </div>
        <div className="space-y-4">
          {benefits.map((b: any, i: number) => (
            <div key={i} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
              <input value={b.emoji || ""} onChange={e => updateBenefit(i, "emoji", e.target.value)} className="w-12 h-12 text-center text-xl border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary" placeholder="✨" />
              <div className="flex-1 space-y-2">
                <input value={b.title || ""} onChange={e => updateBenefit(i, "title", e.target.value)} className="w-full font-bold border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="عنوان الفائدة" />
                <textarea value={b.description || ""} onChange={e => updateBenefit(i, "description", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="وصف مقتضب للفائدة..." />
              </div>
              <button onClick={() => removeBenefit(i)} className="text-red-400 hover:text-red-600 mt-2"><Trash2 size={18} /></button>
            </div>
          ))}
          {benefits.length === 0 && <p className="text-sm text-gray-400 text-center py-4">سيتم استخدام فوائد PowerUp الافتراضية إذا تركته فارغاً.</p>}
        </div>
      </section>

      {/* INGREDIENTS */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">🌿 المكونات (Ingredients)</h2>
          <button onClick={addIngredient} className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">
            <Plus size={16} /> إضافة مكون
          </button>
        </div>
        <div className="space-y-4">
          {ingredients.map((ing: any, i: number) => (
            <div key={i} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
              <input value={ing.emoji || ""} onChange={e => updateIngredient(i, "emoji", e.target.value)} className="w-12 h-12 text-center text-xl border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary" placeholder="🌿" />
              <div className="flex-1 space-y-2">
                <input value={ing.name || ""} onChange={e => updateIngredient(i, "name", e.target.value)} className="w-full font-bold border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="اسم المكون" />
                <textarea value={ing.benefit || ""} onChange={e => updateIngredient(i, "benefit", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="كيف يفيد هذا المكون..." />
              </div>
              <button onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600 mt-2"><Trash2 size={18} /></button>
            </div>
          ))}
          {ingredients.length === 0 && <p className="text-sm text-gray-400 text-center py-4">سيتم استخدام مكونات PowerUp الافتراضية إذا تركته فارغاً.</p>}
        </div>
      </section>

      {/* USAGE */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">📋 طريقة الاستخدام (Usage)</h2>
          <button onClick={addUsage} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">
            <Plus size={16} /> إضافة خطوة
          </button>
        </div>
        <div className="space-y-4">
          {usage.map((u: any, i: number) => (
            <div key={i} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white font-black rounded-lg text-xl">{i + 1}</div>
              <div className="flex-1 space-y-2">
                <input value={u.title || ""} onChange={e => updateUsage(i, "title", e.target.value)} className="w-full font-bold border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="عنوان الخطوة (مثلاً: ملعقة واحدة)" />
                <textarea value={u.description || ""} onChange={e => updateUsage(i, "description", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="تفاصيل الخطوة..." />
              </div>
              <button onClick={() => removeUsage(i)} className="text-red-400 hover:text-red-600 mt-2"><Trash2 size={18} /></button>
            </div>
          ))}
          {usage.length === 0 && <p className="text-sm text-gray-400 text-center py-4">سيتم استخدام الاستخدام الافتراضي لـ PowerUp إذا تركته فارغاً.</p>}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">💬 آراء العملاء (Testimonials)</h2>
          <button onClick={addTestimonial} className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200">
            <Plus size={16} /> إضافة رأي
          </button>
        </div>
        <div className="space-y-4">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
              <div className="flex gap-3">
                <input value={t.name || ""} onChange={e => updateTestimonial(i, "name", e.target.value)} className="flex-1 font-bold border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="اسم الزبون" />
                <input value={t.wilaya || ""} onChange={e => updateTestimonial(i, "wilaya", e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="الولاية (مثال: الجزائر العاصمة)" />
                <input type="number" min={1} max={5} value={t.rating || 5} onChange={e => updateTestimonial(i, "rating", parseInt(e.target.value))} className="w-20 text-center border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="التقييم 1-5" />
                <button onClick={() => removeTestimonial(i)} className="text-red-400 hover:text-red-600 px-2"><Trash2 size={18} /></button>
              </div>
              <textarea value={t.text || ""} onChange={e => updateTestimonial(i, "text", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="ماذا قال الزبون عن المنتج..." />
            </div>
          ))}
          {testimonials.length === 0 && <p className="text-sm text-gray-400 text-center py-4">سيتم استخدام الآراء الافتراضية إذا تركته فارغاً.</p>}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">❓ الأسئلة الشائعة (FAQ)</h2>
          <button onClick={addFaq} className="flex items-center gap-1 text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300">
            <Plus size={16} /> إضافة سؤال
          </button>
        </div>
        <div className="space-y-4">
          {faq.map((f: any, i: number) => (
            <div key={i} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
              <div className="flex-1 space-y-2">
                <input value={f.q || ""} onChange={e => updateFaq(i, "q", e.target.value)} className="w-full font-bold border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="السؤال؟" />
                <textarea value={f.a || ""} onChange={e => updateFaq(i, "a", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="الجواب بالتفصيل..." />
              </div>
              <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-600 mt-2"><Trash2 size={18} /></button>
            </div>
          ))}
          {faq.length === 0 && <p className="text-sm text-gray-400 text-center py-4">سيتم استخدام أسئلة PowerUp الافتراضية إذا تركته فارغاً.</p>}
        </div>
      </section>

      {/* ORDER SECTION DETAILS */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📦 تفاصيل صندوق الطلب (Order Section)</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نص التوصيل</label>
              <input value={page.orderBoxDeliveryText || ""} onChange={e => setPage({...page, orderBoxDeliveryText: e.target.value})} placeholder="حتى باب المنزل 🚚" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نص الدفع</label>
              <input value={page.orderBoxPaymentText || ""} onChange={e => setPage({...page, orderBoxPaymentText: e.target.value})} placeholder="عند الاستلام 💵" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">قائمة ميزات الطلب</h3>
              <button onClick={() => updateJson("orderFeaturesJson", [...getArray("orderFeaturesJson", ["جودة مضمونة 100%", "الدفع عند الاستلام", "توصيل سريع لـ 69 ولاية"]), "ميزة جديدة"])} className="flex items-center gap-1 text-sm bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200">
                <Plus size={16} /> إضافة ميزة
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              {getArray("orderFeaturesJson", ["جودة مضمونة 100%", "الدفع عند الاستلام", "توصيل سريع لـ 69 ولاية"]).map((feat: string, i: number) => (
                <div key={i} className="flex gap-3">
                  <input value={feat} onChange={e => {
                    const arr = [...getArray("orderFeaturesJson", ["جودة مضمونة 100%", "الدفع عند الاستلام", "توصيل سريع لـ 69 ولاية"])];
                    arr[i] = e.target.value;
                    updateJson("orderFeaturesJson", arr);
                  }} className="flex-1 font-bold border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  <button onClick={() => {
                    const arr = [...getArray("orderFeaturesJson", ["جودة مضمونة 100%", "الدفع عند الاستلام", "توصيل سريع لـ 69 ولاية"])];
                    arr.splice(i, 1);
                    updateJson("orderFeaturesJson", arr);
                  }} className="text-red-400 hover:text-red-600 px-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">محاذاة الميزات (Alignment)</label>
                <select value={page.orderFeaturesTextAlign || "right"} onChange={e => setPage({...page, orderFeaturesTextAlign: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option value="right">يمين</option>
                  <option value="center">وسط</option>
                  <option value="left">يسار</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">حجم خط الميزات (Font Size)</label>
                <select value={page.orderFeaturesFontSize || "lg"} onChange={e => setPage({...page, orderFeaturesFontSize: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option value="sm">صغير (Small)</option>
                  <option value="base">متوسط (Medium)</option>
                  <option value="lg">كبير (Large)</option>
                  <option value="xl">كبير جداً (X-Large)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
