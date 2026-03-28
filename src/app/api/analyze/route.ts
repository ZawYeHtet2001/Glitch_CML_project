import { NextResponse } from "next/server";
import { analyzeMemory } from "@/lib/claude";

export async function POST(request: Request) {
  const { subject_id, memory_text, dream_text } = await request.json();

  if (!subject_id || !memory_text || !dream_text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const analysis = await analyzeMemory(subject_id, memory_text, dream_text);
  return NextResponse.json(analysis);
}
