import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  let dateFilter = {};
  if (month) {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    dateFilter = {
      gte: startDate,
      lt: endDate
    };
  }

  try {
    const versements = await prisma.versement.findMany({
      where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
      orderBy: { date: "desc" }
    });
    return NextResponse.json(versements);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { date, deliveryCompany, totalReceived, deliveryFees, returnFees, notes } = body;

    const versement = await prisma.versement.create({
      data: {
        date: new Date(date),
        deliveryCompany: deliveryCompany || "Yalidine",
        totalReceived: Number(totalReceived),
        deliveryFees: Number(deliveryFees || 0),
        returnFees: Number(returnFees || 0),
        notes: notes || null
      }
    });

    return NextResponse.json(versement);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.versement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
