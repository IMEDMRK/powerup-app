import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const isAdmin = user.role === "ADMIN" || !user.role;

    let reports;
    if (isAdmin) {
      // Admins see all reports, most recent first
      reports = await prisma.workerReport.findMany({
        orderBy: { date: 'desc' },
        include: { user: { select: { name: true, username: true } } }
      });
    } else {
      // Workers see only their own reports
      reports = await prisma.workerReport.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
      });
    }

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const body = await req.json();

    const {
      confirmedOrders,
      deliveredOrders,
      upsells,
      commonObjections,
      commonQuestions,
      notes
    } = body;

    const report = await prisma.workerReport.create({
      data: {
        userId: user.id,
        confirmedOrders: parseInt(confirmedOrders) || 0,
        deliveredOrders: parseInt(deliveredOrders) || 0,
        upsells: parseInt(upsells) || 0,
        commonObjections: commonObjections || null,
        commonQuestions: commonQuestions || null,
        notes: notes || null
      }
    });

    try {
      await prisma.notification.create({
        data: {
          title: "تقرير فريق جديد 📝",
          message: `أضاف الموظف ${user.name} تقريراً يومياً جديداً.`,
          type: "REPORT",
          isAdmin: true,
          link: "/admin/reports"
        }
      });
    } catch (e) {
      console.error(e);
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
