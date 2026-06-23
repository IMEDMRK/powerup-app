import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import communes from "@/data/communes.json";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wilayaCode = searchParams.get("wilaya");

  if (!wilayaCode) {
    return NextResponse.json([]);
  }

  const data = (communes as Record<string, any[]>)[wilayaCode] ?? [];
  return NextResponse.json(data);
}
