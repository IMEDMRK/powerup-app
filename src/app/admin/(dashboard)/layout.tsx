import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardProvider } from "@/components/admin/DashboardProvider";
import TopBar from "@/components/admin/TopBar";
import DashboardLayoutShell from "@/components/admin/DashboardLayoutShell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | لوحة تحكم Power Up",
    default: "الرئيسية | لوحة تحكم Power Up",
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN" || !user.role;
  const perms = user.permissions || {};

  let agentDailyGoal = 0;
  let agentConfirmedToday = 0;

  if (!isAdmin && user.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { dailyGoal: true }
    });
    
    if (dbUser) {
      agentDailyGoal = dbUser.dailyGoal || 20;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      agentConfirmedToday = await prisma.order.count({
        where: {
          confirmedById: user.id,
          confirmedAt: { gte: today },
          status: "مؤكدة"
        }
      });
    }
  }

  const topBar = (
    <TopBar session={session} agentDailyGoal={agentDailyGoal} agentConfirmedToday={agentConfirmedToday} isAdmin={isAdmin} />
  );

  return (
    <DashboardProvider>
      <DashboardLayoutShell isAdmin={isAdmin} perms={perms} TopBarComponent={topBar}>
        {children}
      </DashboardLayoutShell>
    </DashboardProvider>
  );
}
