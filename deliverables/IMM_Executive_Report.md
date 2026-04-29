# Interactive Memory Machine
## Glitch Architecture — Externalising Subconscious Spatial Recall as Sculptural Form
A browser-based generative pipeline that translates a subject's recalled spatial memory into a physically plausible, 3D-printable architectural artifact through structured ML-driven distortion.

**Team 10 — SUTD · Term 6 · Creative Machine Learning**
Zaw Ye Htet (1008XXX) — Primary developer, system architect
Jiawen (1008XXX)
Naing Thway (1008XXX)
Vrinda (1008XXX)

---

## Contents

1. Executive Summary
2. Project Overview
3. User Workflow
4. Tone Archetypes & Operation Nodes
5. Output Variations
6. 3D Model Specification
7. Preview System
8. Technology Stack
9. Architecture & Pipeline
10. Performance & Resilience Hardening
11. Development Timeline
12. Current Status & Next Steps

---

## 1. Executive Summary

The Interactive Memory Machine (IMM) is a web-based generative tool that converts a subject's recalled architectural memory — entered as free text — into a sculptural 3D-printable artifact. The project addresses a gap between two domains: in architectural theory, memory is widely understood as an unreliable, distorting archive of space; in computational design, however, there is no accessible pipeline for translating that distortion into editable, fabricatable geometry.

IMM frames "glitch" not as an aesthetic style but as **meaningful distortion of spatial recall**. The system uses a Claude language model to extract keywords from a subject's recall text, score twelve architectural distortion parameters, and classify the recall into one of seven *tone archetypes*. The subject then wires their own keywords to operation nodes on an interactive canvas — making authorship of the distortion explicit. A second Claude pass acts as an *art director*, rewriting the resulting mechanical specification into a single cohesive visual brief. fal.ai generates a 2D image from this brief, which is then lifted into a 3D mesh by a fal.ai reconstruction model (Trellis or Hunyuan3D V3). The mesh renders in an in-browser viewer with orbit controls and exports as GLB, OBJ, or STL.

The pipeline runs in a single Next.js application, with all model inference delegated to API providers (Anthropic, fal.ai). Outputs have been 3D-printed by team members and shown at the SUTD Term 6 final critique on **2026-04-21**.

---

## 2. Project Overview

### Problem Statement

Architects and architectural researchers have long observed that spatial memory does not behave like a photograph. It tilts, omits, compresses, and fuses with other spaces. Existing computational design tools either treat space as a clean photogrammetric record (3D scanning, BIM) or treat distortion purely as a 2D image-generation aesthetic (Stable Diffusion glitch art). Neither offers a pipeline that:

1. Takes free-text subjective recall as input,
2. Treats glitch as a *structured* deformation rather than visual noise,
3. Preserves authorship of that distortion by the subject themselves, and
4. Outputs a physically plausible, 3D-printable architectural object.

### Solution

IMM provides an end-to-end browser pipeline: enter recall text, see analysis (keywords + 12 parameter scores + archetype), wire keywords to operation nodes on a canvas, generate a 2D artifact, lift it into a 3D mesh, and export GLB/OBJ/STL. No Rhino, Grasshopper, or modelling skills are required of the subject.

### Design Principles

- **Glitch is meaningful, not aesthetic.** Each operation node corresponds to a defensible architectural distortion (boundary diffusion, mass subtraction, gravitational shift, etc.), not a pixel artifact.
- **The subject is the author.** The wiring on the canvas — which keywords pull which operations, and how strongly — is set by the subject. The same recall produces different artifacts depending on the wiring.
- **The artifact must remain physically plausible.** Outputs are sculptural objects with continuous mass — not abstract 2D compositions, glitched flat images, or impossible geometries.
- **No catalogue lookup.** There are no pre-built spatial models. Every artifact is generated from the subject's text plus their authored wiring.

---

## 3. User Workflow

The application follows a linear ten-stage workflow. Each stage produces a visible artefact the subject can review before proceeding.

| # | Stage | What happens | Actor |
|---|-------|--------------|-------|
| 01 | INPUT | Subject ID + subconscious spatial recall (≤600 chars). | User |
| 02 | ANALYZE | Claude extracts 8–15 keywords, scores 12 distortion parameters, classifies one of 7 tone archetypes. | Model |
| 03 | CANVAS | Subject drags keyword chips (left) and wires them to operation nodes (right) via bezier connections. | User |
| 04 | DIRECT | Claude reads recall + archetype + connections + scores, rewrites the mechanical spec as a cohesive visual brief. | Model |
| 05 | GENERATE | fal.ai (Recraft V4 Pro / Nano Banana Pro / Ideogram V2) renders a 2D image from the visual brief. | Model |
| 06 | NAME | Claude returns `{ name, explanation }` JSON. The name is editable and drives 3D export filenames. | Model |
| 07 | VIEW 2D | Image + editable artifact title + interpretation displayed. | User |
| 08 | RECONSTRUCT | (Optional) fal.ai Trellis or Hunyuan3D V3 reconstructs the 2D image into a GLB mesh. | Model |
| 09 | ORBIT | React Three Fiber viewport with orbit/zoom/pan, ground grid, axis gizmo, STUDIO ↔ MOODY HDRI lighting toggle. | User |
| 10 | EXPORT | GLB (native), OBJ + STL (client-side via `three-stdlib`). Filename = slugified artifact name. | User |

---

## 4. Tone Archetypes & Operation Nodes

### Seven Tone Archetypes (starter shape-language)

Claude classifies each recall into one archetype based on emotional and spatial cues. The archetype seeds the base form-language; the operation nodes deform it.

| Archetype | Mood | Form Tendency |
|-----------|------|---------------|
| Organic | Calm, nostalgic | Smooth biomorphic curves |
| Crystalline | Tense, anxious | Angular faceted planes |
| Twisted | Disorienting, dynamic | Coiling spirals |
| Skeletal | Vulnerable, exposed | Thin branching members |
| Monolithic | Oppressive, heavy | Dense compact mass |
| Fragmented | Chaotic, traumatic | Scattered suspended shards |
| Nested | Introspective, intimate | Concentric layered shells |

Reference images for each archetype are stored in `public/archetypes/` and shown to the subject during the canvas stage.

### Twelve Operation Nodes (three families of distortion)

**SPATIAL** (unipolar 0–1):

| Node | Operation | Effect |
|------|-----------|--------|
| Clarity | Boundary Diffusion | Dissolves edges; merges with neighbours |
| Completeness | Mass Subtraction | Carves volume with voids and hollows |
| Stability | Gravitational Shift | Tilts and suspends off-axis |
| Misassociation | Cross-Morphology Fusion | Merges incompatible shapes |
| Vulnerability | Interior Reveal | Peels surfaces, exposes inner layers |
| Intimacy | Scale Compression | Surrounding mass folds inward |

**EXPERIENCE** (bipolar; 0.5 = neutral):

| Node | Operation | Effect |
|------|-----------|--------|
| Temperature | Freeze ↔ Melt | Low: ice/frost · High: molten flow |
| Pressure | Smooth ↔ Shatter | Low: glassy polish · High: jagged spikes |
| Luminosity | Shadow ↔ Radiance | Low: consumed by darkness · High: blinding glow |

**APPEARANCE** (unipolar 0–1):

| Node | Operation | Effect |
|------|-----------|--------|
| Material | Substance Identity | Connected keywords define physical material |
| Texture | Surface Grain | Connected keywords set roughness/smoothness |
| Color | Chromatic Palette | Connected keywords drive palette and saturation |

The number of connections to a node and the *content* of the connected keywords together modulate the intensity of each operation. Multiple keywords on one node = stronger pull on that operation.

---

## 5. Output Variations

Each generation produces three sequential outputs from the same recall + wiring:

**A · 2D Artifact (always)** — A clean-background sculptural image rendered by fal.ai. Editable artifact title and a short Claude-authored explanation accompany the image.

**B · 3D Mesh (optional)** — A GLB mesh reconstructed from the 2D artifact via fal.ai Trellis (default, ~$0.02) or Hunyuan3D V3 (PBR-grade, 500k faces, ~$0.16). Reconstruction model is selectable at generation time.

**C · 3D Exports** — From the rendered mesh: GLB (native from fal), OBJ (client-side via `three-stdlib`), STL (client-side, binary, opens directly in Bambu / Cura for slicing). Filename = slugified artifact name.

---

## 6. 3D Model Specification

| Property | Value |
|----------|-------|
| Native format | GLB (glTF binary) with PBR materials when produced by Hunyuan3D V3 |
| Secondary exports | OBJ (text), STL (binary) |
| Trellis output | Standard mesh, fast iteration |
| Hunyuan3D V3 output | `face_count: 500000`, `generate_type: "Normal"`, PBR materials |
| Coordinate system | Y-up (R3F default) |
| Viewer scale | Auto-fit via `@react-three/drei` `<Bounds>` with `<Center>` |
| Print readiness | STL is binary so Bambu Studio / Cura accept it directly without conversion |

All meshes are continuous solid surfaces — IMM does not emit point clouds, NeRFs, or surface-only meshes.

---

## 7. Preview System

The in-browser preview uses **React Three Fiber** with **drei** helpers (`OrbitControls`, `Bounds`, `Center`, `Grid`, `GizmoHelper`, `Environment`).

| Mode | Background | Lighting | Use |
|------|-----------|----------|-----|
| STUDIO | Neutral grey HDRI | High-key, ACES tone-mapped | Inspection, screenshot, export |
| MOODY | Dim warm HDRI | Low-key dramatic | Crit / exhibition presentation |

A ground grid and an axis gizmo are visible at all times. Lighting toggles in-place without re-mounting the canvas. A `ViewerErrorBoundary` swallows the synthetic `[object Event]` errors that React Three Fiber surfaces on transient WebGL failures, and a `webglcontextlost` listener auto-remounts the Canvas with a new key after 300 ms — preventing dead viewports during long crit demos.

---

## 8. Technology Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript 5 | Single-page app, server actions, API routes |
| Styling | Tailwind CSS v4 | Retro-CRT terminal theme |
| Hosting | Vercel | Public deployment |
| LLM (analysis + art-direction + naming) | Anthropic Claude — Haiku (dev), Sonnet (production) | Keyword extraction, parameter scoring, archetype classification, prompt rewriting, artifact naming |
| Text-to-Image | fal.ai — Recraft V4 Pro (default), Nano Banana Pro, Ideogram V2 | Generative 2D artifact |
| Image-to-3D | fal.ai — Trellis (default), Hunyuan3D V3 (PBR, hero) | Mesh reconstruction |
| 3D viewer | React Three Fiber + `@react-three/drei` | In-browser orbit / lighting / gizmo |
| 3D exports | `three-stdlib` exporters | Client-side OBJ + binary STL |
| Fonts | VT323, Share Tech Mono, JetBrains Mono, EB Garamond | CRT phosphor / stencil / data / serif |
| Secrets | `.env.local` (gitignored) | API keys for Anthropic and fal |

The full stack is delegated to managed APIs — there are no GPU servers, no local models, no batch jobs. The Next.js app is the only deployable artefact.

---

## 9. Architecture & Pipeline

### Request Flow

1. `POST /api/analyze` — Claude extracts keywords, scores 12 parameters, picks archetype.
2. Subject wires keywords to operation nodes on the canvas (no backend round-trip).
3. `POST /api/generate-image` — Server builds the mechanical prompt, asks Claude to art-direct it, sends the visual brief to fal.ai, returns the image URL plus a Claude-authored `{ name, explanation }`.
4. `POST /api/generate-3d` — fal.ai (Trellis / Hunyuan3D V3) lifts the image into a GLB mesh; URL returned.
5. Client downloads the GLB, renders it in R3F, and exports OBJ / STL on demand from `three-stdlib`.

### Source Layout

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts            ← Claude analysis endpoint
│   │   ├── generate-image/route.ts     ← Art-director + fal image gen + naming
│   │   ├── generate-3d/route.ts        ← fal Trellis / Hunyuan3D reconstruction
│   │   ├── translate/route.ts          ← (auxiliary)
│   │   └── generate-video/route.ts     ← (legacy v1, retained but unused)
│   ├── layout.tsx                      ← Fonts, ChassisFrame, GrainOverlay
│   ├── page.tsx                        ← Main reducer, pipeline orchestration
│   └── globals.css                     ← Keyframes, machine classes, CRT layers
├── components/
│   ├── ChassisFrame.tsx                ← Lean 32px top/bottom CRT chrome
│   ├── MachineViewport.tsx             ← Amber-border viewport wrapper
│   ├── NodeCanvas.tsx                  ← SVG wire layer + draggable canvas
│   ├── KeywordFragment.tsx             ← Draggable keyword chips
│   ├── OperationNode.tsx               ← 12 operation nodes with score bars
│   ├── ConnectionWire.tsx              ← SVG bezier wires
│   ├── GenerateButton.tsx              ← Generate trigger w/ connection count
│   ├── InputForm.tsx                   ← Recall textarea + Konami easter egg
│   ├── GlitchIdle.tsx                  ← Letter-fall idle animator
│   ├── MechanicalLoader.tsx            ← Elapsed counter + telemetry + scan bar
│   ├── Model3DViewer.tsx               ← R3F canvas + lighting + GLB/OBJ/STL export
│   ├── ViewerErrorBoundary.tsx         ← Swallows transient [object Event] errors
│   ├── ProgressTracker.tsx             ← Pipeline progress indicator
│   └── GrainOverlay.tsx                ← SVG film grain
├── hooks/
│   ├── useIdle.ts                      ← Inactivity detector
│   └── useKonamiCode.ts                ← Konami-sequence detector
└── lib/
    ├── types.ts                        ← TS interfaces (KeywordFragment, OperationNode, ...)
    ├── claude.ts                       ← Anthropic client + analysis / art-direct / explainArtifact
    ├── prompt-builder.ts               ← Mechanical prompt assembly
    └── fal.ts                          ← fal client + withTimeout wrapper
```

---

## 10. Performance & Resilience Hardening

The retro-CRT UI work in v2.5 caused a `THREE.WebGLRenderer: Context Lost` failure during long crit-prep sessions, and a hung 3D call once stalled the Anthropic client into a 10-minute silent retry loop. The following changes were made to harden the pipeline before crit:

**WebGL / GPU**
- `Model3DViewer` listens for `webglcontextlost` and auto-remounts the Canvas with a new key after 300 ms.
- Canvas `dpr` reduced from `[1, 2]` to `[1, 1.5]`; `failIfMajorPerformanceCaveat: false`.
- LED pulse animates `opacity` only (GPU composite), never `box-shadow` (CPU paint).
- `node-connected-breath` is a static glow now, not an animated `box-shadow`.
- Removed: matrix-rain columns, running ticker scroll, bone corner plates, side rails with knobs, speaker grille, arcade button pad, vents, rivets.

**API resilience**
- Anthropic client: `timeout: 30_000`, `maxRetries: 1` — fails fast on transient 429/529 instead of silent retry.
- fal client: `withTimeout()` wrapper caps Trellis at 6 min, Hunyuan3D at 10 min.
- `logs: true` + `onQueueUpdate` streams fal queue status to the Next.js terminal.
- Hunyuan3D uses `generate_type: "Normal"` (valid enum) + `face_count: 500000` (matches teammate 3D-print quality).

**Render path**
- `ChassisFrame` telemetry values updated via `useRef` + `textContent` — no React re-renders per tick.
- `@media (prefers-reduced-motion: reduce)` disables remaining decorative animations.
- Scanline overlays use plain `rgba` stripes (no `mix-blend-mode: multiply`) at 4 px step.
- Film-grain SVG overlay: plain `opacity: 0.05`, no `mix-blend-mode`.

**Operation envelope** (rough, observed during crit prep on a ThinkPad with discrete GPU)

| Operation | Duration | Notes |
|-----------|----------|-------|
| Claude analysis | ~3–5 s | Haiku; ~600 chars in, ~12 scores + 8–15 keywords + archetype out |
| Art director + fal image generation | ~10–15 s | Recraft V4 Pro |
| fal Trellis reconstruction | ~60–90 s | GLB only |
| fal Hunyuan3D V3 reconstruction | ~3–5 min | PBR, 500k faces |
| GLB load in browser | ~1–3 s | Depends on mesh size |
| Full pipeline (text → exported STL, Trellis path) | ~2–3 min | |
| Full pipeline (text → exported STL, Hunyuan3D path) | ~5–7 min | |

---

## 11. Development Timeline

| Date | Milestone |
|------|-----------|
| 2026-03-28 | **v1** scaffolded — memory + dream → analysis → image → video. All endpoints wired. |
| 2026-04-14 | **v2** major pivot — node-based visual programming UI; 10 nodes; Ideogram V2; morphological-fusion aesthetic. Instructor-validated. |
| 2026-04-18 / 19 | **v2.2** — Art-director pipeline; expanded to 12 nodes; tone archetypes with reference images; multi-model 2D toggle. |
| 2026-04-20 | **v2.3** — Full 3D pipeline shipped: fal.ai Trellis/Hunyuan3D V3, R3F viewer with lighting toggle, GLB/OBJ/STL export, editable artifact names. Teammates 3D-printed first outputs. |
| 2026-04-20 | **v2.4** — UI polish pass: idle / subconscious glitch effects (letter-fall, scan-line, TV glitch, deep burst), mechanical loader, node-canvas polish (wire draw-in, breath glow, badge pop), 3D viewport grid + axis gizmo, EB Garamond serif, film-grain overlay, easter eggs (Konami / midnight mode). |
| 2026-04-21 | **v2.5 — crit-night.** Full retro-CRT aesthetic pass: VT323 + Share Tech Mono fonts, amber phosphor, scanline overlays, cryptic serial-log cycling in loader, ASCII progress bar, tactile buttons with LED indicators, terminal-style input prompts. Hardened Anthropic + fal clients (timeouts, retry caps) after a hung 3D call. Heavy bone-chassis chrome iterated through and stripped back to a lean two-bar chrome after WebGL context-loss issues. WebGL context-loss auto-recovery added. Production build green; TypeScript clean. **Shipped final.** |
| 2026-04-21 | Final crit (Tuesday evening). |

---

## 12. Current Status & Next Steps

### Completed

- Full 10-stage pipeline: input → analyze → canvas → direct → generate → name → view 2D → reconstruct → orbit → export.
- Claude analysis with 12-parameter scoring and 7-archetype classification.
- Node canvas with draggable keyword chips, 12 operation nodes, bezier wires, score bars, badge animations.
- Art-director second pass that closes the gap between mechanical spec and image-model prompt.
- Multi-model 2D selector (Recraft V4 Pro / Nano Banana Pro / Ideogram V2) and 3D selector (Trellis / Hunyuan3D V3).
- R3F viewport with STUDIO ↔ MOODY HDRI toggle, ground grid, axis gizmo, orbit + bounds + auto-center.
- GLB / OBJ / STL export, with slugified artifact-name filenames.
- Retro-CRT UI with VT323 / Share Tech Mono phosphor, scanlines, tactile buttons, mechanical loader.
- Performance hardening: dpr cap, GPU-only LED animation, opacity-only effects, prefers-reduced-motion overrides.
- Resilience hardening: Anthropic and fal timeouts + retry caps, fal queue status streaming, WebGL context-loss auto-recovery, ViewerErrorBoundary.
- Easter eggs: Konami code, midnight mode, long-idle deep glitch.
- Four artifacts produced and 3D-printed by teammates for the final crit (Fragmented / Monolithic / Twisted / Skeletal).
- Final crit shipped on 2026-04-21.

### Open Research Questions

- **Inter-subjective comparison** — Do memories of the same physical space, recalled by different subjects, converge or diverge under the machine?
- **Longitudinal recall** — Does the same subject's artifact for the same space drift over time as the underlying memory mutates?
- **Architectural authoring use** — Can the IMM pipeline inform briefs for spaces meant to be forgotten, reassembled, or grieved (e.g. memorials, heritage demolition documentation)?

### Engineering Backlog

- Persist sessions to a database so subjects can revisit / re-wire prior recalls.
- Side-by-side comparison view for two artifacts from the same recall under different wirings.
- Higher-fidelity 3D path (Hunyuan3D-only mode, with mesh decimation slider for print prep).
- Multi-subject session: have several subjects recall the same space and overlay the resulting wirings.
- Documentation pass for the canvas wiring grammar (which operations interact, which combinations destabilise the mesh).

---

*Repository — `github.com/ZawYeHtet2001/Glitch_CML_project`*
*Crit deck — `IMM_Final_Crit.pptx` (14 slides, 2026-04-21)*
