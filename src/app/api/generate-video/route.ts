import { NextResponse } from "next/server";
import { generateVideo } from "@/lib/fal";

export async function POST(request: Request) {
  const { image_url, prompt } = await request.json();

  if (!image_url || !prompt) {
    return NextResponse.json({ error: "Missing image_url or prompt" }, { status: 400 });
  }

  const url = await generateVideo(image_url, prompt);
  return NextResponse.json({ url });
}
