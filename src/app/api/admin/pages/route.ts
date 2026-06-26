import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all landing pages
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pages = await prisma.landingPage.findMany({
    include: { offers: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pages);
}

// POST create new landing page
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const page = await prisma.landingPage.create({
    data: {
      slug: body.slug,
      productName: body.productName,
      productImage: body.productImage || null,
      headline: body.headline,
      subheadline: body.subheadline || null,
      description: body.description || null,
      isActive: body.isActive ?? true,
      primaryColor: body.primaryColor || "#f97316",
      backgroundColor: body.backgroundColor || "#FFF8F2",
      textColor: body.textColor || "#1a1208",
      metaPixelIds: body.metaPixelIds || null,
      tiktokPixelIds: body.tiktokPixelIds || null,
      sectionsOrder: body.sectionsOrder || '["hero","benefits","ingredients","usage","testimonials","faq","order"]',
      offers: {
        create: body.offers || [
          { label: "علبة واحدة", quantity: 1, originalPrice: 4500, salePrice: 2900, isDefault: true, sortOrder: 0 },
          { label: "علبتان", quantity: 2, originalPrice: 9000, salePrice: 5300, badge: "الأكثر مبيعاً", isDefault: false, sortOrder: 1 },
          { label: "3 علب", quantity: 3, originalPrice: 13500, salePrice: 7500, badge: "أفضل قيمة", isDefault: false, sortOrder: 2 },
        ],
      },
    },
    include: { offers: true },
  });
  return NextResponse.json(page, { status: 201 });
}
