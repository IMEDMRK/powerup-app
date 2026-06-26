import { yalidineCreateParcel } from "./yalidine";
import { ecotrackCreateParcel } from "./ecotrack";

export interface DeliveryProviderConfig {
  id: string;
  name: string;
  type: "YALIDINE" | "ECOTRACK";
  apiKey?: string;
  apiToken?: string;
  baseUrl?: string;
  isActive: boolean;
}

export interface ParcelData {
  orderId: string;
  fullName: string;
  phone: string;
  wilayaName: string;
  baladiyaName: string;
  totalPrice: number; // COD amount
  deliveryPrice: number;
  productName: string;
  quantity: number;
  notes?: string;
}

export async function createParcel(provider: DeliveryProviderConfig, data: ParcelData) {
  if (provider.type === "YALIDINE") {
    return yalidineCreateParcel(provider, data);
  } else if (provider.type === "ECOTRACK") {
    return ecotrackCreateParcel(provider, data);
  }
  throw new Error(`Unsupported provider type: ${provider.type}`);
}
