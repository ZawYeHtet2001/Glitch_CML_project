import { NextResponse } from "next/server";
import { generateImage } from "@/lib/fal";
import { buildImagePrompt } from "@/lib/prompt-builder";
import { Connection, KeywordFragment, OperationNode } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();

  // Support both old-style { prompt } and new-style { connections, keywords, operations }
  let prompt: string;

  if (body.connections && body.keywords && body.operations) {
    const connections: Connection[] = body.connections;
    const keywords: KeywordFragment[] = body.keywords;
    const operations: OperationNode[] = body.operations;

    if (connections.length === 0) {
      return NextResponse.json(
        { error: "No connections made — connect keywords to operations first" },
        { status: 400 }
      );
    }

    prompt = buildImagePrompt(connections, keywords, operations);
  } else if (body.prompt) {
    prompt = body.prompt;
  } else {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const url = await generateImage(prompt);
  return NextResponse.json({ url, prompt });
}
