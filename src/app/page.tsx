"use client";

import { useReducer, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  SessionData,
  CanvasState,
  type ImageModel,
  IMAGE_MODEL_LABELS,
  type Model3D,
  MODEL_3D_LABELS,
} from "@/lib/types";
import InputForm from "@/components/InputForm";
import NodeCanvas from "@/components/NodeCanvas";
import GenerateButton from "@/components/GenerateButton";
import GlitchIdle from "@/components/GlitchIdle";
import MechanicalLoader from "@/components/MechanicalLoader";
import { useIdle } from "@/hooks/useIdle";

const Model3DViewer = dynamic(() => import("@/components/Model3DViewer"), {
  ssr: false,
});

type SessionAction =
  | { type: "START_ANALYSIS"; subject_id: string; input_text: string }
  | { type: "ANALYSIS_COMPLETE"; analysis: SessionData["analysis"] }
  | { type: "UPDATE_CANVAS"; canvas: CanvasState }
  | { type: "START_GENERATION" }
  | { type: "GENERATION_COMPLETE"; image_url: string; name: string; explanation: string }
  | { type: "RENAME_ARTIFACT"; name: string }
  | { type: "START_3D_GENERATION" }
  | { type: "THREE_D_COMPLETE"; model_3d_url: string }
  | { type: "SET_ERROR"; error: string }
  | { type: "RESET" };

const initialSession: SessionData = {
  subject_id: "",
  input_text: "",
  status: "input",
};

function sessionReducer(
  state: SessionData,
  action: SessionAction
): SessionData {
  switch (action.type) {
    case "START_ANALYSIS":
      return {
        ...initialSession,
        subject_id: action.subject_id,
        input_text: action.input_text,
        status: "analyzing",
      };
    case "ANALYSIS_COMPLETE":
      return { ...state, analysis: action.analysis, status: "mapping" };
    case "UPDATE_CANVAS":
      return { ...state, canvas: action.canvas };
    case "START_GENERATION":
      return { ...state, status: "generating" };
    case "GENERATION_COMPLETE":
      return {
        ...state,
        generated_image_url: action.image_url,
        artifact_name: action.name,
        explanation: action.explanation,
        model_3d_url: undefined,
        status: "complete",
      };
    case "RENAME_ARTIFACT":
      return { ...state, artifact_name: action.name };
    case "START_3D_GENERATION":
      return { ...state, status: "generating_3d" };
    case "THREE_D_COMPLETE":
      return {
        ...state,
        model_3d_url: action.model_3d_url,
        status: "complete_3d",
      };
    case "SET_ERROR":
      return { ...state, status: "error", error: action.error };
    case "RESET":
      return initialSession;
    default:
      return state;
  }
}

export default function Home() {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const [imageModel, setImageModel] = useState<ImageModel>("recraft");
  const [model3D, setModel3D] = useState<Model3D>("trellis");
  const isIdleRaw = useIdle(12000);
  const isIdle = isIdleRaw && session.status === "input";
  const [isNightShift, setIsNightShift] = useState(false);

  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      setIsNightShift(h >= 0 && h < 4);
    };
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!isIdle) {
      document.body.classList.remove("is-idle", "tv-glitch");
      return;
    }

    document.body.classList.add("is-idle");

    let scheduleTimer: ReturnType<typeof setTimeout> | null = null;
    let clearTimer: ReturnType<typeof setTimeout> | null = null;
    let deepTimer: ReturnType<typeof setTimeout> | null = null;

    const firePulse = (deep: boolean = false) => {
      const tearTop = 20 + Math.random() * 60;
      document.body.style.setProperty("--tear-top", `${tearTop}%`);
      document.body.classList.add("tv-glitch");
      if (deep) document.body.classList.add("tv-glitch-deep");
      clearTimer = setTimeout(
        () => {
          document.body.classList.remove("tv-glitch", "tv-glitch-deep");
          if (!deep) scheduleNext();
        },
        deep ? 1100 : 600
      );
    };

    const scheduleNext = () => {
      const delay = 20000 + Math.random() * 22000;
      scheduleTimer = setTimeout(() => firePulse(false), delay);
    };

    scheduleNext();

    // Long-idle deep glitch: 35s after entering idle, a bigger one-time burst
    deepTimer = setTimeout(() => firePulse(true), 35000);

    return () => {
      if (scheduleTimer) clearTimeout(scheduleTimer);
      if (clearTimer) clearTimeout(clearTimer);
      if (deepTimer) clearTimeout(deepTimer);
      document.body.classList.remove("is-idle", "tv-glitch", "tv-glitch-deep");
    };
  }, [isIdle]);

  const handleSubmit = async (subjectId: string, inputText: string) => {
    dispatch({
      type: "START_ANALYSIS",
      subject_id: subjectId,
      input_text: inputText,
    });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_id: subjectId, input_text: inputText }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Analysis failed (${res.status})`);
      }
      const analysis = await res.json();
      dispatch({ type: "ANALYSIS_COMPLETE", analysis });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        error: error instanceof Error ? error.message : "Analysis failed",
      });
    }
  };

  const handleConnectionsChange = useCallback((canvas: CanvasState) => {
    dispatch({ type: "UPDATE_CANVAS", canvas });
  }, []);

  const handleGenerate = async () => {
    if (!session.canvas || session.canvas.connections.length === 0) return;

    dispatch({ type: "START_GENERATION" });

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connections: session.canvas.connections,
          keywords: session.canvas.keywords,
          operations: session.canvas.operations,
          analysis: session.analysis,
          input_text: session.input_text,
          tone_archetype: session.analysis?.tone_archetype,
          image_model: imageModel,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Generation failed (${res.status})`);
      }
      const result = await res.json();
      dispatch({
        type: "GENERATION_COMPLETE",
        image_url: result.url,
        name: result.name || "Untitled Artifact",
        explanation: result.explanation ?? "",
      });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        error: error instanceof Error ? error.message : "Generation failed",
      });
    }
  };

  const handleGenerate3D = async () => {
    if (!session.generated_image_url) return;

    dispatch({ type: "START_3D_GENERATION" });

    try {
      const res = await fetch("/api/generate-3d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: session.generated_image_url,
          model_3d: model3D,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `3D generation failed (${res.status})`);
      }
      const result = await res.json();
      dispatch({ type: "THREE_D_COMPLETE", model_3d_url: result.url });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        error: error instanceof Error ? error.message : "3D generation failed",
      });
    }
  };

  const loaderConfig =
    session.status === "analyzing"
      ? {
          label: "EXTRACTING SPATIAL RECALL",
          sublabel: "STAGE 01 · KEYWORD + TONE EXTRACTION",
          estimatedSeconds: 5,
        }
      : session.status === "generating"
        ? {
            label: "COMPOSING SCULPTURAL ARTIFACT",
            sublabel: "STAGE 02 · ART DIRECTOR → IMAGE SYNTHESIS",
            estimatedSeconds: 48,
          }
        : session.status === "generating_3d"
          ? {
              label: "LIFTING INTO THREE DIMENSIONS",
              sublabel: `STAGE 03 · ${MODEL_3D_LABELS[model3D].toUpperCase()} RECONSTRUCTION`,
              estimatedSeconds: model3D === "hunyuan3d" ? 180 : 110,
            }
          : null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-12 border-b border-[var(--border)] pb-8">
        <h1 className="text-2xl tracking-[0.3em] font-light glitch-text">
          <GlitchIdle text="INTERACTIVE MEMORY MACHINE" idle={isIdle} />
        </h1>
        <p className="text-sm text-[var(--muted)] mt-2 tracking-widest">
          <GlitchIdle
            text={
              isNightShift
                ? "SUBCONSCIOUS CHANNEL OPEN — NIGHT SHIFT"
                : "SPATIAL DISORIENTATION — NODE MAPPING INTERFACE"
            }
            idle={isIdle}
            minIntervalMs={3200}
            maxIntervalMs={5600}
          />
        </p>
      </header>

      {/* Input Phase */}
      {session.status === "input" && <InputForm onSubmit={handleSubmit} />}

      {/* Loading — mechanical telemetry per stage */}
      {loaderConfig && (
        <div className="mb-6">
          <MechanicalLoader
            key={session.status}
            label={loaderConfig.label}
            sublabel={loaderConfig.sublabel}
            estimatedSeconds={loaderConfig.estimatedSeconds}
          />
        </div>
      )}

      {/* Mapping / Generating / Complete — single canvas instance so internal state persists */}
      {(session.status === "mapping" ||
        session.status === "generating" ||
        session.status === "complete" ||
        session.status === "generating_3d" ||
        session.status === "complete_3d") &&
        session.analysis && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-[var(--muted)] tracking-widest">
                SUBJECT: {session.subject_id} — {session.analysis.keywords.length} KEYWORDS — BASE SHAPE: {session.analysis.tone_archetype?.toUpperCase() || "ORGANIC"}
              </p>
              {session.analysis.interpretation && (
                <p className="text-xs text-[var(--muted)] max-w-md text-right">
                  {session.analysis.interpretation}
                </p>
              )}
            </div>

            {/* Original input text — kept visible through mapping/generating/complete */}
            {session.input_text && (
              <details
                open
                className="border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <summary className="text-xs tracking-widest text-[var(--accent)] cursor-pointer select-none">
                  SUBCONSCIOUS RECALL (INPUT)
                </summary>
                <p className="mt-3 text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                  {session.input_text}
                </p>
              </details>
            )}

            <NodeCanvas
              analysis={session.analysis}
              onConnectionsChange={handleConnectionsChange}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <GenerateButton
                connectionCount={session.canvas?.connections.length ?? 0}
                isGenerating={session.status === "generating"}
                hasPreviousResult={session.status === "complete"}
                onGenerate={handleGenerate}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono-stack)",
                  }}
                >
                  MODEL
                </label>
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value as ImageModel)}
                  style={{
                    background: "var(--card)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                    padding: "6px 10px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono-stack)",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                  }}
                >
                  {(Object.keys(IMAGE_MODEL_LABELS) as ImageModel[]).map((m) => (
                    <option key={m} value={m}>
                      {IMAGE_MODEL_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

      {/* Generated Image Output */}
      {(session.status === "complete" ||
        session.status === "generating_3d" ||
        session.status === "complete_3d") &&
        session.generated_image_url && (
          <div className="mt-8 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs tracking-widest text-[var(--accent)]">
                ARTIFACT NAME
              </label>
              <input
                type="text"
                value={session.artifact_name || ""}
                onChange={(e) =>
                  dispatch({ type: "RENAME_ARTIFACT", name: e.target.value })
                }
                placeholder="Untitled Artifact"
                maxLength={80}
                className="w-full bg-transparent border-0 border-b border-[var(--border)] focus:border-[var(--accent)] outline-none text-2xl tracking-wide py-2 text-[var(--foreground)] transition-colors"
                style={{
                  fontFamily: "var(--font-serif-stack)",
                  fontStyle: "italic",
                  fontWeight: 500,
                }}
              />
              <p
                style={{
                  fontSize: 9,
                  color: "var(--muted)",
                  letterSpacing: "0.15em",
                  fontFamily: "var(--font-mono-stack)",
                }}
              >
                CLICK TO EDIT · USED AS THE EXPORT FILENAME
              </p>
            </div>

            <div className="border border-[var(--border)] p-2">
              <img
                src={session.generated_image_url}
                alt={session.artifact_name || "Generated spatial memory artifact"}
                className="w-full"
              />
            </div>

            {session.explanation && (
              <div className="border border-[var(--border)] bg-[var(--card)] p-6 space-y-3">
                <label className="block text-xs tracking-widest text-[var(--accent)]">
                  YOUR ARTIFACT — EXPLAINED
                </label>
                <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                  {session.explanation}
                </div>
              </div>
            )}

            {/* 3D Viewer — shown once a model has been generated */}
            {session.model_3d_url && (
              <div className="space-y-2 pt-4">
                <label className="block text-xs tracking-widest text-[var(--accent)]">
                  SCULPTURAL ARTIFACT — 3D
                </label>
                <Model3DViewer
                  key={session.model_3d_url}
                  glbUrl={session.model_3d_url}
                  artifactName={session.artifact_name}
                  subjectId={session.subject_id}
                />
              </div>
            )}

            {/* 3D generate / regenerate controls — always visible while image exists */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingTop: 8,
              }}
            >
              <button
                onClick={handleGenerate3D}
                disabled={session.status === "generating_3d"}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "transparent",
                  border: `1px solid ${
                    session.status === "generating_3d"
                      ? "var(--border)"
                      : "var(--accent)"
                  }`,
                  borderRadius: 4,
                  color:
                    session.status === "generating_3d"
                      ? "var(--muted)"
                      : "var(--accent)",
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 13,
                  letterSpacing: "0.2em",
                  cursor:
                    session.status === "generating_3d"
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {session.status === "generating_3d"
                  ? "LIFTING TO 3D..."
                  : session.model_3d_url
                    ? `REGENERATE 3D — ${MODEL_3D_LABELS[model3D].toUpperCase()}`
                    : "VIEW IN 3D"}
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <label
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono-stack)",
                  }}
                >
                  3D MODEL
                </label>
                <select
                  value={model3D}
                  onChange={(e) => setModel3D(e.target.value as Model3D)}
                  disabled={session.status === "generating_3d"}
                  style={{
                    background: "var(--card)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                    padding: "6px 10px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono-stack)",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                  }}
                >
                  {(Object.keys(MODEL_3D_LABELS) as Model3D[]).map((m) => (
                    <option key={m} value={m}>
                      {MODEL_3D_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => dispatch({ type: "RESET" })}
              className="w-full border border-[var(--muted-strong)] text-[var(--muted-strong)] py-3 text-sm tracking-[0.3em] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              NEW SESSION
            </button>
          </div>
        )}

      {/* Error */}
      {session.status === "error" && (
        <div className="border border-red-800 bg-red-950/30 p-6 mt-8">
          <p className="text-red-400 text-sm">ERROR: {session.error}</p>
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="mt-4 text-xs text-[var(--accent)] underline"
          >
            RESTART SESSION
          </button>
        </div>
      )}
    </main>
  );
}
