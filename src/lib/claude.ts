import Anthropic from "@anthropic-ai/sdk";
import { SubconsciousAnalysis, KeywordFragment } from "./types";

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ANALYSIS_SYSTEM_PROMPT = `You are analyzing a fragment of subconscious spatial recall. The subject has described a remembered experience — a blend of real memory and dream-state reconstruction. Your role is clinical and interpretive.

Extract two things:

1. KEYWORDS — specific fragments from the text. Categorize each as one of:
   - object: physical things (door, window, chair, water, wall, light)
   - person: people referenced or implied (mother, stranger, child)
   - event: actions, happenings, transitions (falling, opening, flooding)
   - spatial_quality: architectural or spatial descriptors (narrow, vast, dim, tall)
   - experience: sensory or emotional states (cold, fear, comfort, vertigo)

   Extract 8-15 keywords. Prefer concrete, evocative words over generic ones. Each keyword should be 1-3 words maximum.

2. SCORES — rate the overall text on six dimensions, each 0.0 to 1.0:
   - clarity: How clearly defined are the spatial elements? (1 = photographic recall, 0 = pure fog)
   - completeness: How much of the space is accounted for? (1 = total description, 0 = fragments only)
   - stability: How spatially consistent is the description? (1 = fixed geometry, 0 = constantly shifting)
   - misassociation: How much wrong-context blending occurs? (0 = everything in place, 1 = extreme displacement)
   - vulnerability: How exposed or unprotected does the subject feel in the space? (0 = fully shielded, 1 = completely raw)
   - intimacy: How close or compressed is the spatial scale? (0 = vast open expanse, 1 = claustrophobic enclosure)

Respond in valid JSON only, no prose outside the JSON:
{
  "keywords": [
    { "text": string, "category": "object" | "person" | "event" | "spatial_quality" | "experience" }
  ],
  "scores": {
    "clarity": number,
    "completeness": number,
    "stability": number,
    "misassociation": number,
    "vulnerability": number,
    "intimacy": number
  },
  "interpretation": string (1-2 sentences of clinical observation about the dominant spatial distortion pattern)
}`;

export async function analyzeSubconsciousness(
  subjectId: string,
  inputText: string
): Promise<SubconsciousAnalysis> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `SUBJECT: ${subjectId}\n\nSUBCONSCIOUS SPATIAL RECALL:\n${inputText}\n\nExtract keywords and score the six parameters.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(extractJSON(text));

  // Assign IDs and initial positions to keywords
  const keywords: KeywordFragment[] = parsed.keywords.map(
    (kw: { text: string; category: string }, i: number) => ({
      id: `kw-${i}`,
      text: kw.text,
      category: kw.category,
      position: { x: 40, y: 40 + i * 52 },
    })
  );

  return {
    subject_id: subjectId,
    keywords,
    scores: parsed.scores,
    interpretation: parsed.interpretation,
  };
}
