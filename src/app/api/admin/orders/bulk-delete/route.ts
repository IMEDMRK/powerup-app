import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderIds } = await req.json();
  if (!orderIds || !Array.isArray(orderIds)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { isDeleted: true }
  });

  return NextResponse.json({ success: true });
}
