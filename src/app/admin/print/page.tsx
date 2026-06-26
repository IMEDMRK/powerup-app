import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import PrintClient from "./PrintClient";

export const dynamic = 'force-dynamic';

export default async function PrintPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const idsParam = params.ids || "";
  const ids = idsParam.split(",").filter(Boolean);

  if (ids.length === 0) {
    return <div className="p-10 text-center font-bold text-xl" dir="rtl">لم يتم تحديد أي طلبيات للطباعة.</div>;
  }

  const orders = await prisma.order.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: "desc" }
  });

  const wilayas = await prisma.wilayaDelivery.findMany({
    select: { wilayaName: true, deliveryPrice: true }
  });

  const offers = await prisma.offer.findMany({
    select: { id: true, label: true, freeShipping: true }
  });

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const storeName = "متجرنا";

  // Process orders to calculate final total
  const processedOrders = orders.map((order: any) => {
    const isFreeShipping = offers.find(o => o.id === order.offerId || o.label === order.offerLabel)?.freeShipping;
    let dPrice = isFreeShipping ? 0 : order.deliveryPrice || 0;
    
    if (!isFreeShipping) {
      const wMatch = wilayas.find(w => w.wilayaName === order.wilaya);
      if (wMatch) {
        dPrice = wMatch.deliveryPrice;
      }
    }
    const finalTotal = (order.unitPrice || 0) + dPrice;

    return {
      ...order,
      finalTotal,
      isFreeShipping
    };
  });

  return (
    <div className="bg-gray-100 min-h-screen text-black" dir="rtl">
      <PrintClient orders={processedOrders} storeName={storeName} />
    </div>
  );
}
