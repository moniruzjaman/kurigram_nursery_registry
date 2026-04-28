import { NextResponse } from "next/server";
import nurseryData from "@/lib/nursery-data.json";

export async function GET() {
  return NextResponse.json(nurseryData);
}
