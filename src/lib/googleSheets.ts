import { prisma } from "@/lib/prisma";

export async function appendToSheet(order: any) {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings) return;
    
    const appsConfig = (settings.appsConfig as any) || {};
    const googleSheets = appsConfig.googleSheets || {};

    if (googleSheets.active && googleSheets.webhookUrl) {
      const payload = {
        orderId: order.id,
        createdAt: new Date(order.createdAt || new Date()).toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' }),
        fullName: order.fullName,
        phone: order.phone,
        wilaya: order.wilaya,
        baladiya: order.baladiya,
        productName: order.productName || (order.pageSlug ? order.pageSlug : ""),
        offerLabel: order.offerLabel || "",
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        deliveryPrice: order.deliveryPrice,
        totalPrice: order.totalPrice,
        pageSlug: order.pageSlug || "",
        ttclid: order.ttclid || "",
        fbclid: order.fbclid || ""
      };

      const res = await fetch(googleSheets.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.error("Google Sheets Webhook Failed with status:", res.status);
      }
    }
  } catch (error) {
    console.error("Google Sheets Error:", error);
  }
}
