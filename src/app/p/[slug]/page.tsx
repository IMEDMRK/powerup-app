import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DynamicLandingPage from "@/components/landing/DynamicLandingPage";
import ScarcityWidgets from "@/components/store/ScarcityWidgets";

export const dynamic = 'force-dynamic';




interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.landingPage.findFirst({
    where: { slug, isActive: true },
    include: {
      offers: { orderBy: { sortOrder: "asc" } },
      videos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!page) return notFound();

  const sectionsOrder: string[] = typeof page.sectionsOrder === "string"
    ? JSON.parse(page.sectionsOrder)
    : page.sectionsOrder as string[];

  return (
    <>
      <ScarcityWidgets 
        timerActive={page.timerActive}
        timerMinutes={page.timerMinutes}
        timerColor={page.timerColor || "#fef08a"}
        scarcityActive={page.scarcityActive}
        scarcityText={page.scarcityText || ""}
        scarcityColor={page.scarcityColor || "#fee2e2"}
        socialProofActive={page.socialProofActive}
        socialProofMessages={page.socialProofMessages || ""}
        socialProofColor={page.socialProofColor || "#e0e7ff"}
      />
      <DynamicLandingPage
        page={{
          ...page,
          sectionsOrder,
          salePrice: page.salePrice ?? null,
          originalPrice: page.originalPrice ?? null,
          videoTitle: page.videoTitle ?? null,
          videoSubtitle: page.videoSubtitle ?? null,
          videos: page.videos,
        }}
      />
    </>
  );
}
