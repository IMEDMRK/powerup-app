import { DeliveryProviderConfig, ParcelData } from "./index";

export async function yalidineCreateParcel(provider: DeliveryProviderConfig, data: ParcelData) {
  if (!provider.apiKey || !provider.apiToken) throw new Error("Yalidine requires apiKey and apiToken");

  const payload = {
    data: [
      {
        order_id: data.orderId,
        firstname: data.fullName.split(" ")[0] || data.fullName,
        familyname: data.fullName.split(" ").slice(1).join(" ") || ".",
        contact_phone: data.phone,
        address: data.baladiyaName,
        to_commune_name: data.baladiyaName,
        to_wilaya_name: data.wilayaName,
        product_list: `${data.productName} (x${data.quantity})`,
        price: data.totalPrice, // COD amount
        freeshipping: data.deliveryPrice === 0,
        is_stopdesk: false,
        has_exchange: false,
        remarque: data.notes || undefined
      }
    ]
  };

  const response = await fetch("https://api.yalidine.app/v1/parcels/", {
    method: "POST",
    headers: {
      "X-API-ID": provider.apiKey,
      "X-API-TOKEN": provider.apiToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok || (result.data && result.data[0] && result.data[0].error)) {
    throw new Error(result.data?.[0]?.error || "Yalidine API error");
  }

  // Yalidine returns tracking as tracking parameter
  const trackingId = result.data?.[0]?.tracking;
  if (!trackingId) throw new Error("No tracking ID returned from Yalidine");

  return {
    trackingId,
    bordereauUrl: `https://api.yalidine.app/v1/bordereaus/${trackingId}` // Usually bulk print via dashboard
  };
}
