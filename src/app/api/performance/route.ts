import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get("monthYear"); // "2026-06"

    if (!monthYear) {
      return NextResponse.json({ error: "monthYear is required" }, { status: 400 });
    }

    const data = await prisma.dailyPerformance.findMany({
      where: { monthYear },
      orderBy: { day: 'asc' }
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("GET performance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { monthYear, day, adSpend, leads, confirmed, delivered } = body;

    if (!monthYear || day === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const upserted = await prisma.dailyPerformance.upsert({
      where: {
        monthYear_day: {
          monthYear,
          day: parseInt(day),
        }
      },
      update: {
        adSpend: parseFloat(adSpend || 0),
        leads: parseInt(leads || 0),
        confirmed: parseInt(confirmed || 0),
        delivered: parseInt(delivered || 0),
      },
      create: {
        monthYear,
        day: parseInt(day),
        adSpend: parseFloat(adSpend || 0),
        leads: parseInt(leads || 0),
        confirmed: parseInt(confirmed || 0),
        delivered: parseInt(delivered || 0),
      }
    });

    return NextResponse.json({ success: true, data: upserted }, { status: 200 });
  } catch (error) {
    console.error("POST performance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
