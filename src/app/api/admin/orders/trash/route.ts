import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // You mentioned "Admin gives permission to agents to restore". 
  // For now, if the user reaches here, we check if they are an admin or have permission.
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userRole = (session.user as any).role;
  const perms = (session.user as any).permissions || {};
  const isAdmin = userRole === "ADMIN";
  
  // Only allow admin or users with specific permission (you can add a 'canManageTrash' boolean in the UI later)
  if (!isAdmin && !perms.canManageTrash) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: { isDeleted: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      pageSlug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return NextResponse.json({ orders });
}
