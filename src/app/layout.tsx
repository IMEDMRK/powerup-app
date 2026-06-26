import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import Pixels from "@/components/Pixels";

export const metadata: Metadata = {
  title: "POWER UP | لزيادة الوزن وفتح الشهية والطاقة",
  description: "المكمل الغذائي الطبيعي 100% الأول في الجزائر لزيادة الوزن، فتح الشهية، وزيادة الطاقة بشكل طبيعي وآمن.",
  openGraph: {
    title: "POWER UP | المكمل الغذائي الطبيعي لزيادة الوزن",
    description: "احصل على طاقة متجددة ووزن مثالي معPOWER UP - مكمل طبيعي 100%. اطلبه الآن في الجزائر.",
    type: "website",
    locale: "ar_DZ",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    settings = await prisma.settings.findUnique({ where: { id: "default" } });
  } catch(e) {}

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth antialiased h-full">
      <head>
        <Pixels settings={settings} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
