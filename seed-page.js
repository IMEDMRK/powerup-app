const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Check if page already exists
  const existing = await prisma.landingPage.findUnique({ where: { slug: "powerup" } });
  if (existing) {
    console.log("✅ صفحة POWER UP موجودة بالفعل:", existing.id);
    return;
  }

  const page = await prisma.landingPage.create({
    data: {
      slug: "powerup",
      productName: "POWER UP",
      productImage: "https://i.ibb.co/DP0FrY8x/1753504381054.png",
      headline: "عزز وزنك وطاقتك مع POWER UP",
      subheadline: "المكمل الغذائي الطبيعي 100% المصمم لزيادة الوزن بطريقة صحية، فتح الشهية، ومنحك طاقة وحيوية طوال اليوم.",
      description: "مكمل غذائي طبيعي من مكونات جزائرية أصيلة",
      isActive: true,
      sectionsOrder: JSON.stringify(["hero", "benefits", "ingredients", "usage", "testimonials", "faq", "order"]),
      offers: {
        create: [
          { label: "علبة واحدة", quantity: 1, originalPrice: 4500, salePrice: 2900, isDefault: true, sortOrder: 0 },
          { label: "علبتان", quantity: 2, originalPrice: 9000, salePrice: 5300, badge: "الأكثر مبيعاً", isDefault: false, sortOrder: 1 },
          { label: "3 علب", quantity: 3, originalPrice: 13500, salePrice: 7500, badge: "أفضل قيمة", isDefault: false, sortOrder: 2 },
        ],
      },
    },
    include: { offers: true },
  });

  console.log("✅ تم إنشاء صفحة POWER UP:");
  console.log("   ID:", page.id);
  console.log("   Slug:", page.slug);
  console.log("   رابط: /p/powerup");
  console.log("   عدد العروض:", page.offers.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
