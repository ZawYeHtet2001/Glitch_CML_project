import { NextResponse } from "next/server";
import { generate3DModel } from "@/lib/fal";
import type { Model3D } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const imageUrl: string | undefined = body.image_url;
  const model: Model3D = body.model_3d || "trellis";

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Missing image_url" },
      { status: 400 }
    );
  }

  try {
    const url = await generate3DModel(imageUrl, model);
    return NextResponse.json({ url, model });
  } catch (e) {
    const errObj = e as { status?: number; body?: unknown; message?: string };
    console.error("generate-3d failed:", {
      status: errObj.status,
      body: JSON.stringify(errObj.body, null, 2),
      message: errObj.message,
    });
    const message =
      errObj.message || "3D generation failed";
    return NextResponse.json({ error: message, detail: errObj.body }, { status: 500 });
  }
}
