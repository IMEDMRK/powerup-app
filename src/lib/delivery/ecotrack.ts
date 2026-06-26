import { DeliveryProviderConfig, ParcelData } from "./index";

export async function ecotrackCreateParcel(provider: DeliveryProviderConfig, data: ParcelData) {
  if (!provider.apiToken || !provider.baseUrl) throw new Error("EcoTrack requires apiToken and baseUrl");

  const baseUrl = provider.baseUrl.endsWith("/") ? provider.baseUrl.slice(0, -1) : provider.baseUrl;

  const payload = {
    reference: data.orderId,
    nom_client: data.fullName,
    telephone: data.phone,
    adresse: data.baladiyaName,
    commune: data.baladiyaName,
    wilaya: data.wilayaName,
    montant: data.totalPrice, // COD amount
    produit: `${data.productName} (x${data.quantity})`,
    remarque: "Sent via PowerUp",
    stop_desk: 0
  };

  const response = await fetch(`${baseUrl}/api/v1/create/colis`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${provider.apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok || !result.tracking) {
    throw new Error(result.message || "EcoTrack API error");
  }

  return {
    trackingId: result.tracking,
    bordereauUrl: result.bordereau || "" // Adjust based on specific Ecotrack implementation
  };
}
