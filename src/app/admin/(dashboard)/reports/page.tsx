import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ReportsClient from "./ReportsClient";

export const metadata = {
  title: "تقارير الفريق | Power Up",
};

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN" || !user?.role;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقارير الفريق</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? "متابعة التقارير اليومية لفريق العمل" : "أرسل تقريرك اليومي للإدارة"}
          </p>
        </div>
      </div>

      <ReportsClient isAdmin={isAdmin} />
    </div>
  );
}
