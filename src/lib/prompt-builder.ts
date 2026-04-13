import {
  Connection,
  KeywordFragment,
  OperationNode,
  OperationType,
} from "./types";

/**
 * Maps each operation to a geometric distortion description.
 * The score scales the intensity: some operations are "high = more distortion"
 * and others are "low = more distortion".
 */
const OPERATION_PROMPTS: Record<
  OperationType,
  (keywords: string[], score: number) => string
> = {
  clarity: (keywords, score) => {
    const intensity = 1 - score; // low clarity = more distortion
    if (intensity < 0.2) return "";
    return `The ${keywords.join(", ")} ${keywords.length > 1 ? "have" : "has"} severely degraded edge resolution — boundaries dissolving into ${Math.round(intensity * 100)}% fog, surfaces losing fidelity, forms becoming uncertain silhouettes that blur into the surrounding void.`;
  },

  completeness: (keywords, score) => {
    const intensity = 1 - score; // low completeness = more missing
    if (intensity < 0.2) return "";
    return `The ${keywords.join(", ")} ${keywords.length > 1 ? "are" : "is"} ${Math.round(intensity * 100)}% subtracted — missing mass, carved-out voids where solid form should be, incomplete geometry with hollow gaps exposing inner structure or emptiness.`;
  },

  stability: (keywords, score) => {
    const intensity = 1 - score; // low stability = more tilt
    if (intensity < 0.2) return "";
    return `The ${keywords.join(", ")} ${keywords.length > 1 ? "are" : "is"} displaced from true vertical — tilted ${Math.round(intensity * 45)} degrees, center of gravity shifted, structural equilibrium broken, as if the ground plane itself has warped.`;
  },

  misassociation: (keywords, score) => {
    if (score < 0.2) return "";
    return `The ${keywords.join(", ")} ${keywords.length > 1 ? "are" : "is"} colliding with foreign elements — ${Math.round(score * 100)}% hybridized, merged with wrong-context objects, impossible material fusions, spatial contradictions where incompatible things occupy the same volume.`;
  },

  vulnerability: (keywords, score) => {
    if (score < 0.2) return "";
    return `The ${keywords.join(", ")} ${keywords.length > 1 ? "have" : "has"} become porous — shell thickness reduced to ${Math.round((1 - score) * 100)}%, surfaces perforated, interior exposed, structural skin peeling away to reveal raw underlying layers.`;
  },

  intimacy: (keywords, score) => {
    if (score < 0.2) return "";
    return `The ${keywords.join(", ")} ${keywords.length > 1 ? "are" : "is"} compressed inward — cavity size crushed to ${Math.round((1 - score) * 100)}% of original volume, walls closing in, spatial scale collapsed into claustrophobic proximity.`;
  },
};

export function buildImagePrompt(
  connections: Connection[],
  keywords: KeywordFragment[],
  operations: OperationNode[]
): string {
  const keywordMap = new Map(keywords.map((kw) => [kw.id, kw]));
  const operationMap = new Map(operations.map((op) => [op.id, op]));

  // Group connections by operation
  const opToKeywords = new Map<OperationType, string[]>();
  for (const conn of connections) {
    const kw = keywordMap.get(conn.fromKeywordId);
    if (!kw) continue;
    const existing = opToKeywords.get(conn.toOperationId) || [];
    existing.push(kw.text);
    opToKeywords.set(conn.toOperationId, existing);
  }

  // Find unconnected keywords
  const connectedIds = new Set(connections.map((c) => c.fromKeywordId));
  const unconnectedKeywords = keywords
    .filter((kw) => !connectedIds.has(kw.id))
    .map((kw) => kw.text);

  // Build distortion clauses
  const clauses: string[] = [];
  for (const [opId, kwTexts] of opToKeywords.entries()) {
    const op = operationMap.get(opId);
    if (!op) continue;
    const promptFn = OPERATION_PROMPTS[opId];
    const clause = promptFn(kwTexts, op.score);
    if (clause) clauses.push(clause);
  }

  // Compose final prompt
  const parts: string[] = [
    "An architectural interior rendered as a spatial memory artifact — a cube-derived form that has been deformed by subconscious distortion.",
    "",
  ];

  if (clauses.length > 0) {
    parts.push("DISTORTIONS:");
    parts.push(...clauses);
    parts.push("");
  }

  if (unconnectedKeywords.length > 0) {
    parts.push(
      `NEUTRAL ELEMENTS (present but undistorted): ${unconnectedKeywords.join(", ")}.`
    );
    parts.push("");
  }

  parts.push(
    "STYLE: Monochrome architectural rendering, clinical lighting, concrete and void, spatial glitch as meaningful distortion of recalled space — not decorative but structural. The space should feel like a memory that has been corrupted by the subconscious — familiar geometry made wrong."
  );

  return parts.join("\n");
}
