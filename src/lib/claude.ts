import Anthropic from "@anthropic-ai/sdk";
import type {
  SubconsciousAnalysis,
  KeywordFragment,
  Connection,
  OperationNode,
  ToneArchetype,
} from "./types";

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // SDK defaults are 10min timeout + 2 retries. For interactive use, fail
  // fast — a hung analyze should surface as an error, not a stalled UI.
  timeout: 30_000,
  maxRetries: 1,
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

2. SCORES — rate the text on ten dimensions, each 0.0 to 1.0.

   SPATIAL (unipolar — 0 = none of this quality, 1 = extreme of this quality):
   - clarity: How clearly defined are the spatial elements? (1 = photographic recall, 0 = pure fog)
   - completeness: How much of the space is accounted for? (1 = total description, 0 = fragments only)
   - stability: How spatially consistent is the description? (1 = fixed geometry, 0 = constantly shifting)
   - misassociation: How much wrong-context blending occurs? (0 = everything in place, 1 = extreme displacement)
   - vulnerability: How exposed or unprotected does the subject feel? (0 = fully shielded, 1 = completely raw)
   - intimacy: How close or compressed is the spatial scale? (0 = vast open expanse, 1 = claustrophobic enclosure)

   EXPERIENCE (bipolar — 0.5 = neutral, 0 and 1 are OPPOSITE extremes):
   - temperature: Felt thermal quality. (0 = extremely cold / frozen, 0.5 = neutral, 1 = extremely hot / molten)
   - pressure: Felt emotional intensity. (0 = completely calm / still, 0.5 = neutral, 1 = extreme anxiety / tension)
   - luminosity: Felt light level. (0 = pitch-dark, 0.5 = neutral, 1 = blindingly bright)

   APPEARANCE (unipolar — 0 = absent/neutral, 1 = extremely vivid/dominant):
   - material: How strongly does the text evoke a specific physical substance? (0 = no material identity, 1 = the text is saturated with a specific material — concrete, glass, water, skin, metal, fabric)
   - texture: How much surface quality does the text convey? (0 = perfectly smooth / no surface detail, 1 = richly textured — rough, porous, fibrous, granular, cracked, polished, etc.)
   - color: How chromatically vivid is the text? (0 = achromatic / no color mentioned, 1 = saturated and specific color language — red, blue, golden, iridescent, etc.)

3. TONE ARCHETYPE — classify the overall mood/tone of the text into exactly one shape archetype. This determines the starting sculptural form before any operations are applied. Choose the one that best captures the dominant emotional register:
   - "organic": calm, nostalgic, contemplative, gentle — smooth rounded biomorphic forms with soft curves and gentle hollows
   - "crystalline": tense, anxious, fractured, sharp — hard-edged faceted planes intersecting at angles
   - "twisted": disorienting, dynamic, transitional, restless — coiling spiraling forms frozen mid-rotation
   - "skeletal": vulnerable, exposed, lonely, bare — thin elongated branching forms, all structure and no mass
   - "monolithic": oppressive, weighty, grounded, immovable — dense heavy compact solid mass
   - "fragmented": chaotic, traumatic, explosive, shattered — forms breaking apart mid-scatter, suspended fragments
   - "nested": introspective, intimate, hidden, layered — concentric shells with cavities within cavities

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
    "intimacy": number,
    "temperature": number,
    "pressure": number,
    "luminosity": number,
    "material": number,
    "texture": number,
    "color": number
  },
  "tone_archetype": "organic" | "crystalline" | "twisted" | "skeletal" | "monolithic" | "fragmented" | "nested",
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
    tone_archetype: parsed.tone_archetype || "organic",
    interpretation: parsed.interpretation,
  };
}

// --- Art Director: rewrites mechanical prompt into cohesive visual brief ---

const ART_DIRECTOR_SYSTEM_PROMPT = `You are the art director for the Interactive Memory Machine — a system that produces conceptual sculptural artifacts from subconscious spatial recall.

You will receive:
- The subject's original text (a fragment of spatial memory)
- The detected tone archetype (the starting sculptural form tendency)
- All extracted keywords with categories
- All scored parameters (12 dimensions)
- The user's wired connections (which keywords they linked to which operations)
- A mechanical prompt draft with operation clauses

Your job: REWRITE this into a single, cohesive, vivid image prompt that an AI image generator (Ideogram v2) will execute. You are translating the full pipeline into one unified visual description.

CRITICAL RULES:
1. The output is a SINGLE conceptual sculpture — a physically coherent, three-dimensional object that looks like it could be 3D-printed, cast, or CNC-milled. It must have clear volume, defined mass, and a readable silhouette. NOT a flat abstract painting, NOT a 2D composition, NOT a collage of floating elements. Think: something you could walk around in a gallery and photograph from any angle.
2. Background MUST be completely plain — solid pure white or solid pure black. No environment, no ground texture, no gradient, no props. Professional studio product photography with even lighting.
3. The user's wired CONNECTIONS are the most important thing. Operations that have connections MUST be dramatically visible. Operations with NO connections should NOT appear.
4. Think about how operations INTERACT. If "water" is connected to MATERIAL and the temperature score is cold (< 0.5), the sculpture should look like frozen water — not water + ice separately. Synthesize, don't list.
5. Glitch = smooth morphological fusion. Shapes merging continuously into each other. NOT pixel glitch, NOT digital artifacts, NOT voxels, NOT Minecraft. Smooth, organic, topological deformation — but always maintaining a solid, sculptural, three-dimensional form.
6. Material, texture, and color should feel INTEGRAL to the form — as if the sculpture was cast from this substance, not painted or textured on top.
7. Write in vivid, visual language that an image model can render. Describe what the camera SEES, not abstract concepts. Emphasise physical qualities: weight, volume, surface, edges, how light falls on it.
8. Keep the prompt between 150-300 words. Dense, specific, no filler.
9. Do NOT include any preamble, explanation, or formatting. Output ONLY the image prompt text.
10. Absolutely NO: animals, people, buildings, rooms, interiors, furniture, domestic scenes, decay, dilapidation.
11. The sculpture must look MANUFACTURABLE — it should have a base or grounded stance, continuous connected geometry (no disconnected floating pieces), and clear physical structure. Abstract yes, but physically plausible. Imagine it sitting on a plinth in a gallery.`;

interface ArtDirectorInput {
  inputText: string;
  archetype: ToneArchetype;
  keywords: KeywordFragment[];
  scores: Record<string, number>;
  connections: Connection[];
  operations: OperationNode[];
  mechanicalPrompt: string;
}

export async function artDirectPrompt({
  inputText,
  archetype,
  keywords,
  scores,
  connections,
  operations,
  mechanicalPrompt,
}: ArtDirectorInput): Promise<string> {
  const keywordMap = new Map(keywords.map((k) => [k.id, k]));

  const connectionLines = connections
    .map((c) => {
      const kw = keywordMap.get(c.fromKeywordId);
      const op = operations.find((o) => o.id === c.toOperationId);
      if (!kw || !op) return null;
      return `"${kw.text}" (${kw.category}) → ${op.label} (score ${op.score.toFixed(2)})`;
    })
    .filter(Boolean)
    .join("\n");

  const keywordLines = keywords
    .map((k) => `${k.text} [${k.category}]`)
    .join(", ");

  const scoreLines = Object.entries(scores)
    .map(([k, v]) => `${k}: ${(v as number).toFixed(2)}`)
    .join(", ");

  const userMessage = `ORIGINAL TEXT:
${inputText}

TONE ARCHETYPE: ${archetype}

KEYWORDS: ${keywordLines}

SCORES: ${scoreLines}

USER'S WIRED CONNECTIONS (these are the DOMINANT operations — must be clearly visible):
${connectionLines || "(none)"}

MECHANICAL PROMPT DRAFT (use as reference, but rewrite into a cohesive vision):
${mechanicalPrompt}

Rewrite this into a single, cohesive image prompt. Synthesize the operations — don't just list them. Make the connections feel like one integrated sculptural vision.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    system: ART_DIRECTOR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

// --- Post-generation analytical interpretation ---

const EXPLANATION_SYSTEM_PROMPT = `You are the storyteller for the Interactive Memory Machine — a system where people write about a memory, and the machine turns it into a sculptural artifact.

You will be given:
- What the person wrote (their memory)
- Keywords the machine extracted from their writing
- The connections they chose (which words they linked to which shape operations)
- The prompt that was used to generate the image

You must produce TWO things:

1. A NAME for the artifact — short, evocative, personal. Like a title a museum curator would give a piece. Rules:
   - 2 to 5 words
   - Title Case
   - Must feel intimate and specific to THIS memory (draw from the person's own imagery — a specific object, a sensation, a place)
   - Poetic but grounded — not abstract philosophy, not a generic mood label
   - No quotation marks, no punctuation (no period, no colon, no dash)
   - Good examples: "The Cedar Chest", "Fluorescent Afternoon", "My Mother's Watch", "The Glass Door"
   - Bad examples: "Nostalgia", "Memory #1", "An Exploration of Loss", "Sculpture One"

2. An EXPLANATION — a short, warm paragraph (2-3 paragraphs, roughly 120-180 words) that helps the person understand what happened — how their words became this sculpture. Speak directly to them using "your" and "you."

Cover these naturally in the explanation (don't use headers or bullet points):
- What feeling or mood the machine picked up from their writing, and how that shaped the starting form
- What their specific connections did — explain each operation in plain language (e.g. "you connected 'water' to Material, so the sculpture looks like it's made of water" rather than "the material operation with score 0.72 produced...")
- What the final sculpture represents as a whole — tie it back to their original memory

Tone: conversational, thoughtful, accessible. Like a museum guide speaking to a visitor, not an academic paper. No jargon, no scores, no technical parameter names. Use the actual words from their writing.

Respond in valid JSON only, no prose outside the JSON:
{
  "name": string,
  "explanation": string
}`;

interface ExplanationInput {
  inputText: string;
  analysis: SubconsciousAnalysis;
  connections: Connection[];
  operations: OperationNode[];
  prompt: string;
}

export async function explainArtifact({
  inputText,
  analysis,
  connections,
  operations,
  prompt,
}: ExplanationInput): Promise<{ name: string; explanation: string }> {
  const keywordMap = new Map(analysis.keywords.map((k) => [k.id, k]));
  // Plain-language operation descriptions for the explanation
  const OP_PLAIN: Record<string, string> = {
    clarity: "Dissolve (blurs and merges edges)",
    completeness: "Erode (carves away mass)",
    stability: "Tilt (shifts gravity, suspends off-axis)",
    misassociation: "Fuse (merges incompatible shapes together)",
    vulnerability: "Expose (peels open surfaces to reveal interior)",
    intimacy: "Compress (collapses surrounding space inward)",
    temperature: "Thermal (freezes or melts the form)",
    pressure: "Tension (makes surfaces smooth-calm or jagged-shattered)",
    luminosity: "Light (darkens into shadow or brightens to glare)",
    material: "Material (sets what the sculpture is made from)",
    texture: "Texture (sets the surface feel)",
    color: "Color (sets the color palette)",
  };

  const connectionLines = connections
    .map((c) => {
      const kw = keywordMap.get(c.fromKeywordId);
      const op = operations.find((o) => o.id === c.toOperationId);
      if (!kw || !op) return null;
      const plainOp = OP_PLAIN[op.id] || op.label;
      return `- "${kw.text}" → ${plainOp}`;
    })
    .filter(Boolean)
    .join("\n");

  const keywordLines = analysis.keywords
    .map((k) => k.text)
    .join(", ");

  const userMessage = `WHAT THE PERSON WROTE:
${inputText}

KEYWORDS THE MACHINE FOUND:
${keywordLines}

MOOD DETECTED: ${analysis.tone_archetype || "organic"}

CONNECTIONS THE PERSON MADE (which words they linked to which shape operations):
${connectionLines || "(none)"}

IMAGE PROMPT USED:
${prompt}

Write the explanation for the person.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    system: EXPLANATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  try {
    const parsed = JSON.parse(extractJSON(text));
    return {
      name: typeof parsed.name === "string" ? parsed.name : "Untitled Artifact",
      explanation:
        typeof parsed.explanation === "string" ? parsed.explanation : "",
    };
  } catch {
    return { name: "Untitled Artifact", explanation: text };
  }
}
