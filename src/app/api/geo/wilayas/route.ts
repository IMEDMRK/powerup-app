import { NextResponse } from "next/server";
import wilayas from "@/data/wilayas.json";

export async function GET() {
  return NextResponse.json(wilayas);
}
