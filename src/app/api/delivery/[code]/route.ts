import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import wilayas from "@/data/wilayas.json";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> | { code: string } }
) {
  const { code: codeStr } = await context.params;
  const code = parseInt(codeStr);
  const delivery = await prisma.wilayaDelivery.findUnique({ where: { wilayaCode: code } });

  if (delivery) {
    return NextResponse.json({
      wilayaCode: delivery.wilayaCode,
      wilayaName: delivery.wilayaName,
      deliveryPrice: delivery.deliveryPrice,
      isEnabled: delivery.isEnabled,
      estimatedDays: delivery.estimatedDays,
    });
  }

  const w = (wilayas as any[]).find((x) => x.code === code);
  return NextResponse.json({
    wilayaCode: code,
    wilayaName: w?.name_ar || "",
    deliveryPrice: 400,
    isEnabled: true,
    estimatedDays: "24-48 ساعة",
  });
}
