import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // Optional: Check if admin, or agent with permissions
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { isDeleted: false }
  });

  return NextResponse.json({ success: true });
}
