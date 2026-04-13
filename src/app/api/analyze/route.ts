import { NextResponse } from "next/server";
import { analyzeSubconsciousness } from "@/lib/claude";

export async function POST(request: Request) {
  const { subject_id, input_text } = await request.json();

  if (!subject_id || !input_text) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const analysis = await analyzeSubconsciousness(subject_id, input_text);
  return NextResponse.json(analysis);
}
