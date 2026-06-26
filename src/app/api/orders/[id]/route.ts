import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateSheetStatus } from "@/lib/googleSheets";

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
    offerId: body.offerId ?? undefined,
    offerLabel: body.offerLabel ?? undefined,
    quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
    unitPrice: body.unitPrice !== undefined ? Number(body.unitPrice) : undefined,
    productCost: body.productCost !== undefined ? Number(body.productCost) : undefined,
    deliveryPrice: body.deliveryPrice !== undefined ? Number(body.deliveryPrice) : undefined,
    discount: body.discount !== undefined ? Number(body.discount) : undefined,
    totalPrice: body.totalPrice !== undefined ? Number(body.totalPrice) : undefined,
    notes: body.notes ?? undefined,
    cancelReason: body.cancelReason ?? undefined,
  };

  const existingOrder = await prisma.order.findUnique({ where: { id } });
  if (!existingOrder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Inventory Management Logic
  if (body.status && existingOrder.status !== body.status) {
    const qty = body.quantity !== undefined ? Number(body.quantity) : existingOrder.quantity;
    
    if (body.status === "مستلمة" && existingOrder.status !== "مستلمة") {
      if (existingOrder.pageSlug) {
        await prisma.landingPage.updateMany({
          where: { slug: existingOrder.pageSlug },
          data: { stockCount: { decrement: qty } }
        });
      }
    } else if (existingOrder.status === "مستلمة" && body.status !== "مستلمة") {
      if (existingOrder.pageSlug) {
        await prisma.landingPage.updateMany({
          where: { slug: existingOrder.pageSlug },
          data: { stockCount: { increment: qty } }
        });
      }
    }
  }

  // If status is being set to a final/confirmed state and it wasn't confirmed before, record it.
  const finalStatuses = ["مؤكدة", "مستلمة", "روتور", "ملغاة"];
  if (body.status && finalStatuses.includes(body.status)) {
    // Only set if not already confirmed
    if (!existingOrder.confirmedAt) {
      const userId = (session.user as any).id;
      const userRole = (session.user as any).role;
      
      let actualUserId = userId;
      // If admin (or master) is editing, give credit to the assigned agent if one exists
      if (userId === "master" || userRole === "ADMIN") {
        if (existingOrder.assignedToId) {
          actualUserId = existingOrder.assignedToId;
          updateData.confirmedById = existingOrder.assignedToId;
        }
      } else if (userId) {
        // Regular agent confirming
        updateData.confirmedById = userId;
      }
      updateData.confirmedAt = new Date();

      // --- Daily Goal Notification Check ---
      if (body.status === "مؤكدة" && actualUserId && actualUserId !== "master") {
        try {
          const agent = await prisma.user.findUnique({
            where: { id: actualUserId },
            include: {
              _count: {
                select: {
                  ordersConfirmed: {
                    where: {
                      confirmedAt: { gte: new Date(new Date().setHours(0,0,0,0)) },
                      status: "مؤكدة"
                    }
                  }
                }
              }
            }
          });
          if (agent && (agent._count.ordersConfirmed + 1) === agent.dailyGoal) {
            await prisma.notification.create({
              data: {
                title: "🎯 هدف يومي مكتمل!",
                message: `تهانينا! لقد حقق الموظف ${agent.name} هدفه اليومي (${agent.dailyGoal} طلبية)`,
                type: "GOAL",
                isAdmin: true,
                userId: agent.id, // Notify agent and admins
              }
            });
          }
        } catch(e) {
          console.error("Failed to check daily goal", e);
        }
      }
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
  });

  if (Object.keys(body).length > 0) {
    updateSheetStatus(updated).catch(e => console.error("Sheet update error:", e));
  }

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
