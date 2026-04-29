# Concept Diagram — Glitch as Meaningful Distortion of Spatial Memory

> Glitch is not aesthetic — it is how the subconscious edits architecture.
> The Interactive Memory Machine externalises that editing as a structured, authored, printable transformation.

The diagram below traces the conceptual frame: a built space passes through the subject's subconscious, returns as recalled (and distorted) memory, is decomposed into a structured spec by ML, re-authored on the node canvas by the subject, and returns to physical form as a 3D-printable sculptural artifact.

## Concept Map

```mermaid
flowchart TB
    subgraph PHYS["1. PHYSICAL SPACE - AS BUILT"]
        direction TB
        BUILT["Built architecture<br/>walls, scale, circulation<br/><i>ordered, photographable</i>"]
    end

    subgraph SUB["2. SUBCONSCIOUS - THE EDITOR"]
        direction TB
        EDIT["Subconscious as archivist<br/>tilts, omits, compresses, fuses<br/><i>unreliable, generative</i>"]
    end

    subgraph REC["3. RECALL - AS REMEMBERED"]
        direction TB
        TEXT["≤600 chars subconscious recall<br/><i>free text — the sole creative input</i>"]
    end

    subgraph ML["4. ML TRANSLATOR LAYER"]
        direction LR
        ANALYZE["Claude<br/>ANALYSE<br/>8-15 keywords<br/>12 distortion scores<br/>1 of 7 archetypes"]
        DIRECT["Claude<br/>ART DIRECT<br/>cohesive visual brief<br/>closes spec-to-image gap"]
        IMG["fal.ai<br/>GENERATE 2D<br/>Recraft V4 / Nano /<br/>Ideogram"]
        MESH["fal.ai<br/>RECONSTRUCT 3D<br/>Trellis /<br/>Hunyuan3D V3"]
        ANALYZE --> DIRECT --> IMG --> MESH
    end

    subgraph AUTH["5. SUBJECT AUTHORSHIP - THE TESTIMONY"]
        direction TB
        CANVAS["Node Canvas<br/>drag keywords, wire to operations<br/><i>the wiring is the distortion</i>"]
        OPS["12 OPERATION NODES<br/>SPATIAL, EXPERIENCE, APPEARANCE<br/>connection count + keyword content<br/>= operation intensity"]
        ARCH["7 TONE ARCHETYPES<br/>Organic, Crystalline, Twisted,<br/>Skeletal, Monolithic, Fragmented, Nested"]
        CANVAS --> OPS
        ARCH -. seeds .-> OPS
    end

    subgraph OUT["6. PHYSICAL OUTPUT - AS RE-MATERIALISED"]
        direction TB
        ARTIFACT["Sculptural Artifact<br/>GLB, OBJ, STL<br/><i>physically plausible, 3D-printable</i>"]
    end

    BUILT == experienced ==> EDIT
    EDIT == recalled ==> TEXT
    TEXT == into the machine ==> ANALYZE
    ANALYZE -. surfaces .-> ARCH
    OPS == intensities feed ==> DIRECT
    MESH == exported as ==> ARTIFACT

    ARTIFACT -. viewed, re-remembered .-> EDIT

    %% ======================
    %% STYLES
    %% ======================
    classDef phys     fill:#fff7e0,stroke:#c79100,color:#5d3a00,stroke-width:2px
    classDef sub      fill:#e8e1ff,stroke:#5b3aa0,color:#2a1660,stroke-width:2px
    classDef rec      fill:#fff0d4,stroke:#a05a00,color:#4a2a00,stroke-width:2px
    classDef ml       fill:#1a1a22,stroke:#ffb000,color:#ffd87a,stroke-width:2px
    classDef auth     fill:#e0f5ff,stroke:#0070a0,color:#003a55,stroke-width:2px
    classDef out      fill:#e6ffe6,stroke:#2a8a2a,color:#103a10,stroke-width:2px

    class BUILT phys
    class EDIT sub
    class TEXT rec
    class ANALYZE,DIRECT,IMG,MESH ml
    class CANVAS,OPS,ARCH auth
    class ARTIFACT out
```

---

## Reading the diagram

**Three loops, not one pipeline.**
The arrows form three nested loops — and the project lives in the third.

1. **The *built* loop** (bottom — implicit): A space is constructed, experienced, photographed. This is the conventional architectural record. IMM has no interest in this loop on its own.
2. **The *memory* loop** (orange → purple → orange): Built space is experienced, edited by the subconscious, recalled — usually into language, sometimes into a sketch. This is the loop that architectural memory studies, oral history, and trauma-of-place research already examine without ML.
3. **The *re-materialised* loop** (purple → black → blue → green → dotted-back-to-purple): IMM enters here. The recalled text is decomposed by Claude into structured parameters; the subject re-authors the distortion on the canvas; an art-director Claude pass closes the spec-to-image gap; fal.ai synthesises a 2D image and lifts it into a printable mesh. The artifact, once held, can re-enter the subject's memory and shift the next recall — a feedback the dotted loopback represents.

**The art director is the keystone.**
Without the art director, text-to-image models treat parameter scores as token noise. With it, the same scores become architectural intent. This is why DIRECT sits between the spec layer (ANALYSE + canvas wiring) and the generative layer (IMG → MESH).

**Authorship lives on the canvas.**
The same recall, with different wirings, produces different artifacts. The canvas is what makes the distortion the *subject's* distortion rather than the model's average.

**The archetype seeds, the operations deform.**
Of the seven archetypes, exactly one is selected per recall (Claude classifies). It seeds the base shape language. The twelve operations then deform that base. Multiple keywords on a single node = stronger pull on that operation.

---

## Concept loop in one sentence

> A built space → bent by the subconscious → spoken as text → decomposed into 12 distortion parameters → re-authored on a canvas by the subject → re-materialised as a printable sculpture → held in the hand → which alters the next recall.

---

## Detailed concept diagram — Authorship inside the ML translator

```mermaid
flowchart TB
    INPUT["Recall text<br/>≤600 chars<br/><i>SUBJECT</i>"]:::user

    subgraph ANALYSE["01 · ANALYSE  ·  Claude Haiku"]
        direction TB
        KW["keywords<br/>(8–15)"]:::data
        SCORES["12 distortion<br/>parameter scores"]:::data
        ARCH["1 of 7<br/>archetype"]:::data
    end

    INPUT --> ANALYSE

    subgraph CANVAS["02 · CANVAS  ·  SUBJECT AUTHORS"]
        direction LR
        KW2["keyword chips<br/>(draggable)"]:::user
        OPS["12 operation nodes<br/>SPATIAL · EXPERIENCE · APPEARANCE"]:::ops
        WIRES["bezier connections<br/><i>wiring = testimony</i>"]:::user
        KW2 --- WIRES --- OPS
    end

    KW --> KW2
    SCORES -.modulates.-> OPS

    subgraph DIRECT["03 · ART-DIRECT  ·  Claude Haiku"]
        direction TB
        BRIEF["single cohesive visual brief<br/><i>closes spec→image gap</i>"]:::data
    end

    OPS --> DIRECT
    ARCH -.seeds.-> DIRECT

    subgraph FAL["04 · GENERATE  ·  fal.ai"]
        direction TB
        IMG2D["2D artifact<br/>Recraft V4 / Nano / Ideogram"]:::data
        MESH3D["3D mesh GLB<br/>Trellis / Hunyuan3D V3"]:::data
        IMG2D --> MESH3D
    end

    DIRECT --> FAL

    NAME["Claude · NAME<br/>{ name, explanation }"]:::data
    IMG2D --> NAME

    EXPORT["EXPORT<br/>GLB · OBJ · STL<br/><i>printable</i>"]:::out
    MESH3D --> EXPORT

    classDef user  fill:#e0f5ff,stroke:#0070a0,color:#003a55,stroke-width:2px
    classDef ops   fill:#fff0d4,stroke:#c79100,color:#5d3a00,stroke-width:2px
    classDef data  fill:#1a1a22,stroke:#ffb000,color:#ffd87a,stroke-width:2px
    classDef out   fill:#e6ffe6,stroke:#2a8a2a,color:#103a10,stroke-width:2px
```

This second view zooms into the ML translator layer. It makes three choices visible:

- **The subject acts twice** — once as recall author (input), once as wiring author (canvas). The wiring is the part that carries forward subject authorship into the model output.
- **The archetype short-circuits to the art director.** It never modifies the canvas wiring; it only affects how the brief is *written*.
- **Naming is a separate Claude call** — the artifact name is editable by the subject, drives 3D export filenames, but is otherwise downstream of the image generation.

---

*Render this diagram as PNG/SVG by pasting the `mermaid` code block into [mermaid.live](https://mermaid.live), or run `npx -y @mermaid-js/mermaid-cli -i concept_diagram.md -o concept_diagram.png` from the deliverables/diagrams folder.*
