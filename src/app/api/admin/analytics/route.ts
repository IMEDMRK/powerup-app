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

  // 1. Orders per day (last 14 days or filtered range)
  const orders = await prisma.order.findMany({
    where,
    select: { createdAt: true, status: true, totalPrice: true, productCost: true, deliveryPrice: true, quantity: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const dayMap: Record<string, { total: number; confirmed: number; delivered: number; cancelled: number; returned: number; revenue: number }> = {};
  for (const o of orders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { total: 0, confirmed: 0, delivered: 0, cancelled: 0, returned: 0, revenue: 0 };
    dayMap[day].total++;
    dayMap[day].revenue += o.totalPrice || 0;
    if (o.status === "مؤكدة" || o.status === "تم الاتصال للمرة الأولى" || o.status === "تم الاتصال للمرة الثانية") dayMap[day].confirmed++;
    if (o.status === "مستلمة") dayMap[day].delivered++;
    if (o.status === "ملغاة") dayMap[day].cancelled++;
    if (o.status === "روتور" || o.status === "مسترجعة") dayMap[day].returned++;
  }

  const dailyData = Object.entries(dayMap).map(([date, v]) => ({
    date,
    label: new Date(date).toLocaleDateString("ar-DZ", { month: "short", day: "numeric" }),
    ...v,
  }));

  // 2. Status distribution
  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
  });

  const statusData = statusCounts.map((s) => ({
    name: s.status,
    value: s._count.id,
  }));

  // 3. Summary totals
  const total = orders.length;
  const newOrders = orders.filter(o => o.status === "جديد" || o.status === "جديدة").length;
  const confirmed = orders.filter(o =>
    ["مؤكدة", "تم الاتصال للمرة الأولى", "تم الاتصال للمرة الثانية", "تم الاتصال للمرة الثالثة"].includes(o.status)
  ).length;
  const delivered = orders.filter(o => o.status === "مستلمة").length;
  const cancelled = orders.filter(o => o.status === "ملغاة").length;
  const deliveredOrders = orders.filter(o => o.status === "مستلمة");
  const revenue = deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalProductCost = deliveredOrders.reduce((sum, o) => sum + ((o.productCost || 0) * (o.quantity || 1)), 0);
  const totalDeliveryCost = deliveredOrders.reduce((sum, o) => sum + (o.deliveryPrice || 0), 0);

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
