import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appendToSheet } from "@/lib/googleSheets";

// Simple in-memory rate limiter (per container)
const rateLimit = new Map<string, { count: number; lastTime: number }>();

export async function POST(request: Request) {
  try {
    // 1. IP-based Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const maxRequests = 5;

    const userLimit = rateLimit.get(ip) || { count: 0, lastTime: now };
    if (now - userLimit.lastTime > windowMs) {
      userLimit.count = 0;
      userLimit.lastTime = now;
    }
    userLimit.count++;
    rateLimit.set(ip, userLimit);

    if (userLimit.count > maxRequests && ip !== "unknown") {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
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

    const {
      fullName, phone, wilaya, baladiya,
      offerId, offerLabel, quantity, unitPrice, deliveryPrice, totalPrice, pageSlug,
      utmSource, utmMedium, utmCampaign, utmContent, utmTerm, fbclid, ttclid, draftOrderId
    } = body;

    // 3. Strict Input Validation
    if (!fullName || !phone || !wilaya || !baladiya) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sanitize string lengths to prevent DB overflow or malicious huge strings
    const sanitize = (str: any, max: number) => (typeof str === 'string' ? str.substring(0, max) : null);

    const orderData = {
      fullName: String(fullName).substring(0, 100).replace(/[<>]/g, ''),
      phone: String(phone).substring(0, 20).replace(/[<>]/g, ''),
      wilaya: String(wilaya).substring(0, 50).replace(/[<>]/g, ''),
      baladiya: String(baladiya).substring(0, 100).replace(/[<>]/g, ''),
      status: "جديد",
      offerId: sanitize(offerId, 50),
      offerLabel: sanitize(offerLabel, 100),
      quantity: typeof quantity === 'number' ? Math.min(quantity, 100) : 1,
      unitPrice: typeof unitPrice === 'number' ? unitPrice : 0,
      deliveryPrice: typeof deliveryPrice === 'number' ? deliveryPrice : 0,
      totalPrice: typeof totalPrice === 'number' ? totalPrice : 0,
      pageSlug: sanitize(pageSlug, 50),
      utmSource: sanitize(utmSource, 200),
      utmMedium: sanitize(utmMedium, 200),
      utmCampaign: sanitize(utmCampaign, 200),
      utmContent: sanitize(utmContent, 200),
      utmTerm: sanitize(utmTerm, 200),
      fbclid: sanitize(fbclid, 200),
      ttclid: sanitize(ttclid, 200),
    };

    let order;

    if (draftOrderId) {
      // Try to update the draft order
      order = await prisma.order.update({
        where: { id: String(draftOrderId) },
        data: orderData,
      }).catch(() => null); // If draft not found, fallback to create
    }

    if (!order) {
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
        // Sort agents by fewest assigned orders today
        activeAgents.sort((a, b) => a._count.ordersAssigned - b._count.ordersAssigned);
        assignedToId = activeAgents[0].id;
      }
      
      order = await prisma.order.create({
        data: {
          ...orderData,
          assignedToId
        },
      });
    }

    try { await appendToSheet(order); } catch (e) { /* silent */ }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
