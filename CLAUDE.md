# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Interactive Memory Machine** — Creative Machine Learning (CML) course project, Term 6, SUTD.

- **Team:** Team 10 (4 members: JW, NT, VP, ZH)
- **Owner/Primary Coder:** Zaw Ye Htet (ZH) — architecture student
- **Concept:** Glitch architecture — exploring how spatial memory distorts in the subconscious. The "glitch" is not aesthetic; it represents meaningful distortion of spatial recall.
- **Framing:** Node-based visual programming interface where subjects map their recalled keywords to geometric distortion operations.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Hosting:** Vercel (to be deployed)
- **Text-to-Image:** fal.ai — Recraft V4 Pro (default), Nano Banana Pro, Ideogram V2 (toggleable)
- **Art Director:** Claude API (Haiku) — rewrites mechanical prompt into cohesive visual brief
- **Analysis Agent:** Claude API (Haiku for dev, Sonnet for production) — extracts keywords, scores 12 parameters, classifies tone archetype
- **API Keys:** Stored in `.env.local` (gitignored)

## Pipeline (v2.2 — Art Director)

1. **Input** — User provides subject ID + subconsciousness text (600-char limit)
2. **Analysis** — Claude extracts 8-15 keywords + scores 12 parameters + classifies tone archetype (`/api/analyze`)
3. **Node Mapping** — Interactive canvas: draggable keyword chips on left, 12 operation nodes on right. User wires keywords to operations via bezier connections.
4. **Art Director** — Claude reads full context (text, archetype, connections, scores) and writes a cohesive visual prompt
5. **Generation** — fal.ai generates image from art-directed prompt (`/api/generate-image`). Model selectable via UI toggle.
6. **Explanation** — Claude generates accessible, conversational explanation of the artifact
7. **Output** — Generated image + explanation displayed

### 7 Tone Archetypes (starter shapes)

| Archetype | Mood | Form Tendency |
|-----------|------|---------------|
| Organic | Calm, nostalgic | Smooth biomorphic curves |
| Crystalline | Tense, anxious | Angular faceted planes |
| Twisted | Disorienting, dynamic | Coiling spirals |
| Skeletal | Vulnerable, exposed | Thin branching members |
| Monolithic | Oppressive, heavy | Dense compact mass |
| Fragmented | Chaotic, traumatic | Scattered suspended shards |
| Nested | Introspective, intimate | Concentric layered shells |

Reference images for each archetype stored in `public/archetypes/`.

### 12 Operation Nodes

**SPATIAL (unipolar 0-1):**

| Node | Operation | Effect |
|------|-----------|--------|
| Clarity | Boundary Diffusion | Dissolves edges, merges into neighbours |
| Completeness | Mass Subtraction | Carves away volume with voids and hollows |
| Stability | Gravitational Shift | Tilts and suspends off-axis |
| Misassociation | Cross-Morphology Fusion | Merges incompatible shapes into one body |
| Vulnerability | Interior Reveal | Peels open surfaces, exposes inner layers |
| Intimacy | Scale Compression | Surrounding mass folds inward, crushing scale |

**EXPERIENCE (bipolar, 0.5 = neutral):**

| Node | Operation | Effect |
|------|-----------|--------|
| Temperature | Freeze ↔ Melt | Low: ice/frost, High: molten flow |
| Pressure | Smooth ↔ Shatter | Low: glassy polish, High: jagged spikes |
| Luminosity | Shadow ↔ Radiance | Low: consumed by darkness, High: blinding glow |

**APPEARANCE (unipolar 0-1):**

| Node | Operation | Effect |
|------|-----------|--------|
| Material | Substance Identity | Connected keywords define physical material |
| Texture | Surface Grain | Connected keywords set roughness/smoothness |
| Color | Chromatic Palette | Connected keywords drive palette and saturation |

## Key Files

- `src/lib/types.ts` — TypeScript interfaces (KeywordFragment, OperationNode, Connection, SubconsciousAnalysis, ToneArchetype, ImageModel, CanvasState, SessionData)
- `src/lib/claude.ts` — Claude API: analysis, art director prompt, post-generation explanation
- `src/lib/prompt-builder.ts` — Builds mechanical prompt from connections + scores + archetype
- `src/lib/fal.ts` — fal.ai client: Recraft V4 Pro, Nano Banana Pro, Ideogram V2, remix endpoint
- `src/app/page.tsx` — Main page with useReducer state management + model selector
- `src/app/api/analyze/` — Claude analysis endpoint
- `src/app/api/generate-image/` — Art director + image generation endpoint
- `src/components/NodeCanvas.tsx` — Main canvas with SVG wire layer, auto-height, scrollable
- `src/components/KeywordFragment.tsx` — Draggable keyword chips with category shapes + drop-shadow highlights
- `src/components/OperationNode.tsx` — 12 operation nodes with score bars, descriptions, subtexts
- `src/components/ConnectionWire.tsx` — SVG bezier wire paths
- `src/components/GenerateButton.tsx` — Generate button with connection count
- `src/components/InputForm.tsx` — Single textarea input form (600-char limit)

## Development

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
```

## Project Status

- **2026-03-28:** v1 pipeline scaffolded (memory+dream → analysis → image → video). All APIs working.
- **2026-04-14:** v2 major pivot — node-based visual programming UI. 10 nodes, Ideogram v2, morphological-fusion aesthetic. Instructor-validated.
- **2026-04-18/19:** v2.2 — Art director pipeline, 12 nodes (substance split into material/texture/color), tone archetypes with reference images, multi-model support (Recraft V4 Pro / Nano Banana Pro / Ideogram V2), accessible explanations, sculptural-plausibility constraints for 3D conversion.
- **Next:** Deploy to Vercel (enables reference image remix), tune art director, 3D output pipeline.

## Workflow Guidelines

- Commit frequently with clean, descriptive messages.
- Update this CLAUDE.md as work progresses.
- API keys are in `.env.local` — never commit these.
- Default to Recraft V4 Pro (clean backgrounds via API param). Ideogram for remix.
- Currently using Claude Haiku for dev. Switch to Sonnet for production.
- Output must be physically plausible sculpture (3D-convertible), not abstract 2D composition.
