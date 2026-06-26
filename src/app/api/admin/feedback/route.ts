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

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const feedbacks = await prisma.anonymousFeedback.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(feedbacks);
  } catch (error: any) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { message } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Creating feedback WITHOUT associating it with the user ID to ensure anonymity
    const feedback = await prisma.anonymousFeedback.create({
      data: {
        message: message.trim()
      }
    });

    try {
      await prisma.notification.create({
        data: {
          title: "رسالة شكوى جديدة 💬",
          message: `تم استلام شكوى/اقتراح جديد في صندوق الشكاوى المجهول.`,
          type: "REPORT",
          isAdmin: true,
          link: "/admin/feedback"
        }
      });
    } catch (e) {
      console.error(e);
    }

    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
