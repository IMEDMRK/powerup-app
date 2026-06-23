import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeamManager from "@/components/admin/TeamManager";

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN" || !user.role;

  if (!isAdmin) {
    redirect("/admin/orders");
  }

// Fetch users server-side to pass as initial data
  let users: any[] = [];
  let landingPages: any[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { ordersConfirmed: true }
        }
      }
    });

    landingPages = await prisma.landingPage.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, productName: true }
    });
  } catch (error) {
    console.error("Failed to fetch users or pages:", error);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800">إدارة فريق العمل (Call Center) 👥</h1>
        <p className="text-gray-500 mt-2">إضافة الموظفين وتخصيص صلاحياتهم وتتبع أدائهم.</p>
      </div>
      <TeamManager initialUsers={users} landingPages={landingPages} />
    </div>
  );
}
