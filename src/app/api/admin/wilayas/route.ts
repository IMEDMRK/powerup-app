import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import wilayas from "@/data/wilayas.json";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all wilayas with delivery info
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deliveries = await prisma.wilayaDelivery.findMany({
    orderBy: { wilayaCode: "asc" },
  });

  // If not seeded yet, return defaults from JSON
  if (deliveries.length === 0) {
    return NextResponse.json(
      (wilayas as any[]).map((w) => ({
        id: null,
        wilayaCode: w.code,
        wilayaName: w.name_ar,
        deliveryPrice: 400,
        isEnabled: true,
        estimatedDays: "24-48 ساعة",
      }))
    );
  }
  return NextResponse.json(deliveries);
}

// PUT bulk update wilayas
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: any[] = await req.json();

  const results = await Promise.all(
    body.map((w) =>
      prisma.wilayaDelivery.upsert({
        where: { wilayaCode: w.wilayaCode },
        update: {
          deliveryPrice: w.deliveryPrice,
          isEnabled: w.isEnabled,
          estimatedDays: w.estimatedDays,
          updatedAt: new Date(),
        },
        create: {
          wilayaCode: w.wilayaCode,
          wilayaName: w.wilayaName,
          deliveryPrice: w.deliveryPrice,
          isEnabled: w.isEnabled,
          estimatedDays: w.estimatedDays,
          updatedAt: new Date(),
        },
      })
    )
  );
  return NextResponse.json(results);
}
