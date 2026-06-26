import Link from "next/link";
import { TableProperties, ChevronLeft, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const metadata = { title: "التطبيقات والربط" };

export default async function AppsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const appsConfig = (settings?.appsConfig as any) || {};

  const googleSheetsActive = appsConfig?.googleSheets?.active === true;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-800 mb-2">التطبيقات والربط 🧩</h1>
        <p className="text-gray-500">قم بربط متجرك مع التطبيقات والخدمات الخارجية لتسهيل عملك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Sheets App Card */}
        <Link 
          href="/admin/apps/google-sheets" 
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col h-full"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
              <TableProperties size={28} className="text-green-600" />
            </div>
            {googleSheetsActive ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                <CheckCircle2 size={14} />
                متصل
              </span>
            ) : (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                غير متصل
              </span>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
            Google Sheets
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
            قم بمزامنة الطلبيات الجديدة تلقائياً وبشكل فوري إلى جدول بيانات جوجل (Google Sheets) لتسهيل إدارتها.
          </p>
          
          <div className="flex items-center text-sm font-bold text-primary gap-1">
            <span>إعداد التطبيق</span>
            <ChevronLeft size={16} />
          </div>
        </Link>
      </div>
    </div>
  );
}
