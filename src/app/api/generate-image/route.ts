import { NextResponse } from "next/server";
import { generateImage } from "@/lib/fal";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const url = await generateImage(prompt);
  return NextResponse.json({ url });
}
