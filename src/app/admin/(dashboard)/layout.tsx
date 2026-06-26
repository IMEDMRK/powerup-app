import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import SidebarNav from "@/components/admin/SidebarNav";
import { prisma } from "@/lib/prisma";
import DailyGoalProgress from "@/components/admin/DailyGoalProgress";
import { DashboardProvider } from "@/components/admin/DashboardProvider";
import TopBar from "@/components/admin/TopBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const user = session.user as any;
  // Fallback for legacy sessions that don't have a role yet
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

  return (
    <DashboardProvider>
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-white flex flex-col fixed h-full z-20 shadow-xl">
        <div className="p-6 border-b border-white/10 text-center">
          <Link href="/admin" className="block hover:opacity-80 transition-opacity">
            <h2 className="text-2xl font-black text-primary">POWER UP</h2>
            <p className="text-xs text-gray-400 mt-1">لوحة التحكم</p>
          </Link>
        </div>

        <SidebarNav isAdmin={isAdmin} perms={perms} />

        <div className="p-4 border-t border-white/10">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <LogOut size={19} />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:mr-64 lg:ltr:ml-64 lg:ltr:mr-0 rtl:mr-64 rtl:ml-0 transition-all">
        <TopBar session={session} agentDailyGoal={agentDailyGoal} agentConfirmedToday={agentConfirmedToday} isAdmin={isAdmin} />
        
        <div className="p-8">{children}</div>
      </main>
    </DashboardProvider>
  );
}
