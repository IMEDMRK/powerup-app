import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  const updateData: any = {
    status: body.status ?? undefined,
    fullName: body.fullName ?? undefined,
    phone: body.phone ?? undefined,
    wilaya: body.wilaya ?? undefined,
    baladiya: body.baladiya ?? undefined,
    offerLabel: body.offerLabel ?? undefined,
    quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
    unitPrice: body.unitPrice !== undefined ? Number(body.unitPrice) : undefined,
    productCost: body.productCost !== undefined ? Number(body.productCost) : undefined,
    deliveryPrice: body.deliveryPrice !== undefined ? Number(body.deliveryPrice) : undefined,
    totalPrice: body.totalPrice !== undefined ? Number(body.totalPrice) : undefined,
    notes: body.notes ?? undefined,
  };

  // If status is being set to a final/confirmed state and it wasn't confirmed before, record it.
  const finalStatuses = ["مؤكدة", "مستلمة", "روتور", "ملغاة"];
  if (body.status && finalStatuses.includes(body.status)) {
    const existingOrder = await prisma.order.findUnique({ where: { id } });
    // Only set if not already confirmed
    if (existingOrder && !existingOrder.confirmedAt) {
      const userId = (session.user as any).id;
      const userRole = (session.user as any).role;
      
      // If admin (or master) is editing, give credit to the assigned agent if one exists
      if (userId === "master" || userRole === "ADMIN") {
        if (existingOrder.assignedToId) {
          updateData.confirmedById = existingOrder.assignedToId;
        }
      } else if (userId) {
        // Regular agent confirming
        updateData.confirmedById = userId;
      }
      updateData.confirmedAt = new Date();
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
