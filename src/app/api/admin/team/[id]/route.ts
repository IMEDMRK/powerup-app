import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  const updateData: any = { ...body };

  if (body.password) {
    updateData.password = await bcrypt.hash(body.password, 10);
  } else {
    delete updateData.password;
  }

  if (body.commissionPerDelivered !== undefined) updateData.commissionPerDelivered = Number(body.commissionPerDelivered);
  if (body.upsellCommission !== undefined) updateData.upsellCommission = Number(body.upsellCommission);
  if (body.dailyGoal !== undefined) updateData.dailyGoal = Number(body.dailyGoal);

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, user });
}
