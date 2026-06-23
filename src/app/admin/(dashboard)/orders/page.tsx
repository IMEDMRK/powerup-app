import { prisma } from "@/lib/prisma";
import OrdersTable from "@/components/admin/OrdersTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  let settings: any = null;
  let orders: any[] = [];
  let deliveryProviders: any[] = [];
  let agents: any[] = [];

  try {
    settings = await prisma.settings.findUnique({ where: { id: "default" } });
    deliveryProviders = (settings?.deliveryConfig as any[])?.filter((c: any) => c.isActive) || [];

    const user = session?.user as any;
    const userRole = user?.role || "AGENT";
    const userId = user?.id;

    if (userRole === "ADMIN") {
      agents = await prisma.user.findMany({
        where: { role: "AGENT" },
        select: { id: true, name: true, username: true }
      });
    }

    let whereClause: any = {};
    if (userRole !== "ADMIN") {
      whereClause = {
        OR: [
          { assignedToId: userId },
          { assignedToId: null }
        ]
      };
      // Apply page restriction if needed
      const perms = user?.permissions || {};
      if (perms.canManageAllPages === false && Array.isArray(perms.allowedPages) && perms.allowedPages.length > 0) {
        whereClause.pageSlug = { in: perms.allowedPages };
      } else if (perms.canManageAllPages === false) {
        // If they can't manage all pages and have NO allowed pages, show nothing
        whereClause.pageSlug = { in: ["__NONE__"] };
      }
    }

    orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        phone: true,
        wilaya: true,
        baladiya: true,
        status: true,
        offerLabel: true,
        quantity: true,
        unitPrice: true,
        deliveryPrice: true,
        totalPrice: true,
        pageSlug: true,
        deliveryProvider: true,
        trackingId: true,
        bordereauUrl: true,
        assignedTo: { select: { name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    const pendingStatuses = ["جديدة", "جديد", "غير مكتملة", "تم الاتصال للمرة الأولى", "تم الاتصال للمرة الثانية", "تم الاتصال للمرة الثالثة", "الزبون لا يرد"];
    const phoneHistory = new Map();
    for (const o of orders) {
      if (!o.phone) continue;
      if (!phoneHistory.has(o.phone)) phoneHistory.set(o.phone, []);
      phoneHistory.get(o.phone).push(o);
    }

    orders = orders.map((o: any) => {
      const history = phoneHistory.get(o.phone) || [];
      const others = history.filter((other: any) => other.id !== o.id);
      
      const hasRetour = others.some((other: any) => other.status === "روتور");
      const hasCancelled = others.some((other: any) => other.status === "ملغاة");
      const isDuplicate = others.some((other: any) => pendingStatuses.includes(other.status) && pendingStatuses.includes(o.status));

      return { ...o, hasRetour, hasCancelled, isDuplicate };
    });
  } catch (err) {
    console.error("Database not migrated yet:", err);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">📦 إدارة الطلبات</h2>
          <p className="text-gray-500 text-sm mt-1">عرض وتعديل جميع الطلبات الواردة</p>
        </div>
      </div>
      <OrdersTable 
        initialOrders={orders} 
        deliveryProviders={deliveryProviders} 
        agents={agents}
        user={session?.user} 
      />
    </div>
  );
}
