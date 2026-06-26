import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId, action } = await req.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "REORDERED") {
      // Create a duplicate order
      const newOrder = await prisma.order.create({
        data: {
          fullName: order.fullName,
          phone: order.phone,
          wilaya: order.wilaya,
          baladiya: order.baladiya,
          status: "جديد",
          offerId: order.offerId,
          offerLabel: order.offerLabel,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          deliveryPrice: order.deliveryPrice,
          productCost: order.productCost,
          totalPrice: order.totalPrice,
          pageSlug: order.pageSlug,
          notes: (order.notes ? order.notes + "\n" : "") + "[Refill - إعادة طلب من الزبون]",
          // Don't copy delivery integrations or performance tracking
        },
      });

      // Update original order
      await prisma.order.update({
        where: { id: orderId },
        data: { refillStatus: "REORDERED" },
      });

      return NextResponse.json({ success: true, newOrder });
    } else {
      // Update refill status
      await prisma.order.update({
        where: { id: orderId },
        data: { refillStatus: action }, // NOT_INTERESTED, CALL_LATER
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Refills API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
