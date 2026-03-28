export interface Distortion {
  type: "OMISSION" | "OBSCURATION" | "MISASSOCIATION";
  element: string;
  memory_description: string;
  dream_description: string;
  interpretation: string;
  severity: number;
}

export interface AnalysisResult {
  subject_id: string;
  distortions: Distortion[];
  overall_pattern: string;
  analyst_notes: string;
}

export interface SpatialTranslation {
  image_prompt: string;
  video_prompt: string;
  style_modifiers: string;
}

export interface SessionData {
  subject_id: string;
  memory_text: string;
  dream_text: string;
  analysis?: AnalysisResult;
  memory_image_url?: string;
  dream_image_url?: string;
  spatial_translation?: SpatialTranslation;
  video_url?: string;
  status: "input" | "analyzing" | "generating_images" | "translating" | "generating_video" | "complete" | "error";
  error?: string;
}

export type PipelineStep =
  | "input"
  | "analyzing"
  | "generating_images"
  | "translating"
  | "generating_video"
  | "complete";
