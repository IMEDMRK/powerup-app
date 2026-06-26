"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Globe, MapPin, Shield, Calculator, Wallet, Truck, TrendingUp, Repeat, ClipboardList, FileText, MessageSquare, Trash } from "lucide-react";
import { useDashboard } from "./DashboardProvider";

export default function SidebarNav({ isAdmin, perms }: { isAdmin: boolean; perms: Record<string, boolean> }) {
  const pathname = usePathname();
  const { t, lang } = useDashboard();

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: t("overview"), permission: "canViewOverview" },
    { href: "/admin/orders", icon: ShoppingBag, label: t("orders"), permission: "canViewOrders" },
    { href: "/admin/orders/trash", icon: Trash, label: "سلة المهملات", permission: "canManageTrash" },
    { href: "/admin/refills", icon: Repeat, label: t("refills"), permission: "canViewRefills" },
    { href: "/admin/pages", icon: Globe, label: t("landingPages"), permission: "canViewPages" },
    { href: "/admin/performance", icon: TrendingUp, label: "أداء الإعلانات", permission: "canViewPerformance" },
    { href: "/admin/versements", icon: Truck, label: t("versements"), permission: "canViewVersements" },
    { href: "/admin/expenses", icon: Wallet, label: t("expenses"), permission: "canViewExpenses" },
    { href: "/admin/calculator", icon: Calculator, label: t("calculator"), permission: "canViewCalculator" },
    { href: "/admin/tasks", icon: ClipboardList, label: "لوحة المهام", permission: "canViewTasks" },
    { href: "/admin/reports", icon: FileText, label: "تقارير الفريق", permission: "canViewReports" },
    { href: "/admin/feedback", icon: MessageSquare, label: "صندوق الشكاوى", permission: "canViewFeedback" },
    { href: "/admin/team", icon: Shield, label: t("team"), permission: "canViewTeam" },
    { href: "/admin/wilayas", icon: MapPin, label: t("delivery"), permission: "canViewWilayas" },
    { href: "/admin/settings", icon: Settings, label: t("settings"), permission: "canViewSettings" },
  ];

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {navItems.filter(item => {
        if (isAdmin) return true;
        if (item.permission && !perms[item.permission]) return false;
        return true;
      }).map(({ href, icon: Icon, label }) => {
        // Exact match for root /admin, startsWith for subpages like /admin/orders
        const isActive = href === "/admin" ? pathname === href : pathname?.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${
              isActive 
                ? "bg-primary text-white shadow-md" 
                : "hover:bg-white/10 text-gray-300"
            }`}
          >
            <Icon 
              size={19} 
              className={`transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`} 
            />
            <span className={`font-medium ${lang !== 'ar' ? 'ml-3' : 'mr-3'}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
