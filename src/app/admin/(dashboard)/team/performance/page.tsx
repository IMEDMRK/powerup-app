import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DollarSign, Activity, Truck, Target, Package, Undo2, XCircle } from "lucide-react";
import Link from "next/link";
import MonthFilter from "@/components/admin/MonthFilter";

export const dynamic = 'force-dynamic';

export default async function TeamPerformancePage({ searchParams }: { searchParams: { month?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN" || !user.role;

  if (!isAdmin) {
    redirect("/admin/orders");
  }

  // Parse month filter
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const selectedMonthStr = searchParams?.month || currentMonthStr;
  
  const [year, month] = selectedMonthStr.split('-').map(Number);
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1); // First day of next month

  // Fetch users and their orders within the date range
  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        ordersConfirmed: {
          where: {
            confirmedAt: {
              gte: startDate,
              lt: endDate,
            }
          },
          select: {
            id: true,
            status: true,
          }
        },
        ordersAssigned: {
          where: {
            createdAt: {
              gte: startDate,
              lt: endDate,
            }
          },
          select: {
            id: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch users, DB might not be migrated:", error);
  }

  // Calculate stats
  const performanceData = users.map(u => {
    const totalAssigned = u.ordersAssigned?.length || 0;
    const totalConfirmed = u.ordersConfirmed?.length || 0;
    const delivered = u.ordersConfirmed?.filter((o: any) => o.status === "مستلمة").length || 0;
    const returned = u.ordersConfirmed?.filter((o: any) => o.status === "روتور").length || 0;
    const cancelled = u.ordersConfirmed?.filter((o: any) => o.status === "ملغاة").length || 0;
    
    // We assume if it was confirmed, it counts towards the total processed pool for delivery rate
    const deliveryRate = totalConfirmed > 0 ? (delivered / totalConfirmed) * 100 : 0;
    
    const commission = delivered * (u.commissionPerDelivered || 0);

    return {
      ...u,
      stats: {
        totalAssigned,
        totalConfirmed,
        delivered,
        returned,
        cancelled,
        deliveryRate,
        commission,
      }
    };
  });

  const totalCommissionsAll = performanceData.reduce((acc, curr) => acc + curr.stats.commission, 0);

  // Generate month options (last 12 months)
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString("ar-DZ", { year: 'numeric', month: 'long' });
    monthOptions.push({ value: val, label });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800">أداء الفريق والعمولات 📊</h1>
          <p className="text-gray-500 mt-2">تتبع جودة التأكيد وحساب أرباح الموظفين بدقة.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/admin/team" className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200">
            العودة للقائمة
          </Link>
          <MonthFilter selectedMonthStr={selectedMonthStr} monthOptions={monthOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-lg shadow-green-500/20 text-white flex items-center justify-between">
          <div>
            <p className="text-green-100 font-medium mb-1">إجمالي العمولات المستحقة (هذا الشهر)</p>
            <h2 className="text-4xl font-black">{totalCommissionsAll.toLocaleString()} دج</h2>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <DollarSign size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-gray-500 font-semibold">الموظف</th>
                <th className="p-4 text-gray-500 font-semibold text-center">الطلبات المسندة</th>
                <th className="p-4 text-gray-500 font-semibold text-center">الطلبات المؤكدة</th>
                <th className="p-4 text-gray-500 font-semibold text-center">مستلمة 📦</th>
                <th className="p-4 text-gray-500 font-semibold text-center">روتور ↩️</th>
                <th className="p-4 text-gray-500 font-semibold text-center">ملغاة ❌</th>
                <th className="p-4 text-gray-500 font-semibold text-center">نسبة التوصيل</th>
                <th className="p-4 text-gray-500 font-semibold text-center">العمولة المتفق عليها</th>
                <th className="p-4 text-gray-500 font-semibold text-center">إجمالي مستحقاته</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-400 font-mono" dir="ltr">{user.username}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl w-max mx-auto">
                      <Package size={16} />
                      {user.stats.totalAssigned}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl w-max mx-auto">
                      <Target size={16} />
                      {user.stats.totalConfirmed}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-xl w-max mx-auto">
                      <Truck size={16} />
                      {user.stats.delivered}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl w-max mx-auto">
                      <Undo2 size={16} />
                      {user.stats.returned}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl w-max mx-auto">
                      <XCircle size={16} />
                      {user.stats.cancelled}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-black text-gray-700">
                      {user.stats.deliveryRate.toFixed(1)}%
                    </div>
                    <div className="w-24 h-2 bg-gray-100 rounded-full mx-auto mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${user.stats.deliveryRate > 70 ? 'bg-green-500' : user.stats.deliveryRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${user.stats.deliveryRate}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm font-bold text-gray-500">
                    {user.commissionPerDelivered} دج / مستلمة
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-black text-xl text-green-600 bg-green-50 px-4 py-2 rounded-xl inline-block">
                      {user.stats.commission.toLocaleString()} دج
                    </div>
                  </td>
                </tr>
              ))}
              {performanceData.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">لا يوجد بيانات لعرضها في هذا الشهر.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
