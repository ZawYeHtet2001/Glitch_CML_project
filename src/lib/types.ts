// --- Keyword Fragments ---

export type KeywordCategory =
  | "object"
  | "person"
  | "event"
  | "spatial_quality"
  | "experience";

export interface KeywordFragment {
  id: string;
  text: string;
  category: KeywordCategory;
  position: { x: number; y: number };
}

// --- Tone Archetype (starter shape from mood) ---

export type ToneArchetype =
  | "organic"
  | "crystalline"
  | "twisted"
  | "skeletal"
  | "monolithic"
  | "fragmented"
  | "nested";

// --- Operation Nodes (6 Parameters) ---

export type OperationType =
  | "clarity"
  | "completeness"
  | "stability"
  | "misassociation"
  | "vulnerability"
  | "intimacy"
  | "temperature"
  | "pressure"
  | "luminosity"
  | "material"
  | "texture"
  | "color";

export interface OperationNode {
  id: OperationType;
  label: string;
  description: string;
  score: number; // 0-1, assigned by Claude, locked
  position: { x: number; y: number };
  connectedKeywords: string[]; // keyword IDs
}

// --- Connections (Wires) ---

export interface Connection {
  id: string;
  fromKeywordId: string;
  toOperationId: OperationType;
}

// --- Claude Analysis Response ---

export interface SubconsciousAnalysis {
  subject_id: string;
  keywords: KeywordFragment[];
  scores: Record<OperationType, number>;
  tone_archetype: ToneArchetype;
  interpretation: string;
}

// --- Canvas State ---

export interface CanvasState {
  keywords: KeywordFragment[];
  operations: OperationNode[];
  connections: Connection[];
  activeWire: {
    fromKeywordId: string;
    mousePos: { x: number; y: number };
  } | null;
}

// --- Image Models ---

export type ImageModel = "ideogram" | "recraft" | "nanoBanana";

export const IMAGE_MODEL_LABELS: Record<ImageModel, string> = {
  ideogram: "Ideogram V2",
  recraft: "Recraft V4 Pro",
  nanoBanana: "Nano Banana Pro",
};

// --- 3D Models ---

export type Model3D = "trellis" | "hunyuan3d";

export const MODEL_3D_LABELS: Record<Model3D, string> = {
  trellis: "Trellis (Fast)",
  hunyuan3d: "Hunyuan3D V3 (HQ)",
};

// --- Session ---

export type SessionStatus =
  | "input"
  | "analyzing"
  | "mapping"
  | "generating"
  | "complete"
  | "generating_3d"
  | "complete_3d"
  | "error";

export interface SessionData {
  subject_id: string;
  input_text: string;
  analysis?: SubconsciousAnalysis;
  canvas?: CanvasState;
  generated_image_url?: string;
  artifact_name?: string;
  explanation?: string;
  model_3d_url?: string;
  status: SessionStatus;
  error?: string;
}
