"use client";
import { useEffect, useState } from "react";
import { Save, ToggleLeft, ToggleRight, Search } from "lucide-react";
import wilayas from "@/data/wilayas.json";

export default function WilayasPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/wilayas")
      .then(r => r.json())
      .then(data => {
        // Ensure all 58 wilayas appear
        const map: Record<number, any> = {};
        data.forEach((d: any) => { map[d.wilayaCode] = d; });
        const all = (wilayas as any[]).map(w => map[w.code] || {
          wilayaCode: w.code, wilayaName: w.name_ar, deliveryPrice: 400,
          isEnabled: true, estimatedDays: "24-48 ساعة",
        });
        setRows(all);
      });
  }, []);

  const update = (code: number, field: string, val: any) => {
    setRows(prev => prev.map(r => r.wilayaCode === code ? { ...r, [field]: val } : r));
  };

  const toggleAll = (enabled: boolean) => {
    setRows(prev => prev.map(r => ({ ...r, isEnabled: enabled })));
  };

  const setAllPrice = (price: number) => {
    setRows(prev => prev.map(r => ({ ...r, deliveryPrice: price })));
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/wilayas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filtered = rows.filter(r =>
    r.wilayaName.includes(search) ||
    String(r.wilayaCode).includes(search)
  );

  const enabledCount = rows.filter(r => r.isEnabled).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🗺️ إدارة الولايات والتوصيل</h1>
          <p className="text-gray-500 text-sm mt-1">
            {enabledCount} من {rows.length} ولاية مفعّلة
          </p>
        </div>
        <button onClick={save} disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary-dark"} disabled:opacity-60`}>
          <Save size={16} />
          {saved ? "✓ تم الحفظ!" : saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-gray-600">إجراءات سريعة:</span>
        <button onClick={() => toggleAll(true)} className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
          تفعيل الكل
        </button>
        <button onClick={() => toggleAll(false)} className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          تعطيل الكل
        </button>
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-xs text-gray-500">ضبط سعر موحّد:</span>
          {[300, 400, 500, 600].map(p => (
            <button key={p} onClick={() => setAllPrice(p)}
              className="text-xs bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg hover:bg-orange-200 transition-colors">
              {p} دج
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن ولاية..."
          className="w-full border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-right px-4 py-3 font-bold text-gray-600 w-12">#</th>
              <th className="text-right px-4 py-3 font-bold text-gray-600">الولاية</th>
              <th className="text-right px-4 py-3 font-bold text-gray-600">سعر التوصيل (دج)</th>
              <th className="text-right px-4 py-3 font-bold text-gray-600">مدة التوصيل</th>
              <th className="text-center px-4 py-3 font-bold text-gray-600">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.wilayaCode} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${!row.isEnabled ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{row.wilayaCode}</td>
                <td className="px-4 py-3 font-bold text-gray-800">{row.wilayaName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <input type="number" min={0} value={row.deliveryPrice}
                      onChange={e => update(row.wilayaCode, "deliveryPrice", parseInt(e.target.value) || 0)}
                      className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none text-center font-bold" />
                    <span className="text-gray-400 text-xs">دج</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select value={row.estimatedDays}
                    onChange={e => update(row.wilayaCode, "estimatedDays", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none">
                    <option>24-48 ساعة</option>
                    <option>48-72 ساعة</option>
                    <option>3-5 أيام</option>
                    <option>5-7 أيام</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => update(row.wilayaCode, "isEnabled", !row.isEnabled)}
                    className={`transition-colors ${row.isEnabled ? "text-green-500 hover:text-green-700" : "text-gray-300 hover:text-gray-500"}`}>
                    {row.isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
