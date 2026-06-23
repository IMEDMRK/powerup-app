import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const page = await prisma.landingPage.findUnique({
    where: { id },
    include: { offers: { orderBy: { sortOrder: "asc" } } },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();
  const { offers, ...rest } = body;

  // Explicitly pick only the known updatable fields
  const pageData: any = {};
  if (rest.slug !== undefined)          pageData.slug          = rest.slug;
  if (rest.productName !== undefined)   pageData.productName   = rest.productName;
  if (rest.productImage !== undefined)  pageData.productImage  = rest.productImage;
  if (rest.headline !== undefined)      pageData.headline      = rest.headline;
  if (rest.subheadline !== undefined)   pageData.subheadline   = rest.subheadline;
  if (rest.description !== undefined)   pageData.description   = rest.description;
  if (rest.isActive !== undefined)      pageData.isActive      = rest.isActive;
  if (rest.primaryColor !== undefined)  pageData.primaryColor  = rest.primaryColor;
  if (rest.backgroundColor !== undefined) pageData.backgroundColor = rest.backgroundColor;
  if (rest.textColor !== undefined)     pageData.textColor     = rest.textColor;
  if (rest.sectionsOrder !== undefined) pageData.sectionsOrder = typeof rest.sectionsOrder === "string"
    ? rest.sectionsOrder
    : JSON.stringify(rest.sectionsOrder);
  // ─── Price fields ───
  if ("salePrice" in rest)     pageData.salePrice     = rest.salePrice     !== null && rest.salePrice     !== "" ? Number(rest.salePrice)     : null;
  if ("originalPrice" in rest) pageData.originalPrice = rest.originalPrice !== null && rest.originalPrice !== "" ? Number(rest.originalPrice) : null;
  // ─── Video section labels ───
  if (rest.videoTitle    !== undefined) pageData.videoTitle    = rest.videoTitle    || null;
  if (rest.videoSubtitle !== undefined) pageData.videoSubtitle = rest.videoSubtitle || null;
  // ─── Scarcity & Social Proof ───
  if (rest.scarcityActive      !== undefined) pageData.scarcityActive      = Boolean(rest.scarcityActive);
  if (rest.scarcityText        !== undefined) pageData.scarcityText        = rest.scarcityText;
  if (rest.scarcityColor       !== undefined) pageData.scarcityColor       = rest.scarcityColor;
  if (rest.timerActive         !== undefined) pageData.timerActive         = Boolean(rest.timerActive);
  if (rest.timerMinutes        !== undefined) pageData.timerMinutes        = Number(rest.timerMinutes);
  if (rest.timerColor          !== undefined) pageData.timerColor          = rest.timerColor;
  if (rest.socialProofActive   !== undefined) pageData.socialProofActive   = Boolean(rest.socialProofActive);
  if (rest.socialProofMessages !== undefined) pageData.socialProofMessages = rest.socialProofMessages;
  if (rest.socialProofColor    !== undefined) pageData.socialProofColor    = rest.socialProofColor;
  // ─── Dynamic JSON Sections ───
  if (rest.benefitsJson        !== undefined) pageData.benefitsJson        = rest.benefitsJson;
  if (rest.ingredientsJson     !== undefined) pageData.ingredientsJson     = rest.ingredientsJson;
  if (rest.usageJson           !== undefined) pageData.usageJson           = rest.usageJson;
  if (rest.faqJson             !== undefined) pageData.faqJson             = rest.faqJson;
  if (rest.testimonialsJson    !== undefined) pageData.testimonialsJson    = rest.testimonialsJson;
  // ─── Order Section Details ───
  if (rest.orderBoxDeliveryText !== undefined) pageData.orderBoxDeliveryText = rest.orderBoxDeliveryText;
  if (rest.orderBoxPaymentText  !== undefined) pageData.orderBoxPaymentText  = rest.orderBoxPaymentText;
  if (rest.orderFeaturesJson    !== undefined) pageData.orderFeaturesJson    = rest.orderFeaturesJson;
  if (rest.orderFeaturesTextAlign !== undefined) pageData.orderFeaturesTextAlign = rest.orderFeaturesTextAlign;
  if (rest.orderFeaturesFontSize  !== undefined) pageData.orderFeaturesFontSize  = rest.orderFeaturesFontSize;

  await prisma.landingPage.update({ where: { id }, data: pageData });

  // Rebuild offers if provided
  if (offers && Array.isArray(offers)) {
    await prisma.offer.deleteMany({ where: { pageId: id } });
    if (offers.length > 0) {
      await prisma.offer.createMany({
        data: offers.map((o: any, i: number) => ({
          label:         o.label,
          quantity:      o.quantity      ?? 1,
          originalPrice: o.originalPrice ?? 0,
          salePrice:     o.salePrice     ?? 0,
          badge:         o.badge         || null,
          isDefault:     o.isDefault     ?? false,
          freeShipping:  o.freeShipping  ?? false,
          sortOrder:     i,
          pageId:        id,
        })),
      });
    }
  }

  const updated = await prisma.landingPage.findUnique({
    where: { id },
    include: { offers: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  await prisma.landingPage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
