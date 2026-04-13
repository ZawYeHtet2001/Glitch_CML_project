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

// --- Operation Nodes (6 Parameters) ---

export type OperationType =
  | "clarity"
  | "completeness"
  | "stability"
  | "misassociation"
  | "vulnerability"
  | "intimacy";

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

// --- Session ---

export type SessionStatus =
  | "input"
  | "analyzing"
  | "mapping"
  | "generating"
  | "complete"
  | "error";

export interface SessionData {
  subject_id: string;
  input_text: string;
  analysis?: SubconsciousAnalysis;
  canvas?: CanvasState;
  generated_image_url?: string;
  status: SessionStatus;
  error?: string;
}
