import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appendToSheet } from "@/lib/googleSheets";
import { z } from "zod";

const OrderSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),
  wilaya: z.string().min(2).max(50),
  baladiya: z.string().min(2).max(100),
  offerId: z.string().max(50).optional().nullable(),
  offerLabel: z.string().max(100).optional().nullable(),
  quantity: z.number().int().min(1).max(100).default(1),
  unitPrice: z.number().min(0).default(0),
  deliveryPrice: z.number().min(0).optional().nullable(),
  totalPrice: z.number().min(0).optional().nullable(),
  pageSlug: z.string().max(50).optional().nullable(),
  utmSource: z.string().max(200).optional().nullable(),
  utmMedium: z.string().max(200).optional().nullable(),
  utmCampaign: z.string().max(200).optional().nullable(),
  utmContent: z.string().max(200).optional().nullable(),
  utmTerm: z.string().max(200).optional().nullable(),
  fbclid: z.string().max(200).optional().nullable(),
  ttclid: z.string().max(200).optional().nullable(),
  draftOrderId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    // 1. IP-based Rate Limiting (Database backed for Serverless reliability)
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    if (ip !== "unknown") {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentOrdersCount = await prisma.order.count({
        where: {
          ip,
          createdAt: { gte: tenMinutesAgo }
        }
      });
      
      if (recentOrdersCount >= 5) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
    }

    // 2. Read and Validate Payload Size
    const bodyText = await request.text();
    if (bodyText.length > 5000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // 3. Strict Input Validation with Zod
    const validationResult = OrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid data format", details: validationResult.error.format() }, { status: 400 });
    }
    const validatedData = validationResult.data;

    let finalDeliveryPrice = validatedData.deliveryPrice || 0;
    
    // Check if offer has free shipping
    let isFreeShipping = false;
    if (validatedData.offerId) {
      const offer = await prisma.offer.findUnique({ where: { id: validatedData.offerId } });
      if (offer && offer.freeShipping) {
        isFreeShipping = true;
        finalDeliveryPrice = 0;
      }
    }

    // Auto-calculate delivery price if missing or 0, and not free shipping
    if (finalDeliveryPrice === 0 && validatedData.wilaya && !isFreeShipping) {
      const wMatch = await prisma.wilayaDelivery.findFirst({
        where: { wilayaName: validatedData.wilaya }
      });
      if (wMatch) {
        finalDeliveryPrice = wMatch.deliveryPrice;
      }
    }

    let finalTotalPrice = validatedData.totalPrice || 0;
    if (finalTotalPrice === 0 || finalTotalPrice === validatedData.unitPrice) {
      finalTotalPrice = validatedData.unitPrice + finalDeliveryPrice;
    }

    const orderData = {
      fullName: validatedData.fullName,
      phone: validatedData.phone,
      wilaya: validatedData.wilaya,
      baladiya: validatedData.baladiya,
      status: "جديد",
      offerId: validatedData.offerId,
      offerLabel: validatedData.offerLabel,
      quantity: validatedData.quantity,
      initialQuantity: validatedData.quantity,
      unitPrice: validatedData.unitPrice,
      deliveryPrice: finalDeliveryPrice,
      totalPrice: finalTotalPrice,
      pageSlug: validatedData.pageSlug,
      utmSource: validatedData.utmSource,
      utmMedium: validatedData.utmMedium,
      utmCampaign: validatedData.utmCampaign,
      utmContent: validatedData.utmContent,
      utmTerm: validatedData.utmTerm,
      fbclid: validatedData.fbclid,
      ttclid: validatedData.ttclid,
      ip: ip !== "unknown" ? ip : null,
    };

    let orderToUpdateId = validatedData.draftOrderId ? String(validatedData.draftOrderId) : null;

    if (!orderToUpdateId) {
      // Search for a recent abandoned order by phone
      const existingDraft = await prisma.order.findFirst({
        where: {
          phone: orderData.phone,
          status: "غير مكتملة",
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // last 60 mins
        },
        orderBy: { createdAt: 'desc' }
      });
      if (existingDraft) orderToUpdateId = existingDraft.id;
    }

    // --- Round Robin Assignment ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeAgents = await prisma.user.findMany({
      where: { role: 'AGENT', isActive: true },
      include: {
        _count: {
          select: {
            ordersAssigned: {
              where: { createdAt: { gte: today } }
            }
          }
        }
      }
    });

    let assignedToId = null;
    if (activeAgents.length > 0) {
      activeAgents.sort((a, b) => a._count.ordersAssigned - b._count.ordersAssigned);
      assignedToId = activeAgents[0].id;
    }

    let order = null;

    if (orderToUpdateId) {
      // Try to update
      order = await prisma.order.update({
        where: { id: orderToUpdateId },
        data: {
          ...orderData,
          assignedToId
        },
      }).catch(() => null);
    }

    if (!order) {
      // Fallback to create
      order = await prisma.order.create({
        data: {
          ...orderData,
          assignedToId
        },
      });
    }

    // --- Create Notification ---
    try {
      await prisma.notification.create({
        data: {
          title: "طلبية جديدة 📦",
          message: `تم استلام طلبية جديدة من ${order.wilaya} بقيمة ${order.totalPrice} دج`,
          type: "ORDER",
          isAdmin: true,
          userId: assignedToId, // also notify the assigned agent
          link: `/admin/orders`
        }
      });
    } catch (e) {
      console.error("Failed to create notification", e);
    }

    try { await appendToSheet(order); } catch (e) { console.error("Google Sheets Sync Failed:", e); }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
