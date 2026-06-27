import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter: any = {};
  if (from) dateFilter.gte = new Date(from + "T00:00:00.000Z");
  if (to) {
    const toDate = new Date(to + "T23:59:59.999Z");
    dateFilter.lte = toDate;
  }

  const where = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  // 1. Orders per day (based on createdAt)
  const orders = await prisma.order.findMany({
    where,
    select: { createdAt: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  const dayMap: Record<string, { total: number; confirmed: number; delivered: number; cancelled: number; returned: number; revenue: number }> = {};
  for (const o of orders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { total: 0, confirmed: 0, delivered: 0, cancelled: 0, returned: 0, revenue: 0 };
    dayMap[day].total++;
  }

  // 2. Confirmed (based on confirmedAt)
  const confirmedWhere = Object.keys(dateFilter).length > 0 ? { confirmedAt: dateFilter } : { confirmedAt: { not: null } };
  const confirmedOrdersInRange = await prisma.order.findMany({
    where: confirmedWhere,
    select: { confirmedAt: true },
  });
  
  for (const o of confirmedOrdersInRange) {
    if (!o.confirmedAt) continue;
    const day = o.confirmedAt.toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { total: 0, confirmed: 0, delivered: 0, cancelled: 0, returned: 0, revenue: 0 };
    dayMap[day].confirmed++;
  }

  // 3. Delivered (based on deliveredAt)
  const deliveredWhere = Object.keys(dateFilter).length > 0 ? { deliveredAt: dateFilter, status: "مستلمة" } : { status: "مستلمة" };
  const deliveredOrdersInRange = await prisma.order.findMany({
    where: deliveredWhere,
    select: { deliveredAt: true, totalPrice: true, productCost: true, deliveryPrice: true, quantity: true },
  });

  for (const o of deliveredOrdersInRange) {
    if (!o.deliveredAt) continue;
    const day = o.deliveredAt.toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { total: 0, confirmed: 0, delivered: 0, cancelled: 0, returned: 0, revenue: 0 };
    dayMap[day].delivered++;
    dayMap[day].revenue += o.totalPrice || 0;
  }

  // 4. Cancelled (based on cancelledAt)
  const cancelledWhere = Object.keys(dateFilter).length > 0 ? { cancelledAt: dateFilter, status: "ملغاة" } : { status: "ملغاة" };
  const cancelledOrdersInRange = await prisma.order.findMany({
    where: cancelledWhere,
    select: { cancelledAt: true },
  });

  for (const o of cancelledOrdersInRange) {
    if (!o.cancelledAt) continue;
    const day = o.cancelledAt.toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { total: 0, confirmed: 0, delivered: 0, cancelled: 0, returned: 0, revenue: 0 };
    dayMap[day].cancelled++;
  }

  // 5. Returned (based on returnedAt)
  const returnedWhere = Object.keys(dateFilter).length > 0 ? { returnedAt: dateFilter, status: { in: ["روتور", "مسترجعة"] } } : { status: { in: ["روتور", "مسترجعة"] } };
  const returnedOrdersInRange = await prisma.order.findMany({
    where: returnedWhere,
    select: { returnedAt: true },
  });

  for (const o of returnedOrdersInRange) {
    if (!o.returnedAt) continue;
    const day = o.returnedAt.toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { total: 0, confirmed: 0, delivered: 0, cancelled: 0, returned: 0, revenue: 0 };
    dayMap[day].returned++;
  }

  // Sort dayMap keys
  const dailyData = Object.entries(dayMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, v]) => ({
      date,
      label: new Date(date).toLocaleDateString("ar-DZ", { month: "short", day: "numeric" }),
      ...v,
    }));

  // Status distribution
  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
  });

  const statusData = statusCounts.map((s) => ({
    name: s.status,
    value: s._count.id,
  }));

  // Summary totals
  const total = orders.length;
  const newOrders = orders.filter(o => o.status === "جديد" || o.status === "جديدة").length;
  const confirmed = confirmedOrdersInRange.length;
  const delivered = deliveredOrdersInRange.length;
  const cancelled = cancelledOrdersInRange.length;
  const revenue = deliveredOrdersInRange.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalProductCost = deliveredOrdersInRange.reduce((sum, o) => sum + ((o.productCost || 0) * (o.quantity || 1)), 0);
  const totalDeliveryCost = deliveredOrdersInRange.reduce((sum, o) => sum + (o.deliveryPrice || 0), 0);

  const expenses = await prisma.expense.findMany({
    where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}
  });
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  const netProfit = revenue - totalProductCost - totalDeliveryCost - totalExpenses;

  // Stale Orders (Global, >24 hours and status "جديد")
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const staleOrdersCount = await prisma.order.count({
    where: {
      status: "جديد",
      createdAt: { lt: twentyFourHoursAgo }
    }
  });

  // 4. Cancellation reasons distribution
  const cancelReasonsCounts = await prisma.order.groupBy({
    by: ["cancelReason"],
    where: { ...where, status: "ملغاة", cancelReason: { not: null } },
    _count: { id: true },
  });

  const cancelReasonData = cancelReasonsCounts.map(c => ({
    name: c.cancelReason,
    value: c._count.id
  }));

  return NextResponse.json({ 
    dailyData, statusData, cancelReasonData, total, newOrders, confirmed, delivered, cancelled, 
    revenue, totalProductCost, totalDeliveryCost, totalExpenses, netProfit, staleOrdersCount 
  });
}
