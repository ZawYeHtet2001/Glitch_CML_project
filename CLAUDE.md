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
- **Text-to-Image:** fal.ai — Flux Schnell (dev) / Flux Pro (production)
- **Interpretive Agent:** Claude API (Haiku for dev, Sonnet for production) — extracts keywords + scores 6 parameters
- **API Keys:** Stored in `.env.local` (gitignored)

## Pipeline (v2 — Node-Based)

1. **Input** — User provides subject ID + subconsciousness text (single input)
2. **Analysis** — Claude extracts 8-15 keywords (object/person/event/spatial_quality/experience) + scores 6 parameters 0-1 (`/api/analyze`)
3. **Node Mapping** — Interactive canvas: draggable keyword chips on left, 6 operation nodes on right. User wires keywords to operations via bezier connections.
4. **Generation** — Prompt builder translates connections + scores into geometric distortion clauses. fal.ai Flux generates image (`/api/generate-image`)
5. **Output** — Generated image displayed

### 6 Parameters (scored 0-1 by Claude, locked)

| Parameter | Geometric Operation |
|-----------|-------------------|
| Clarity | Edge resolution / fidelity |
| Completeness | Subtraction / missing mass |
| Stability | Tilt / center of gravity |
| Misassociation | Collision / hybridization |
| Vulnerability | Porosity / shell thickness |
| Intimacy | Compression / cavity size |

## Key Files

- `src/lib/types.ts` — TypeScript interfaces (KeywordFragment, OperationNode, Connection, SubconsciousAnalysis, CanvasState, SessionData)
- `src/lib/claude.ts` — Claude API client with keyword extraction + 6-parameter scoring
- `src/lib/prompt-builder.ts` — Builds image generation prompt from connections + scores
- `src/lib/fal.ts` — fal.ai client for image generation
- `src/app/page.tsx` — Main page with useReducer state management (input → analyzing → mapping → complete)
- `src/app/api/analyze/` — Claude analysis endpoint
- `src/app/api/generate-image/` — Image generation endpoint (accepts connection data)
- `src/components/NodeCanvas.tsx` — Main canvas with SVG wire layer + canvas reducer
- `src/components/KeywordFragment.tsx` — Draggable keyword chips with output ports
- `src/components/OperationNode.tsx` — 6 parameter nodes with score bars + input ports
- `src/components/ConnectionWire.tsx` — SVG bezier wire paths
- `src/components/GenerateButton.tsx` — Generate button with connection count
- `src/components/InputForm.tsx` — Single textarea input form

## Development

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
```

## Project Status

- **2026-03-28:** v1 pipeline scaffolded (memory+dream → analysis → image → video). All APIs working.
- **2026-04-14:** v2 major pivot — node-based visual programming UI. Single text input, keyword extraction, 6-parameter scoring, interactive canvas with drag-and-wire connections. Old components removed (AnalystNotes, ImageComparison, SpatialTranslation, VideoPlayer, translate route). Build passes clean.
- **Next:** Test full pipeline once Claude API stabilizes, tune prompts, then move to 3D cube output.

## Workflow Guidelines

- Commit frequently with clean, descriptive messages.
- Update this CLAUDE.md as work progresses.
- API keys are in `.env.local` — never commit these.
- Use Flux Schnell during development (cheaper), Flux Pro for final outputs.
- Currently using Claude Haiku for dev (Sonnet overloaded). Switch back for production.
