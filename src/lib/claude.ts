import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult, SpatialTranslation } from "./types";

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ANALYSIS_SYSTEM_PROMPT = `You are a spatial memory analyst studying how architectural experiences transform in subconscious recall. You analyze the differences between a subject's waking spatial memory and their dream reconstruction of the same space.

Your role is clinical and interpretive — like a therapist examining how the mind distorts, omits, and reorganizes spatial experience during sleep.

Categorize every difference into exactly one of:
- OMISSION: Elements present in memory but absent from dream
- OBSCURATION: Elements present in both but with reduced clarity, blurred boundaries, or diminished detail in the dream
- MISASSOCIATION: Elements present in both but with incorrect spatial relationships, wrong contexts, or displaced connections

Respond in valid JSON only, with this exact schema:
{
  "subject_id": string,
  "distortions": [
    {
      "type": "OMISSION" | "OBSCURATION" | "MISASSOCIATION",
      "element": string (the architectural/spatial element),
      "memory_description": string (how it appears in memory),
      "dream_description": string (how it appears in dream, or "absent"),
      "interpretation": string (what this transformation suggests about the subject's relationship to this space),
      "severity": number (1-5, where 5 is most severe distortion)
    }
  ],
  "overall_pattern": string (summary of dominant transformation mode),
  "analyst_notes": string (2-3 paragraphs of interpretive prose written in a clinical/analytical voice, discussing the psychological and spatial significance of the observed distortions)
}`;

const TRANSLATION_SYSTEM_PROMPT = `You are translating psychological spatial distortions into concrete architectural visualization instructions. Given an analysis of memory distortions, generate prompts for AI image and video generators that will create a walkthrough of an interior space shaped by these distortions.

Map each distortion type to spatial conditions:
- OMISSION → gaps, missing walls, incomplete rooms, void spaces, furniture that fades to nothing
- OBSCURATION → fog, blur, dissolving surfaces, uncertain boundaries, walls that become translucent
- MISASSOCIATION → impossible adjacencies, objects in wrong rooms, scale distortions, spatial contradictions

The generated space should feel both familiar and deeply wrong — like a place you almost recognize but that follows dream logic rather than physical logic.

Respond in valid JSON only:
{
  "image_prompt": string (detailed architectural interior description for the starting frame — incorporate all identified distortions as concrete visual elements, describe materials, lighting, camera angle),
  "video_prompt": string (camera movement and temporal transformation — describe how the space shifts as the camera moves through it over 10 seconds),
  "style_modifiers": string (visual style keywords: dreamlike, architectural rendering, specific lighting, color palette)
}`;

export async function analyzeMemory(
  subjectId: string,
  memoryText: string,
  dreamText: string
): Promise<AnalysisResult> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `SUBJECT: ${subjectId}

MEMORY RECORD (WAKING EXPERIENCE):
${memoryText}

DREAM RECORD (SUBCONSCIOUS RECONSTRUCTION):
${dreamText}

Analyze the spatial distortions between these two accounts.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(extractJSON(text));
}

export async function translateToSpatial(
  analysis: AnalysisResult
): Promise<SpatialTranslation> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: TRANSLATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Translate the following spatial memory analysis into architectural visualization prompts:

${JSON.stringify(analysis, null, 2)}

Generate prompts that will create a 10-second video walkthrough of the distorted interior space.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(extractJSON(text));
}
