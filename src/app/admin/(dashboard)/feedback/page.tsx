import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FeedbackClient from "./FeedbackClient";

export const metadata = {
  title: "صندوق الشكاوى | Power Up",
};

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN" || !user?.role;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">صندوق الشكاوى والمقترحات</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? "رسائل وشكاوى فريق العمل (مجهولة المصدر)" : "مساحة آمنة وسرية 100% لإيصال صوتك للإدارة"}
          </p>
        </div>
      </div>

      <FeedbackClient isAdmin={isAdmin} />
    </div>
  );
}
