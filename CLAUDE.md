# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Interactive Memory Machine** — Creative Machine Learning (CML) course project, Term 6, SUTD.

- **Team:** Team 10 (4 members: JW, NT, VP, ZH)
- **Owner/Primary Coder:** Zaw Ye Htet (ZH) — architecture student
- **Concept:** Glitch architecture — exploring how spatial memory distorts in dreams and the subconscious. The "glitch" is not aesthetic; it represents meaningful distortion of spatial recall.
- **Framing:** An analyst/therapist running experiments on recalled spatial memory.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Hosting:** Vercel (to be deployed)
- **Text-to-Image:** fal.ai — Flux Schnell (dev) / Flux Pro (production)
- **Image-to-Video:** fal.ai — Kling v2 Master
- **Interpretive Agent:** Claude API (Sonnet) — analyzes memory distortions
- **API Keys:** Stored in `.env.local` (gitignored)

## Pipeline (6 Steps)

1. **Input** — User provides subject ID, memory text, dream text
2. **Analysis** — Claude identifies distortions: OMISSION, OBSCURATION, MISASSOCIATION (`/api/analyze`)
3. **Generation** — fal.ai Flux generates memory + dream images (`/api/generate-image`)
4. **Spatial Translation** — Claude converts analysis into architectural visualization prompts (`/api/translate`)
5. **Video Synthesis** — fal.ai Kling generates 10s walkthrough video (`/api/generate-video`)
6. **Output** — Video + full documentation trail displayed in UI

## Key Files

- `src/lib/claude.ts` — Claude API client with analysis + translation prompts
- `src/lib/fal.ts` — fal.ai client for image + video generation
- `src/lib/types.ts` — TypeScript interfaces for all data structures
- `src/app/page.tsx` — Main single-page UI with progressive reveal
- `src/app/api/` — 4 API routes (analyze, generate-image, generate-video, translate)
- `src/components/` — 6 UI components (InputForm, ProgressTracker, AnalystNotes, ImageComparison, SpatialTranslation, VideoPlayer)

## Development

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
```

## Project Status

- **2026-03-28:** Full pipeline scaffolded and tested end-to-end. All 3 APIs confirmed working (Claude analysis, fal.ai image, fal.ai video). UI functional with dark clinical aesthetic.
- **Next:** Team review, then collect narratives from all 4 members, tune prompts, polish UI.

## Workflow Guidelines

- Commit frequently with clean, descriptive messages.
- Update this CLAUDE.md as work progresses.
- API keys are in `.env.local` — never commit these.
- Use Flux Schnell during development (cheaper), Flux Pro for final outputs.
- Pre-cache team sessions for demo reliability.
