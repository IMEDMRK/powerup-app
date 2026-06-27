"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import SidebarNav from "./SidebarNav";
import { useDashboard } from "./DashboardProvider";
import { usePathname } from "next/navigation";

export default function DashboardLayoutShell({ 
  children, 
  isAdmin, 
  perms, 
  TopBarComponent 
}: { 
  children: React.ReactNode;
  isAdmin: boolean;
  perms: Record<string, boolean>;
  TopBarComponent: React.ReactNode;
}) {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useDashboard();
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-secondary text-white flex flex-col fixed h-full z-50 shadow-xl transition-transform duration-300
        ${isMobileMenuOpen ? "translate-x-0 rtl:translate-x-0" : "-translate-x-full lg:translate-x-0 rtl:translate-x-full lg:rtl:translate-x-0"}
      `}>
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
      <main className="flex-1 lg:mr-64 lg:ltr:ml-64 lg:ltr:mr-0 rtl:mr-64 rtl:ml-0 transition-all flex flex-col min-h-screen w-full lg:w-auto">
        {TopBarComponent}
        <div className="p-4 sm:p-8 flex-1">{children}</div>
      </main>
    </>
  );
}
