import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const whereClause: any = {};
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    if (user.role === "ADMIN") {
      whereClause.OR = [
        { isAdmin: true },
        { userId: user.id }
      ];
    } else {
      whereClause.userId = user.id;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 latest
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Notifications GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    const { action, id } = await req.json();

    if (action === "MARK_ALL_READ") {
      const whereClause: any = { isRead: false };
      
      if (user.role === "ADMIN") {
        whereClause.OR = [
          { isAdmin: true },
          { userId: user.id }
        ];
      } else {
        whereClause.userId = user.id;
      }

      await prisma.notification.updateMany({
        where: whereClause,
        data: { isRead: true }
      });

      return NextResponse.json({ success: true });
    } else if (action === "MARK_READ" && id) {
      // Find the notification to ensure they have permission
      const notif = await prisma.notification.findUnique({ where: { id } });
      if (!notif) return NextResponse.json({ error: "Not found" }, { status: 404 });

      if (user.role !== "ADMIN" && notif.userId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Notifications PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
