# IMM — Submission Bundle

**Interactive Memory Machine · SUTD Term 6 · Creative Machine Learning · Team 10**
Jiawen · Naing Thway · Vrinda · Zaw Ye Htet (primary developer)

Final crit shipped: **2026-04-21**.
Bundle compiled: **2026-04-29**.

---

## Contents

| File | Purpose |
|------|---------|
| `IMM_Executive_Report.md` | 12-section academic report — problem, solution, workflow, archetypes, operations, technology stack, architecture, performance, timeline, status. |
| `IMM_Reflection.md` | Critical evaluation of AI outputs vs. subject intent across analyse, generate, and reconstruct stages. |
| `diagrams/concept_diagram.md` | Mermaid source for the two concept diagrams + commentary. |
| `diagrams/concept_diagram_main.png` | Six-band concept loop (Built → Subconscious → Recall → ML → Authorship → Output → loopback). |
| `diagrams/concept_diagram_canvas_zoom.png` | Zoom into the ML translator + canvas authorship layer. |
| `diagrams/workflow_diagram.md` | Mermaid source for the three workflow views. |
| `diagrams/workflow_diagram_pipeline.png` | Linear 10-stage pipeline. |
| `diagrams/workflow_diagram_architecture.png` | Browser ↔ Next.js API ↔ Anthropic / fal.ai layered architecture. |
| `diagrams/workflow_diagram_sequence.png` | Subject ↔ Browser ↔ API ↔ Claude ↔ fal.ai sequence diagram. |

The Mermaid `.md` sources can be re-rendered with:

```bash
npx -y @mermaid-js/mermaid-cli mmdc -i diagrams/concept_diagram.md  -o concept.png  -w 1800 -H 2400 --backgroundColor "#fafaf5"
npx -y @mermaid-js/mermaid-cli mmdc -i diagrams/workflow_diagram.md -o workflow.png -w 2400 -H 2000 --backgroundColor "#fafaf5"
```

…or pasted into [mermaid.live](https://mermaid.live) for interactive editing and SVG export.

---

## Codebase

The project repository is at:

> **github.com/ZawYeHtet2001/Glitch_CML_project**

Clone with:

```bash
git clone https://github.com/ZawYeHtet2001/Glitch_CML_project.git
cd Glitch_CML_project
npm install
npm run dev    # localhost:3000
```

API keys (Anthropic + fal.ai) must be set in `.env.local` — see `CLAUDE.md` in the repo for the variable names.

A zipped snapshot of the codebase as submitted is at `Glitch_CML_project_submission.zip` in the parent folder.
