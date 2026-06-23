import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createParcel, DeliveryProviderConfig, ParcelData } from "@/lib/delivery";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderIds, providerId } = await req.json();
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !providerId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const deliveryConfig = (settings?.deliveryConfig as unknown as DeliveryProviderConfig[]) || [];
    const provider = deliveryConfig.find(p => p.id === providerId);

    if (!provider || !provider.isActive) {
      return NextResponse.json({ error: "Delivery provider not found or inactive" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds }, trackingId: null } // only send orders that haven't been sent
    });

    let success = 0;
    let failed = 0;

    for (const order of orders) {
      try {
        const parcelData: ParcelData = {
          orderId: order.id,
          fullName: order.fullName,
          phone: order.phone,
          wilayaName: order.wilaya,
          baladiyaName: order.baladiya,
          totalPrice: order.totalPrice,
          deliveryPrice: order.deliveryPrice || 0,
          productName: order.offerLabel || "Product",
          quantity: order.quantity,
          notes: order.notes || undefined
        };

        const result = await createParcel(provider, parcelData);

        // Update order in DB
        await prisma.order.update({
          where: { id: order.id },
          data: {
            deliveryProvider: provider.name,
            trackingId: result.trackingId,
            bordereauUrl: result.bordereauUrl,
            status: "مُرسلة" // Or something similar, but let's keep it "مؤكدة" or whatever it is, and trackingId handles it
          }
        });
        success++;
      } catch (err) {
        console.error(`Error creating parcel for order ${order.id}:`, err);
        failed++;
      }
    }

    return NextResponse.json({ results: { success, failed } });
  } catch (error: any) {
    console.error("Bulk send error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
