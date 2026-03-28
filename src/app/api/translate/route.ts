import { NextResponse } from "next/server";
import { translateToSpatial } from "@/lib/claude";

export async function POST(request: Request) {
  const { analysis } = await request.json();

  if (!analysis) {
    return NextResponse.json({ error: "Missing analysis data" }, { status: 400 });
  }

  const translation = await translateToSpatial(analysis);
  return NextResponse.json(translation);
}
