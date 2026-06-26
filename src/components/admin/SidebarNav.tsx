"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Globe, MapPin, Shield, Calculator, Wallet, Truck, TrendingUp, Repeat, ClipboardList, FileText, MessageSquare, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { useDashboard } from "./DashboardProvider";

export default function SidebarNav({ isAdmin, perms }: { isAdmin: boolean; perms: Record<string, boolean> }) {
  const pathname = usePathname();
  const { t, lang } = useDashboard();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const navGroups = [
    {
      label: "الرئيسية",
      items: [
        { href: "/admin", icon: LayoutDashboard, label: t("overview"), permission: "canViewOverview" },
      ]
    },
    {
      label: "إدارة الطلبيات",
      items: [
        { href: "/admin/orders", icon: ShoppingBag, label: t("orders"), permission: "canViewOrders" },
        { href: "/admin/orders/trash", icon: Trash, label: "سلة المهملات", permission: "canManageTrash" },
        { href: "/admin/refills", icon: Repeat, label: t("refills"), permission: "canViewRefills" },
      ]
    },
    {
      label: "التسويق والمنتجات",
      items: [
        { href: "/admin/pages", icon: Globe, label: t("landingPages"), permission: "canViewPages" },
        { href: "/admin/performance", icon: TrendingUp, label: "أداء الإعلانات", permission: "canViewPerformance" },
      ]
    },
    {
      label: "المالية",
      items: [
        { href: "/admin/versements", icon: Truck, label: t("versements"), permission: "canViewVersements" },
        { href: "/admin/expenses", icon: Wallet, label: t("expenses"), permission: "canViewExpenses" },
        { href: "/admin/calculator", icon: Calculator, label: t("calculator"), permission: "canViewCalculator" },
      ]
    },
    {
      label: "الفريق والمهام",
      items: [
        { href: "/admin/tasks", icon: ClipboardList, label: "لوحة المهام", permission: "canViewTasks" },
        { href: "/admin/reports", icon: FileText, label: "تقارير الفريق", permission: "canViewReports" },
        { href: "/admin/feedback", icon: MessageSquare, label: "صندوق الشكاوى", permission: "canViewFeedback" },
        { href: "/admin/team", icon: Shield, label: t("team"), permission: "canViewTeam" },
      ]
    },
    {
      label: "الإعدادات",
      items: [
        { href: "/admin/wilayas", icon: MapPin, label: t("delivery"), permission: "canViewWilayas" },
        { href: "/admin/settings", icon: Settings, label: t("settings"), permission: "canViewSettings" },
      ]
    }
  ];

  // Auto-expand the group that contains the current active route
  useEffect(() => {
    const currentGroup = navGroups.find(g => 
      g.items.some(i => i.href === "/admin" ? pathname === i.href : pathname?.startsWith(i.href))
    );
    if (currentGroup) {
      setExpandedGroups(prev => ({ ...prev, [currentGroup.label]: true }));
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
      {navGroups.map((group, groupIdx) => {
        // Filter items in this group based on permissions
        const visibleItems = group.items.filter(item => {
          if (isAdmin) return true;
          if (item.permission && !perms[item.permission]) return false;
          return true;
        });

        // If no items are visible, don't render the group
        if (visibleItems.length === 0) return null;

        const isExpanded = expandedGroups[group.label];

        // For the "الرئيسية" (Main) group which only has one item, we might not want it to be collapsible 
        // to save clicks, but let's keep the UI consistent or just render it directly if it has 1 item.
        if (visibleItems.length === 1 && group.label === "الرئيسية") {
          const { href, icon: Icon, label } = visibleItems[0];
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
        }

        return (
          <div key={groupIdx} className="space-y-1">
            <button 
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-black text-gray-300 uppercase tracking-wider hover:text-white transition-colors"
            >
              <span>{group.label}</span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isExpanded && (
              <div className="space-y-1 mt-1">
                {visibleItems.map(({ href, icon: Icon, label }) => {
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
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
