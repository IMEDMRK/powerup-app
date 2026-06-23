import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Globe, MapPin, Shield, Calculator, Wallet, Truck } from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "الرئيسية", permission: "canViewStats" },
  { href: "/admin/orders", icon: ShoppingBag, label: "الطلبات", permission: null }, // Always visible
  { href: "/admin/calculator", icon: Calculator, label: "حساب الفائدة", permission: null },
  { href: "/admin/expenses", icon: Wallet, label: "المصاريف", permission: "canViewStats" },
  { href: "/admin/versements", icon: Truck, label: "أموال التوصيل", permission: "canViewStats" },
  { href: "/admin/pages", icon: Globe, label: "صفحات الهبوط", permission: "canManagePages" },
  { href: "/admin/wilayas", icon: MapPin, label: "الولايات والتوصيل", permission: "canManageSettings" },
  { href: "/admin/team", icon: Shield, label: "إدارة الفريق", adminOnly: true },
  { href: "/admin/settings", icon: Settings, label: "الإعدادات", permission: "canManageSettings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const user = session.user as any;
  // Fallback for legacy sessions that don't have a role yet
  const isAdmin = user.role === "ADMIN" || !user.role;
  const perms = user.permissions || {};

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-white flex flex-col fixed h-full z-20 shadow-xl">
        <div className="p-6 border-b border-white/10 text-center">
          <h2 className="text-2xl font-black text-primary">POWER UP</h2>
          <p className="text-xs text-gray-400 mt-1">لوحة التحكم</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.filter(item => {
            if (item.adminOnly && !isAdmin) return false;
            if (!isAdmin && item.permission && !perms[item.permission]) return false;
            return true;
          }).map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <Icon size={19} className="text-gray-400 group-hover:text-primary transition-colors" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

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
      <main className="flex-1 mr-64">
        <header className="bg-white shadow-sm h-16 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">لوحة التحكم</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 py-1 px-3 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            متصل: {session.user?.name}
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
