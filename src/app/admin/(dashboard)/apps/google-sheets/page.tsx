import { prisma } from "@/lib/prisma";
import GoogleSheetsForm from "./GoogleSheetsForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';
export const metadata = { title: "ربط Google Sheets" };

export default async function GoogleSheetsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const appsConfig = (settings?.appsConfig as any) || {};
  const googleSheetsConfig = appsConfig?.googleSheets || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/apps" className="hover:text-primary transition-colors">التطبيقات والربط</Link>
        <ChevronRight size={14} />
        <span className="font-bold text-gray-800">Google Sheets</span>
      </div>

      <div>
        <h1 className="text-3xl font-black text-gray-800 mb-2">Google Sheets 📊</h1>
        <p className="text-gray-500">أرسل الطلبيات الجديدة مباشرة إلى جدول بيانات جوجل لتسهيل تتبع المبيعات.</p>
      </div>

      <GoogleSheetsForm initialConfig={googleSheetsConfig} />
    </div>
  );
}
