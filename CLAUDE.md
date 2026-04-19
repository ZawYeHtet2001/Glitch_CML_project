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
- **Image-to-3D:** fal.ai — Trellis (default, ~$0.02, `fal-ai/trellis`), Hunyuan3D V3 (~$0.16, PBR, `fal-ai/hunyuan3d-v3/image-to-3d`) (toggleable)
- **Art Director:** Claude API (Haiku) — rewrites mechanical prompt into cohesive visual brief
- **Analysis Agent:** Claude API (Haiku for dev, Sonnet for production) — extracts keywords, scores 12 parameters, classifies tone archetype
- **Artifact Naming + Explanation:** Claude API (Haiku) — returns `{ name, explanation }` JSON; name drives filename for 3D exports
- **3D Viewer:** React Three Fiber + drei (OrbitControls, Bounds, Center, Grid, GizmoHelper, Environment presets)
- **3D Exports:** GLB (native from fal), OBJ + STL (client-side via `three-stdlib` exporters)
- **API Keys:** Stored in `.env.local` (gitignored)

## Pipeline (v2.4 — Full 2D→3D loop + mechanical/subconscious UI)

1. **Input** — User provides subject ID + subconsciousness text (600-char limit)
2. **Analysis** — Claude extracts 8-15 keywords + scores 12 parameters + classifies tone archetype (`/api/analyze`)
3. **Node Mapping** — Interactive canvas: draggable keyword chips on left, 12 operation nodes on right. User wires keywords to operations via bezier connections.
4. **Art Director** — Claude reads full context (text, archetype, connections, scores) and writes a cohesive visual prompt
5. **Generation** — fal.ai generates image from art-directed prompt (`/api/generate-image`). Model selectable via UI toggle.
6. **Naming + Explanation** — Claude returns `{ name, explanation }` JSON. Name is editable, drives 3D export filenames.
7. **Output** — Generated image + editable title + explanation displayed
8. **Image → 3D (optional)** — User clicks VIEW IN 3D. fal.ai Trellis or Hunyuan3D V3 reconstructs a GLB mesh (`/api/generate-3d`). Model toggle stays visible for regenerate.
9. **3D Viewer** — React Three Fiber viewport with orbit/zoom/pan, ground grid, axis gizmo, STUDIO↔MOODY lighting toggle (HDRI-backed, ACES tone mapping).
10. **Export** — GLB (native), OBJ (client-side), STL (client-side, binary for 3D-print slicers). Filename = slugified artifact name.

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

## UI Theme — Mechanical / Subconscious Duality

Two-state identity drives all animation decisions:

- **ACTIVE (input/mapping/generating):** Mechanical, precise, robotic. Scan bars, elapsed counters, telemetry glyphs, wire draw-in, badge pop, connected-node breath. EB Garamond serif for artifact name (museum-label feel).
- **IDLE (input screen only, ≥12s no input):** Subconscious decay. Random letter-fall on headings, gold scan line sweep, periodic TV glitch (chromatic aberration + jitter + tear bar), one-time deep glitch burst at 35s. All effects halt immediately on input and are gated to `session.status === "input"` only.

Film-grain SVG overlay (~6% opacity) is always on, even during active states.

## Easter Eggs

- **Konami code** (↑↑↓↓←→←→BA on input screen): fills SUBJECT="DEV" + a hand-tuned grandfather-workshop recall memory. Handy as a demo shortcut.
- **Midnight mode** (00:00–04:00 local): subtitle swaps to "SUBCONSCIOUS CHANNEL OPEN — NIGHT SHIFT".
- **Long-idle deep glitch**: one bigger burst at 35s into idle, resets on next idle session.

## Key Files

- `src/lib/types.ts` — TypeScript interfaces (KeywordFragment, OperationNode, Connection, SubconsciousAnalysis, ToneArchetype, ImageModel, Model3D, CanvasState, SessionData incl. artifact_name + model_3d_url)
- `src/lib/claude.ts` — Claude API: analysis, art director prompt, `explainArtifact` returns `{ name, explanation }`
- `src/lib/prompt-builder.ts` — Builds mechanical prompt from connections + scores + archetype
- `src/lib/fal.ts` — fal.ai client: Recraft V4 Pro, Nano Banana Pro, Ideogram V2, remix, Trellis, Hunyuan3D V3
- `src/app/layout.tsx` — Loads fonts (JetBrains Mono, Inter, EB Garamond) + renders GrainOverlay
- `src/app/page.tsx` — Main page: useReducer state, idle detection gated to input screen, mechanical loader, midnight-mode subtitle, TV glitch scheduler
- `src/app/globals.css` — All keyframes (glitch-fall, idle-scan, tv-glitch-content, tv-glitch-content-deep, tv-tear, scan-bar, wire-draw, node-breath, badge-pop)
- `src/app/api/analyze/` — Claude analysis endpoint
- `src/app/api/generate-image/` — Art director + image generation + naming endpoint
- `src/app/api/generate-3d/` — fal.ai Trellis / Hunyuan3D reconstruction endpoint
- `src/components/NodeCanvas.tsx` — Main canvas with SVG wire layer, auto-height, scrollable
- `src/components/KeywordFragment.tsx` — Draggable keyword chips with category shapes + drop-shadow highlights
- `src/components/OperationNode.tsx` — 12 operation nodes with score bars, subtexts, connected-node breath, badge pop
- `src/components/ConnectionWire.tsx` — SVG bezier wire paths with draw-in animation
- `src/components/GenerateButton.tsx` — Generate button with connection count
- `src/components/InputForm.tsx` — Single textarea input form with Konami code integration
- `src/components/GlitchIdle.tsx` — Wraps text; fires letter-fall animations when idle
- `src/components/MechanicalLoader.tsx` — Elapsed counter + scan bar + telemetry glyphs + frame counter
- `src/components/Model3DViewer.tsx` — R3F canvas with OrbitControls, Bounds, Center, Grid, GizmoHelper, Environment, STUDIO↔MOODY lighting toggle, GLB/OBJ/STL export
- `src/components/GrainOverlay.tsx` — Fixed-position SVG noise film grain
- `src/hooks/useIdle.ts` — Detects inactivity across mousemove/keydown/scroll/touch/wheel
- `src/hooks/useKonamiCode.ts` — Konami sequence detector

## Development

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
```

## Project Status

- **2026-03-28:** v1 pipeline scaffolded (memory+dream → analysis → image → video). All APIs working.
- **2026-04-14:** v2 major pivot — node-based visual programming UI. 10 nodes, Ideogram v2, morphological-fusion aesthetic. Instructor-validated.
- **2026-04-18/19:** v2.2 — Art director pipeline, 12 nodes, tone archetypes with reference images, multi-model 2D.
- **2026-04-20 (v2.3):** Full 3D pipeline shipped. Trellis/Hunyuan3D via fal.ai, R3F viewer with lighting toggle, GLB/OBJ/STL export, editable artifact names. Teammates already 3D-printed outputs.
- **2026-04-20 (v2.4):** UI polish pass — idle/subconscious glitch effects (letter fall, scan line, TV glitch, deep burst), mechanical loaders (elapsed counter + scan bar + telemetry), node canvas polish (wire draw-in, breath glow, badge pop), 3D viewport grid + axis gizmo, EB Garamond serif, film grain overlay, easter eggs (Konami / midnight mode).
- **Next:** Final crit Tuesday 2026-04-21 evening. Monday night = last polish + demo rehearsal. No new features after that window.

## Workflow Guidelines

- Commit frequently with clean, descriptive messages.
- Update this CLAUDE.md as work progresses.
- API keys are in `.env.local` — never commit these.
- Default to Recraft V4 Pro (clean backgrounds via API param). Ideogram for remix.
- Currently using Claude Haiku for dev. Switch to Sonnet for production.
- Output must be physically plausible sculpture (3D-convertible), not abstract 2D composition.
