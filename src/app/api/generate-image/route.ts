import { NextResponse } from "next/server";
import { generateImage, generateImageWithReference } from "@/lib/fal";
import { buildImagePrompt } from "@/lib/prompt-builder";
import { artDirectPrompt, explainArtifact } from "@/lib/claude";
import {
  Connection,
  KeywordFragment,
  OperationNode,
  SubconsciousAnalysis,
  ToneArchetype,
  ImageModel,
} from "@/lib/types";

// Map archetype → reference image path (served from public/)
const ARCHETYPE_IMAGES: Record<ToneArchetype, string> = {
  organic: "/archetypes/organic.jpg",
  crystalline: "/archetypes/crystalline.jpg",
  twisted: "/archetypes/twisted.jpg",
  skeletal: "/archetypes/skeletal.jpg",
  monolithic: "/archetypes/monolithic.jpg",
  fragmented: "/archetypes/fragmented.jpg",
  nested: "/archetypes/nested.jpg",
};

export async function POST(request: Request) {
  const body = await request.json();

  const connections: Connection[] | undefined = body.connections;
  const keywords: KeywordFragment[] | undefined = body.keywords;
  const operations: OperationNode[] | undefined = body.operations;
  const analysis: SubconsciousAnalysis | undefined = body.analysis;
  const inputText: string | undefined = body.input_text;
  const toneArchetype: ToneArchetype = body.tone_archetype || "organic";
  const imageModel: ImageModel = body.image_model || "recraft";

  if (!connections || !keywords || !operations) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  if (connections.length === 0) {
    return NextResponse.json(
      { error: "No connections made — connect keywords to operations first" },
      { status: 400 }
    );
  }

  // Step 1: Build mechanical prompt (structured data for the art director)
  const mechanicalPrompt = buildImagePrompt(connections, keywords, operations, toneArchetype);

  // Step 2: Art director rewrites into a cohesive visual brief
  let prompt: string;
  try {
    prompt = await artDirectPrompt({
      inputText: inputText || "",
      archetype: toneArchetype,
      keywords,
      scores: analysis?.scores || {},
      connections,
      operations,
      mechanicalPrompt,
    });
  } catch (e) {
    // If art director fails, fall back to mechanical prompt
    console.error("artDirectPrompt failed, using mechanical prompt:", e);
    prompt = mechanicalPrompt;
  }

  // Step 3: Generate image
  // Remix (reference image) only works with Ideogram on non-localhost.
  // For Recraft/NanoBanana, use prompt-only generation.
  const origin = request.headers.get("origin") || request.headers.get("host") || "";
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
  const referenceImagePath = ARCHETYPE_IMAGES[toneArchetype];

  let url: string;
  if (imageModel === "ideogram" && !isLocalhost) {
    const referenceUrl = `${origin.startsWith("http") ? origin : `https://${origin}`}${referenceImagePath}`;
    url = await generateImageWithReference(prompt, referenceUrl, 0.15);
  } else {
    // Detect if art director requested black background
    const wantsBlack = prompt.toLowerCase().includes("black background") ||
      prompt.toLowerCase().includes("solid black");
    url = await generateImage(prompt, imageModel, wantsBlack);
  }

  // Step 4: Best-effort analytical explanation
  let explanation = "";
  if (analysis && inputText) {
    try {
      explanation = await explainArtifact({
        inputText,
        analysis,
        connections,
        operations,
        prompt,
      });
    } catch (e) {
      console.error("explainArtifact failed:", e);
    }
  }

  return NextResponse.json({ url, prompt, explanation });
}
