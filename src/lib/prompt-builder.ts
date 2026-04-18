import {
  Connection,
  KeywordFragment,
  OperationNode,
  OperationType,
  ToneArchetype,
} from "./types";

// Each archetype describes the starting sculptural form — the "starter shape"
// that operations then manipulate. These are concise so the operations remain
// the dominant signal in the prompt.
// Archetype descriptions define the general shape CHARACTER — abstract enough
// that the image model interprets freely rather than copying a specific reference.
const ARCHETYPE_SHAPE: Record<ToneArchetype, string> = {
  organic:
    "The overall form tendency is soft and rounded — smooth continuous curves, gentle concavities, biomorphic proportions.",
  crystalline:
    "The overall form tendency is angular and faceted — intersecting planes, sharp edges, geometric fractures.",
  twisted:
    "The overall form tendency is coiling and rotational — spiraling bands, torsion around a central axis, frozen mid-turn.",
  skeletal:
    "The overall form tendency is thin and branching — elongated linear members, open voids, minimal mass.",
  monolithic:
    "The overall form tendency is dense and blocky — a heavy compact mass, solid volume, grounded weight.",
  fragmented:
    "The overall form tendency is scattered and dispersed — separated pieces, suspended shards, a form mid-explosion.",
  nested:
    "The overall form tendency is layered and enclosed — concentric shells, cavities within cavities, hidden interiors.",
};

type IntensityTier = "subtle" | "moderate" | "strong" | "extreme";

function tierFromIntensity(v: number): IntensityTier {
  if (v < 0.25) return "subtle";
  if (v < 0.5) return "moderate";
  if (v < 0.75) return "strong";
  return "extreme";
}

// For unipolar ops, score 0-1 maps to distortion intensity (sometimes inverted).
// For bipolar ops, intensity = |score - 0.5| * 2; pole is chosen by score < 0.5.
const OPERATION_INTENSITY: Record<OperationType, (score: number) => number> = {
  clarity: (s) => 1 - s,
  completeness: (s) => 1 - s,
  stability: (s) => 1 - s,
  misassociation: (s) => s,
  vulnerability: (s) => s,
  intimacy: (s) => s,
  temperature: (s) => Math.abs(s - 0.5) * 2,
  pressure: (s) => Math.abs(s - 0.5) * 2,
  luminosity: (s) => Math.abs(s - 0.5) * 2,
  material: (s) => s,
  texture: (s) => s,
  color: (s) => s,
};

// A deliberate user connection must always produce a clearly visible effect.
// Floor is set high so even low-score operations read as "strong" minimum.
const CONNECTION_INTENSITY_FLOOR = 0.65;

function subjectPhrase(kws: KeywordFragment[]): string {
  // For object/person keywords → "the X-element" (a meshed memory-fragment).
  // For abstract keywords (spatial_quality/event/experience) → frame as an
  // aspect of the whole artifact so clauses remain coherent.
  const labelFor = (kw: KeywordFragment): string => {
    if (kw.category === "object" || kw.category === "person") {
      return `the ${kw.text}-element fused into the artifact`;
    }
    return `the artifact's ${kw.text}-aspect`;
  };
  const labels = kws.map(labelFor);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  const last = labels[labels.length - 1];
  return `${labels.slice(0, -1).join(", ")}, and ${last}`;
}

// Each operation produces a clause describing what the VIEWER SEES — written
// as surreal impossible geometry, not as weathering/decay.
const OPERATION_CLAUSE: Record<
  OperationType,
  (subject: string, tier: IntensityTier, intensity: number, score: number) => string
> = {
  clarity: (subject, tier) => {
    // Low clarity = forms losing distinct boundaries and morphing smoothly
    // into neighbouring shapes — topological blending, not visual fog.
    const map = {
      subtle: `${subject} with its boundaries softly blending into neighbouring forms, edges smoothly morphing rather than terminating cleanly`,
      moderate: `${subject} with its silhouette flowing continuously into adjacent forms, the boundary between them becoming a smooth morphological transition instead of a seam`,
      strong: `${subject} whose contour melts organically into the surrounding morphology — no discrete edge, a continuous topological blend where one form becomes another`,
      extreme: `${subject} fully dissolved into a continuous morphological continuum with the rest of the sculpture, no distinct boundary remaining, a single flowing hybrid mass`,
    };
    return map[tier];
  },

  completeness: (subject, tier) => {
    // Form-subtraction via smooth organic carving, not blocky removal.
    const map = {
      subtle: `${subject} with smooth curved hollows scooped organically from its mass, exposing inner morphological cavities`,
      moderate: `${subject} with large flowing sections eroded away in smoothly curved negative volumes, the interior morphology revealed through these openings`,
      strong: `${subject} with most of its mass organically subtracted in sweeping curved voids, the remaining body reading as a partial shell of its original morphology`,
      extreme: `${subject} reduced to a thin continuous skeleton of its original morphology, the rest of the mass smoothly carved away into interconnected cavities`,
    };
    return map[tier];
  },

  stability: (subject, tier, intensity) => {
    const degrees = Math.round(15 + intensity * 45); // 15°–60°
    const map = {
      subtle: `${subject} rotated ${degrees} degrees off-vertical and held there as if gravity has been redirected, casting impossibly sharp shadows`,
      moderate: `${subject} sharply rotated ${degrees} degrees off-vertical, frozen mid-fall, the floor beneath it still flat — an impossible equilibrium`,
      strong: `${subject} tipped ${degrees} degrees off-vertical and suspended there in defiance of gravity, the surrounding floor plane bending up to meet its base`,
      extreme: `${subject} rotated ${degrees} degrees — nearly on its side — and locked into the space as if the whole room's gravity axis has been rotated around it`,
    };
    return map[tier];
  },

  misassociation: (subject, tier) => {
    // Core morph/merge operation — smooth hybridisation, no collage seams.
    const map = {
      subtle: `${subject} smoothly morphing into a foreign form at one edge, the transition between them a continuous organic blend rather than a seam`,
      moderate: `${subject} seamlessly fused with incompatible forms from another context, the hybrid reading as one continuous morphology with smooth transitions between its parts`,
      strong: `${subject} radically cross-fused with unrelated forms into a single uninterrupted composite, surfaces flowing continuously from one morphology into the next with no visible boundary`,
      extreme: `${subject} fully interpenetrated with multiple incompatible forms, all merged into one continuous morphological mass where every shape flows smoothly into every other through organic topological fusion`,
    };
    return map[tier];
  },

  vulnerability: (subject, tier) => {
    const map = {
      subtle: `${subject} with its outer surface rendered partially translucent, inner morphological layers visible beneath through the semi-transparent skin`,
      moderate: `${subject} with its outer surface smoothly peeled back in curving sheets, exposing the flowing interior morphology underneath`,
      strong: `${subject} with its outer surface opened into large organic flaps and curls, the nested interior morphological layers clearly exposed and visible`,
      extreme: `${subject} with its outer surface fully unfurled into smoothly curving petals, revealing deeply nested interior morphological layers radiating outward`,
    };
    return map[tier];
  },

  intimacy: (subject, tier) => {
    // Compression framed as the surrounding morphology pressing in, not walls.
    const map = {
      subtle: `${subject} with the surrounding morphological mass visibly bent inward toward it, the nearby surfaces curving in its direction`,
      moderate: `${subject} squeezed by the surrounding sculptural body — adjacent surfaces smoothly curving inward around it, compressing the negative space to a tight envelope`,
      strong: `${subject} trapped in a collapsing pocket of the surrounding morphology, nearby masses folded inward around it, scale impossibly compressed`,
      extreme: `${subject} almost completely enveloped by the surrounding morphology smoothly closing in around it, scale crushed to near-zero, the form nearly subsumed into the enclosing mass`,
    };
    return map[tier];
  },

  temperature: (subject, tier, _i, score) => {
    const cold = score < 0.5;
    if (cold) {
      const map = {
        subtle: `${subject} with a pale frost forming across its surface, faint condensation visible`,
        moderate: `${subject} encased in a thin shell of ice crystals, cold vapor curling around it`,
        strong: `${subject} deeply frozen, thick jagged ice formations growing outward from its surface, cold blue tint`,
        extreme: `${subject} entirely crystallized into razor-sharp ice, surrounded by freezing vapor, rendered in stark cold-blue tones`,
      };
      return map[tier];
    }
    const map = {
      subtle: `${subject} with its surface visibly radiating heat, subtle heat-shimmer distortion in the air around it`,
      moderate: `${subject} glowing faintly from internal heat, edges beginning to soften, wisps of smoke rising from its surface`,
      strong: `${subject} rendered partially molten, surface liquefying and dripping, glowing orange-red from within`,
      extreme: `${subject} in a state of full incandescence — molten, glowing white-hot, surroundings distorted by extreme heat haze`,
    };
    return map[tier];
  },

  pressure: (subject, tier, _i, score) => {
    const calm = score < 0.5;
    if (calm) {
      const map = {
        subtle: `${subject} rendered with unnaturally smooth, polished surfaces, stillness so complete it reads as frozen`,
        moderate: `${subject} and everything touching it rendered as perfectly smooth, edgeless forms, silence made visual`,
        strong: `${subject} reduced to glassy mirror-finish geometry, reflecting a perfectly still void around it`,
        extreme: `${subject} rendered as a single frictionless obsidian-like form, all detail erased into total smoothness`,
      };
      return map[tier];
    }
    const map = {
      subtle: `${subject} with faint tremor-lines blurring its edges, surfaces finely serrated`,
      moderate: `${subject} rendered with jagged, vibrating outlines, surfaces bristling with sharp irregular spikes`,
      strong: `${subject} fractured into jagged shards, edges razor-sharp, whole form visibly shuddering mid-image`,
      extreme: `${subject} rendered as a violent spike-field of razor-edged fragments, geometry stabbing outward in all directions`,
    };
    return map[tier];
  },

  luminosity: (subject, tier, _i, score) => {
    const dark = score < 0.5;
    if (dark) {
      const map = {
        subtle: `${subject} sitting in pooled shadow, only its silhouette and a few highlights catching light`,
        moderate: `${subject} mostly swallowed by deep shadow, only fragments of its form emerging from blackness`,
        strong: `${subject} nearly consumed by pitch-darkness, a faint rim-light the only trace of its outline`,
        extreme: `${subject} almost entirely absorbed into void-black, a near-silhouette against the surrounding darkness`,
      };
      return map[tier];
    }
    const map = {
      subtle: `${subject} catching unnaturally bright light, highlights blown out, edges bleaching into glow`,
      moderate: `${subject} radiating intense light, surfaces overexposed, halo of glare around its form`,
      strong: `${subject} searing-bright, form partially dissolved by blinding luminance, casting sharp hard-edged rays`,
      extreme: `${subject} rendered as a source of blinding white light, its shape barely discernible behind overpowering glare`,
    };
    return map[tier];
  },

  material: (subject, tier) => {
    const map = {
      subtle: `${subject} appears to be cast from a material subtly informed by the connected keywords — the substance is integral to the form, not applied on top`,
      moderate: `${subject} is visibly made from the physical substance of the connected keywords — the material identity is clear and cohesive throughout the form`,
      strong: `${subject} is unmistakably constituted from the substance of the connected keywords — every surface reads as this material through and through`,
      extreme: `${subject} IS the connected keywords made into solid material — the entire form is a physical casting of these substances, material identity is total and overwhelming`,
    };
    return map[tier];
  },

  texture: (subject, tier) => {
    const map = {
      subtle: `${subject} has a surface quality subtly informed by the connected keywords — a faint tactile character across its skin`,
      moderate: `${subject} has a clearly defined surface texture drawn from the connected keywords — the tactile quality is visible and consistent across the form`,
      strong: `${subject} has an aggressively textured surface dictated by the connected keywords — the grain, roughness, or smoothness dominates the visual reading of the form`,
      extreme: `${subject} is defined by its extreme surface texture drawn from the connected keywords — the tactile quality overwhelms, every millimetre of surface screams this texture`,
    };
    return map[tier];
  },

  color: (subject, tier) => {
    const map = {
      subtle: `${subject} carries a faint chromatic tone informed by the connected keywords — a hint of color emerging from the form`,
      moderate: `${subject} has a clear color identity drawn from the connected keywords — the palette is visible and intentional across the sculpture`,
      strong: `${subject} is saturated with the color language of the connected keywords — vivid, dominant chromatic expression across the entire form`,
      extreme: `${subject} is overwhelmed by the color of the connected keywords — maximally saturated, the chromatic identity is the first thing you see, intense and unavoidable`,
    };
    return map[tier];
  },
};

export function buildImagePrompt(
  connections: Connection[],
  keywords: KeywordFragment[],
  operations: OperationNode[],
  archetype: ToneArchetype = "organic"
): string {
  const keywordMap = new Map(keywords.map((kw) => [kw.id, kw]));
  const operationMap = new Map(operations.map((op) => [op.id, op]));

  // Group connected keyword objects by operation.
  const opToKeywords = new Map<OperationType, KeywordFragment[]>();
  for (const conn of connections) {
    const kw = keywordMap.get(conn.fromKeywordId);
    if (!kw) continue;
    const existing = opToKeywords.get(conn.toOperationId) || [];
    existing.push(kw);
    opToKeywords.set(conn.toOperationId, existing);
  }

  // Build operation clauses — these are the DOMINANT instructions.
  const operationClauses: string[] = [];
  for (const [opId, kws] of opToKeywords.entries()) {
    const op = operationMap.get(opId);
    if (!op) continue;
    const rawIntensity = OPERATION_INTENSITY[opId](op.score);
    const intensity = Math.max(rawIntensity, CONNECTION_INTENSITY_FLOOR);
    const tier = tierFromIntensity(intensity);

    const subject = subjectPhrase(kws);
    operationClauses.push(
      OPERATION_CLAUSE[opId](subject, tier, intensity, op.score)
    );
  }

  // Base shape sources from keywords (text's role = determine starting form).
  const shapeWords = keywords
    .filter((k) => k.category === "spatial_quality" || k.category === "event")
    .map((k) => k.text);
  const materialWords = keywords
    .filter((k) => k.category === "experience")
    .map((k) => k.text);
  const connectedIds = new Set(connections.map((c) => c.fromKeywordId));
  const meshedFragments = keywords
    .filter(
      (k) =>
        connectedIds.has(k.id) &&
        (k.category === "object" || k.category === "person")
    )
    .map((k) => k.text);

  const parts: string[] = [];

  // --- 1. Anchor + archetype base shape ---
  parts.push(
    `A single conceptual sculpture photographed on a completely plain, solid background — either pure white or pure black, nothing else. No environment, no texture on the background, no gradient, no shadows on the ground, no studio props. Just the artifact isolated against a flat solid color. ${ARCHETYPE_SHAPE[archetype]}`
  );

  // --- 2. Keyword-driven refinements to the base shape ---
  const refinements: string[] = [];
  if (shapeWords.length > 0) {
    refinements.push(
      `Gesture inflected by: ${shapeWords.join(", ")}.`
    );
  }
  if (meshedFragments.length > 0) {
    refinements.push(
      `Memory-fragments fused in as abstract allusions: ${meshedFragments.join(", ")}.`
    );
  }
  if (materialWords.length > 0) {
    refinements.push(
      `The sculpture is made from a single cohesive material whose texture, color, and finish are informed by: ${materialWords.join(", ")}. The material is integral to the form — not a texture overlay or surface pattern, but the actual substance the entire sculpture is cast from.`
    );
  }
  if (refinements.length > 0) {
    parts.push(refinements.join(" "));
  }

  // --- 3. Operations — THE DOMINANT SECTION ---
  // This is what the user has wired. These instructions must override everything
  // else. Each operation is a specific, mandatory transformation.
  if (operationClauses.length > 0) {
    parts.push(
      `MANDATORY OPERATIONS — these are the most important instructions. Each operation MUST be clearly and dramatically visible on the artifact. Do not soften, ignore, or let other instructions override these:\n\n${operationClauses.map((c, i) => `${i + 1}. ${c}`).join("\n\n")}`
    );
  }

  // --- 4. Aesthetic guard (minimal) ---
  parts.push(
    "Glitch = smooth morphological fusion between shapes, NOT digital disintegration. No voxels, no pixels, no blocky geometry, no Minecraft aesthetic. The background MUST be completely plain solid white or solid black — no environment, no noise, no scenery, no ground texture. Sharp focus on the artifact only."
  );

  return parts.join("\n\n");
}
