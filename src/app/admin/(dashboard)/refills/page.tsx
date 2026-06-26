import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RefillsClient from "./RefillsClient";

export const dynamic = "force-dynamic";

export default async function RefillsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  // Calculate 25 days ago
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 25);

  const refillCandidates = await prisma.order.findMany({
    where: {
      status: "مستلمة",
      updatedAt: { lte: targetDate },
      OR: [
        { refillStatus: "PENDING" },
        { refillStatus: null }
      ]
    },
    orderBy: { updatedAt: "asc" }
  });

  return <RefillsClient initialCandidates={refillCandidates} />;
}
