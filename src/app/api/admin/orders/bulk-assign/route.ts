import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user?.role === "ADMIN" || !user?.role;

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { orderIds, agentId } = await req.json();
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "Invalid order IDs" }, { status: 400 });
    }

    const assignedToId = agentId === "UNASSIGNED" ? null : agentId;

    const result = await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { assignedToId }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    console.error("Bulk assign error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
