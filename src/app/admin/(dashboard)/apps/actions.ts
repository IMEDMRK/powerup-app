"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function saveGoogleSheetsConfig(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  if (user.role !== "ADMIN" && !user.permissions?.canManageSettings) {
    throw new Error("Forbidden");
  }

  const active = formData.get("active") === "true";
  const webhookUrl = formData.get("webhookUrl") as string;

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const currentAppsConfig = (settings?.appsConfig as any) || {};

  const updatedConfig = {
    ...currentAppsConfig,
    googleSheets: {
      active,
      webhookUrl
    }
  };

  await prisma.settings.upsert({
    where: { id: "default" },
    update: { appsConfig: updatedConfig },
    create: { id: "default", appsConfig: updatedConfig }
  });

  revalidatePath("/admin/apps");
  revalidatePath("/admin/apps/google-sheets");

  return { success: true };
}
