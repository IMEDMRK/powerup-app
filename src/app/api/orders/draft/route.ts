import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple in-memory rate limiter (per container)
const rateLimit = new Map<string, { count: number; lastTime: number }>();

export async function POST(request: Request) {
  try {
    // 1. IP-based Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const maxRequests = 20; // higher limit for typing draft events

    const userLimit = rateLimit.get(ip) || { count: 0, lastTime: now };
    if (now - userLimit.lastTime > windowMs) {
      userLimit.count = 0;
      userLimit.lastTime = now;
    }
    userLimit.count++;
    rateLimit.set(ip, userLimit);

    if (userLimit.count > maxRequests && ip !== "unknown") {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const bodyText = await request.text();
    if (bodyText.length > 5000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    
    let body;
    try { body = JSON.parse(bodyText); } catch (e) { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { fullName, phone, draftOrderId, pageSlug } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const sanitize = (str: any, max: number) => (typeof str === 'string' ? str.substring(0, max).replace(/[<>]/g, '') : "");

    const safePhone = sanitize(phone, 20);
    const safeName = fullName ? sanitize(fullName, 100) : "بدون اسم";
    const safeSlug = pageSlug ? sanitize(pageSlug, 50) : null;

    if (draftOrderId) {
      // Update existing draft
      const order = await prisma.order.update({
        where: { id: String(draftOrderId) },
        data: { fullName: safeName, phone: safePhone },
      }).catch(() => null);

      if (order) {
        return NextResponse.json({ success: true, orderId: order.id }, { status: 200 });
      }
    }

    // Create new draft
    const newOrder = await prisma.order.create({
      data: {
        fullName: safeName,
        phone: safePhone,
        wilaya: "غير محدد",
        baladiya: "غير محدد",
        status: "غير مكتملة",
        pageSlug: safeSlug,
      },
    });

    return NextResponse.json({ success: true, orderId: newOrder.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating draft order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
