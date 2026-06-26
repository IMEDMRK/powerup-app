import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  let settings: any = null;
  let needsMigration = false;
  try {
    settings = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: "default" } });
    }
  } catch (err) {
    console.error("Database not migrated yet:", err);
    settings = { id: "default" }; // fallback so the page loads the migration button
    needsMigration = true;
  }

    async function updateSettings(formData: FormData) {
      "use server";
      
      const deliveryConfig = [
        {
          id: "yalidine",
          name: "Yalidine Express",
          type: "YALIDINE",
          apiKey: formData.get("yalidineApiKey") as string,
          apiToken: formData.get("yalidineApiToken") as string,
          isActive: formData.get("yalidineActive") === "on"
        },
        {
          id: "ecotrack",
          name: "ZR Express / EcoTrack",
          type: "ECOTRACK",
          baseUrl: formData.get("ecotrackBaseUrl") as string,
          apiToken: formData.get("ecotrackApiToken") as string,
          isActive: formData.get("ecotrackActive") === "on"
        }
      ];

      const newAdminUser = formData.get("adminUsername") as string;
      const newAdminPass = formData.get("adminPassword") as string;
      
      let adminPasswordHash = undefined;
      if (newAdminPass && newAdminPass.trim().length > 0) {
         const bcrypt = require("bcryptjs");
         adminPasswordHash = await bcrypt.hash(newAdminPass, 10);
      }

      await prisma.settings.update({
        where: { id: "default" },
        data: {
          metaPixelId: formData.get("metaPixelId") as string,
          metaAccessToken: formData.get("metaAccessToken") as string,
          tiktokPixelId: formData.get("tiktokPixelId") as string,
          googleAnalyticsId: formData.get("googleAnalyticsId") as string,
          deliveryConfig,
          ...(newAdminUser ? { adminUsername: newAdminUser } : {}),
          ...(adminPasswordHash ? { adminPasswordHash } : {}),
        }
      });
  
      revalidatePath("/admin/settings");
      revalidatePath("/"); // Update landing page if it caches pixels
    }

    const deliveryConfig: any[] = (settings.deliveryConfig as any[]) || [];
    const yalidine = deliveryConfig.find((c) => c.id === "yalidine") || {};
    const ecotrack = deliveryConfig.find((c) => c.id === "ecotrack") || {};
  
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tracking Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات التتبع والبيكسل</h2>
          <form action={updateSettings} id="settings-form" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-600 border-b pb-2">Meta (Facebook)</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Meta Pixel IDs <span className="text-xs text-gray-400 font-normal">(يمكنك وضع أكثر من واحد مفصولين بفاصلة)</span></label>
                <input name="metaPixelId" defaultValue={settings.metaPixelId || ""} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" placeholder="e.g. 1234567890, 0987654321" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meta Conversion API Access Token</label>
                <input name="metaAccessToken" defaultValue={settings.metaAccessToken || ""} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" placeholder="EAAB..." />
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-black border-b pb-2">TikTok</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">TikTok Pixel IDs <span className="text-xs text-gray-400 font-normal">(يمكنك وضع أكثر من واحد مفصولين بفاصلة)</span></label>
                <input name="tiktokPixelId" defaultValue={settings.tiktokPixelId || ""} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" placeholder="e.g. C1234567, C7654321" />
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-orange-600 border-b pb-2">Google</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Google Analytics 4 Measurement ID</label>
                <input name="googleAnalyticsId" defaultValue={settings.googleAnalyticsId || ""} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" placeholder="G-XXXXXXX" />
              </div>
            </div>
          </form>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات شركات التوصيل 🚚</h2>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800">Yalidine Express</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input form="settings-form" type="checkbox" name="yalidineActive" defaultChecked={yalidine.isActive} className="w-5 h-5 accent-primary" />
                  <span className="text-sm font-bold">تفعيل</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">API ID</label>
                <input form="settings-form" name="yalidineApiKey" defaultValue={yalidine.apiKey || ""} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">API Token</label>
                <input form="settings-form" name="yalidineApiToken" defaultValue={yalidine.apiToken || ""} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800">ZR Express / EcoTrack</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input form="settings-form" type="checkbox" name="ecotrackActive" defaultChecked={ecotrack.isActive} className="w-5 h-5 accent-primary" />
                  <span className="text-sm font-bold">تفعيل</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Base URL (رابط المنصة)</label>
                <input form="settings-form" name="ecotrackBaseUrl" defaultValue={ecotrack.baseUrl || ""} type="url" placeholder="https://zrexpress.ecotrack.dz" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">API Token (Bearer)</label>
                <input form="settings-form" name="ecotrackApiToken" defaultValue={ecotrack.apiToken || ""} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">إعدادات حساب الإدارة (الداشبورد) 🔐</h2>
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              لتغيير اسم المستخدم وكلمة المرور الخاصة بالمدير الرئيسي (Master Admin).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم الجديد</label>
                <input form="settings-form" name="adminUsername" defaultValue={settings.adminUsername || "Medpoweruo"} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الجديدة (اتركها فارغة لعدم التغيير)</label>
                <input form="settings-form" name="adminPassword" type="password" placeholder="********" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" dir="ltr" />
              </div>
            </div>
            
            <div className="pt-6 border-t mt-4">
              <button form="settings-form" type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all">
                حفظ جميع الإعدادات
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }
