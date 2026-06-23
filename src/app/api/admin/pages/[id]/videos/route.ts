import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const videos = await prisma.video.findMany({
    where: { pageId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(videos);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const videos: any[] = await req.json();
  await prisma.video.deleteMany({ where: { pageId: id } });
  if (videos.length > 0) {
    await prisma.video.createMany({
      data: videos.map((v, i) => ({
        title: v.title,
        url: v.url,
        description: v.description || null,
        sortOrder: i,
        pageId: id,
      })),
    });
  }
  const saved = await prisma.video.findMany({
    where: { pageId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(saved);
}
