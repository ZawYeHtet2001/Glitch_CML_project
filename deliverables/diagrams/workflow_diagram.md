# Workflow Diagram — IMM 10-Stage Pipeline

> Ten stages from recalled text to exported mesh.
> Amber = ML inference (Claude / fal.ai). Blue = subject action. Green = artefact / output.

---

## Linear pipeline

```mermaid
flowchart LR
    S01["01 · INPUT<br/><i>recall text ≤600 chars</i>"]:::user
    S02["02 · ANALYSE<br/>Claude<br/>keywords · 12 scores · archetype"]:::model
    S03["03 · CANVAS<br/><i>wire keywords → operations</i>"]:::user
    S04["04 · DIRECT<br/>Claude<br/>mechanical → visual brief"]:::model
    S05["05 · GENERATE<br/>fal.ai<br/>Recraft V4 / Nano / Ideogram"]:::model
    S06["06 · NAME<br/>Claude<br/>{ name, explanation }"]:::model
    S07["07 · VIEW 2D<br/><i>image + title + interpretation</i>"]:::user
    S08["08 · RECONSTRUCT<br/>fal.ai<br/>Trellis / Hunyuan3D V3"]:::model
    S09["09 · ORBIT<br/><i>R3F · STUDIO ↔ MOODY</i>"]:::user
    S10["10 · EXPORT<br/>GLB · OBJ · STL<br/><i>three-stdlib client-side</i>"]:::out

    S01 --> S02 --> S03 --> S04 --> S05 --> S06 --> S07 --> S08 --> S09 --> S10

    classDef user  fill:#e0f5ff,stroke:#0070a0,color:#003a55,stroke-width:2px
    classDef model fill:#1a1a22,stroke:#ffb000,color:#ffd87a,stroke-width:2px
    classDef out   fill:#e6ffe6,stroke:#2a8a2a,color:#103a10,stroke-width:2px
```

---

## Architecture & request flow

This view groups the 10 stages by the layer they execute on (browser, Next.js API route, third-party model API) and shows the artefacts that pass between them.

```mermaid
flowchart TB
    subgraph CLIENT["🖥  BROWSER  ·  Next.js client (React 19 + R3F)"]
        direction TB
        UI_INPUT["InputForm<br/><i>recall textarea</i>"]:::user
        UI_CANVAS["NodeCanvas<br/><i>drag · wire · score bars</i>"]:::user
        UI_VIEW2D["ArtifactView<br/><i>image · editable title · explanation</i>"]:::user
        UI_VIEW3D["Model3DViewer (R3F)<br/><i>orbit · STUDIO ↔ MOODY · grid · gizmo</i>"]:::user
        UI_EXPORT["Export buttons<br/>GLB native · OBJ + STL via three-stdlib"]:::out
    end

    subgraph SERVER["⚙  Next.js Route Handlers  ·  Vercel"]
        direction TB
        API_ANALYSE["POST /api/analyze"]:::api
        API_GEN_IMG["POST /api/generate-image<br/><i>art-direct + image + name</i>"]:::api
        API_GEN_3D["POST /api/generate-3d"]:::api
    end

    subgraph EXTERNAL["☁  Model APIs"]
        direction TB
        ANTHROPIC["Anthropic Claude<br/>Haiku (dev) · Sonnet (prod)<br/>timeout 30s · retries 1"]:::model
        FAL["fal.ai<br/>Recraft V4 Pro · Nano Banana Pro · Ideogram V2<br/>Trellis · Hunyuan3D V3<br/>withTimeout · onQueueUpdate"]:::model
    end

    UI_INPUT -->|"recall text"| API_ANALYSE
    UI_CANVAS -->|"recall + wiring + scores"| API_GEN_IMG
    UI_VIEW2D -->|"image URL"| API_GEN_3D

    API_ANALYSE -->|"analyse prompt"| ANTHROPIC
    API_GEN_IMG -->|"art-director prompt"| ANTHROPIC
    API_GEN_IMG -->|"visual brief"| FAL
    API_GEN_IMG -->|"naming prompt"| ANTHROPIC
    API_GEN_3D -->|"image URL"| FAL

    ANTHROPIC -.->|"keywords, scores, archetype"| API_ANALYSE
    ANTHROPIC -.->|"brief text"| API_GEN_IMG
    FAL -.->|"2D image URL"| API_GEN_IMG
    ANTHROPIC -.->|"name, explanation"| API_GEN_IMG
    FAL -.->|"GLB URL"| API_GEN_3D

    API_ANALYSE -.->|"keywords, scores, archetype"| UI_CANVAS
    API_GEN_IMG -.->|"image_url, name, explanation"| UI_VIEW2D
    API_GEN_3D -.->|"glb_url"| UI_VIEW3D
    UI_VIEW3D --> UI_EXPORT

    classDef user  fill:#e0f5ff,stroke:#0070a0,color:#003a55,stroke-width:2px
    classDef api   fill:#fff0d4,stroke:#c79100,color:#5d3a00,stroke-width:2px
    classDef model fill:#1a1a22,stroke:#ffb000,color:#ffd87a,stroke-width:2px
    classDef out   fill:#e6ffe6,stroke:#2a8a2a,color:#103a10,stroke-width:2px
```

---

## State sequence

This view shows what data exists at each stage of the pipeline and what survives between stages.

```mermaid
sequenceDiagram
    autonumber
    actor U as Subject
    participant C as Browser
    participant API as Next.js API
    participant CLAUDE as Claude
    participant FAL as fal.ai

    U ->> C: Recall text plus Subject ID
    C ->> API: POST /api/analyze
    API ->> CLAUDE: analyse prompt
    CLAUDE -->> API: keywords, 12 scores, archetype
    API -->> C: analysis result
    C -->> U: keyword chips appear, archetype banner shown

    U ->> C: Drag keywords, wire to operation nodes
    Note right of C: Wiring stored as connections array<br/>Score bars update live<br/>No API call

    U ->> C: Click GENERATE
    C ->> API: POST /api/generate-image
    API ->> CLAUDE: art-director prompt
    CLAUDE -->> API: visual brief
    API ->> FAL: text-to-image
    FAL -->> API: image URL
    API ->> CLAUDE: explainArtifact prompt
    CLAUDE -->> API: name and explanation
    API -->> C: image URL plus name and explanation
    C -->> U: 2D artifact, editable title, explanation

    opt User chooses VIEW IN 3D
        U ->> C: Click VIEW IN 3D
        C ->> API: POST /api/generate-3d
        API ->> FAL: image-to-3D Trellis or Hunyuan3D
        Note right of FAL: withTimeout 6min Trellis<br/>10min Hunyuan3D
        FAL -->> API: GLB URL plus queue updates
        API -->> C: glb URL
        C -->> U: R3F viewport renders mesh
    end

    opt Export
        U ->> C: Click GLB or OBJ or STL
        C -->> U: Download via three-stdlib
    end
```

---

## Failure-mode legend (resilience hardening)

| Failure | Mitigation |
|---------|------------|
| Anthropic 429/529 transient | `timeout: 30_000`, `maxRetries: 1` — fail fast, surface to UI |
| fal Trellis hung > 6 min | `withTimeout(6*60_000)` aborts |
| fal Hunyuan3D hung > 10 min | `withTimeout(10*60_000)` aborts |
| WebGL context lost (long session) | `webglcontextlost` listener auto-remounts Canvas with new key (300 ms debounce) |
| R3F transient `[object Event]` errors | `ViewerErrorBoundary` swallows + logs |
| GPU paint thrash | LED pulses animate `opacity` only, no `box-shadow` |

---

*Render any of the three diagrams as PNG/SVG by pasting their `mermaid` code block into [mermaid.live](https://mermaid.live), or run `npx -y @mermaid-js/mermaid-cli -i workflow_diagram.md -o workflow_diagram.png` from the deliverables/diagrams folder.*
