import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN" || !user.role;
  const perms = user.permissions || {};
  if (!isAdmin && !perms.canViewStats) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // optional YYYY-MM
  
  let dateFilter = {};
  if (month) {
    const [year, m] = month.split('-');
    const startDate = new Date(Number(year), Number(m) - 1, 1);
    const endDate = new Date(Number(year), Number(m), 0, 23, 59, 59);
    dateFilter = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
  }

  const expenses = await prisma.expense.findMany({
    where: dateFilter,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN" || !user.role;
  const perms = user.permissions || {};
  if (!isAdmin && !perms.canViewStats) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { date, amount, category, description } = body;

  if (!date || !amount || !category) {
    return NextResponse.json({ error: "Date, amount, and category are required" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      date: new Date(date),
      amount: Number(amount),
      category,
      description: description || null
    }
  });

  return NextResponse.json(expense);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN" || !user.role;
  const perms = user.permissions || {};
  if (!isAdmin && !perms.canViewStats) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  await prisma.expense.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
