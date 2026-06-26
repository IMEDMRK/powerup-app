import { prisma } from "@/lib/prisma";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";
import DashboardCharts from "./DashboardCharts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN" || !user.role;
  const perms = user.permissions || {};

  if (!isAdmin && !perms.canViewStats) {
    redirect("/admin/orders");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">نظرة عامة</h2>

      {/* ── Analytics Charts (client component with date filter) ── */}
      <DashboardCharts />
    </div>
  );
}
