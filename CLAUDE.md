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

## Pipeline (v2.5 — CRT phosphor UI, hardened fal + Anthropic clients)

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

## UI Theme — Retro CRT terminal (v2.5 lean machine)

A single cohesive retro-computing aesthetic. The heavy bone-chassis / physical-machine chrome was removed in v2.5 to free GPU memory after `THREE.WebGLRenderer: Context Lost` errors on long sessions.

- **Chrome:** Two thin 32px horizontal bars — top shows `INTERACTIVE MEMORY MACHINE · IMM-0497 · v2.4 · CH.01` + PWR/TX/RCV LED trio. Bottom shows team/models + `5V/2.1A · COOL 41°C · T+elapsed`. All amber phosphor on a near-black strip with a thin amber hairline border.
- **Viewports:** Thin 1px amber border, transparent background, small amber `machine-viewport-label` tab on top-left and `machine-viewport-id` + LED on top-right. No bone bezel, no chamfered corners, no chrome screws.
- **CRT inner (phosphor panels):** `.viewport-inner` — recessed dark warm-amber radial gradient + horizontal scanlines at 4px step + slow beam sweep. VT323 amber phosphor text with glow. Used for: SUBJECT readout, SUBCONSCIOUS RECALL log, INTERPRETATION, loader.
- **Non-CRT panels:** ARTIFACT / 2D uses `crt={false} chamber={false}` for a crisp black-matte frame; ARTIFACT / 3D uses `crt={false} chamber={false}` with an inner dark panel (var(--background)) so yesterday's Model3DViewer runs on its original dark canvas.
- **Idle (input screen only, ≥12s no input):** letter-fall, gold scan sweep, periodic TV glitch, 35s deep burst. Gated to `session.status === "input"`.
- **Fonts:** VT323 (CRT phosphor text), Share Tech Mono (stencil labels), JetBrains Mono (data), EB Garamond (italic artifact name).
- **Film grain** SVG overlay ~5% opacity, no mix-blend-mode.

## Performance hardening (v2.5)

A night of WebGL context loss + CPU 70% on hunyuan view led to these cuts:

- `Model3DViewer`: listens for `webglcontextlost` → auto-remounts Canvas with new key after 300ms.
- Canvas `dpr` dropped from `[1, 2]` → `[1, 1.5]`; `failIfMajorPerformanceCaveat: false`.
- LED pulse animates `opacity` only (GPU composite), not `box-shadow` (CPU paint).
- `node-connected-breath` is a static glow now, no animated box-shadow.
- GrainOverlay: no `mix-blend-mode` — plain `opacity: 0.05`.
- Scanline overlays: plain `rgba` stripes (no `mix-blend-mode: multiply`) at 4px step.
- `MechanicalLoader`: elapsed 250ms, noise 320ms (was 100ms/140ms).
- `ChassisFrame`: telemetry values updated via `useRef` + `textContent` — no React re-renders per tick.
- Removed: matrix-rain columns, running ticker scroll, bone corner plates, side rails with knobs, speaker grille, arcade button pad, vents, rivets.
- `@media (prefers-reduced-motion: reduce)` disables remaining decorative animations.

## Resilience (v2.5)

- **Anthropic client:** `timeout: 30_000`, `maxRetries: 1` — fails fast on transient 429/529s instead of silently retrying for 10min.
- **fal client:** `withTimeout()` wrapper caps trellis at 6min, hunyuan at 10min. `logs: true` + `onQueueUpdate` streams fal queue status to Next.js terminal. Hunyuan uses `generate_type: "Normal"` (valid enum) + `face_count: 500000` (matches teammates' 3D-print quality).
- Full-screen chassis now `z-index: 50` (above `<main>` at `z-index: 10`) so scrolling content is masked by the thin top/bottom strips.

## Easter Eggs

- **Konami code** (↑↑↓↓←→←→BA on input screen): fills SUBJECT="DEV" + a hand-tuned grandfather-workshop recall memory. Handy as a demo shortcut.
- **Midnight mode** (00:00–04:00 local): subtitle swaps to "SUBCONSCIOUS CHANNEL OPEN — NIGHT SHIFT".
- **Long-idle deep glitch**: one bigger burst at 35s into idle, resets on next idle session.

## Key Files

- `src/lib/types.ts` — TypeScript interfaces (KeywordFragment, OperationNode, Connection, SubconsciousAnalysis, ToneArchetype, ImageModel, Model3D, CanvasState, SessionData incl. artifact_name + model_3d_url)
- `src/lib/claude.ts` — Claude API: analysis, art director prompt, `explainArtifact` returns `{ name, explanation }`. Client has `timeout: 30_000`, `maxRetries: 1`.
- `src/lib/prompt-builder.ts` — Builds mechanical prompt from connections + scores + archetype
- `src/lib/fal.ts` — fal.ai client: Recraft V4 Pro, Nano Banana Pro, Ideogram V2, remix, Trellis, Hunyuan3D V3. `withTimeout` wrapper + `logs: true` + `onQueueUpdate` for all 3D calls.
- `src/app/layout.tsx` — Loads fonts (JetBrains Mono, Inter, EB Garamond, Share Tech Mono, VT323) + renders ChassisFrame + GrainOverlay
- `src/app/page.tsx` — Main page: useReducer state, idle detection gated to input screen, mechanical loader, midnight-mode subtitle, TV glitch scheduler. Content in `<main>` with padding 56/32/64/32 so thin chassis bars don't overlap.
- `src/app/globals.css` — Keyframes + machine classes (viewport, CRT scanlines, phosphor, serial log, wire-draw 3000px dasharray, led pulse opacity-only, prefers-reduced-motion overrides).
- `src/components/ChassisFrame.tsx` — **Lean v2.5**: two thin 32px top/bottom bars with IMM ID + LEDs + telemetry. Telemetry via `useRef + textContent` (no re-renders).
- `src/components/MachineViewport.tsx` — Thin amber-border viewport wrapper with `crt` / `chamber` / `phosphor` prop switches for CRT-phosphor / dark-chamber / flat modes.
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
- **2026-04-21 (v2.5 — crit-night):** Full retro-CRT aesthetic pass. Added VT323 + Share Tech Mono fonts, amber phosphor treatment, scanline overlays, cryptic serial-log cycling in loader, ASCII progress bar, tactile buttons with LED indicators, terminal-style input prompts. Hardened Anthropic and fal clients with timeouts + retry caps after hung 3D call. Iterated through heavy bone-chassis look, then stripped it back to a lean two-bar chrome after WebGL context-loss issues — kept all CRT effects and fonts intact. Added WebGL context-loss auto-recovery. Production build green, TypeScript clean. **Shipped final for crit.**
- **Crit:** Tuesday 2026-04-21 evening.

## Workflow Guidelines

- Commit frequently with clean, descriptive messages.
- Update this CLAUDE.md as work progresses.
- API keys are in `.env.local` — never commit these.
- Default to Recraft V4 Pro (clean backgrounds via API param). Ideogram for remix.
- Currently using Claude Haiku for dev. Switch to Sonnet for production.
- Output must be physically plausible sculpture (3D-convertible), not abstract 2D composition.
