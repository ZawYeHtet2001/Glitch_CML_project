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
import MachineViewport from "@/components/MachineViewport";
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
          estimatedSeconds: 8,
        }
      : session.status === "generating"
        ? {
            label: "COMPOSING SCULPTURAL ARTIFACT",
            sublabel: "STAGE 02 · ART DIRECTOR → IMAGE SYNTHESIS",
            estimatedSeconds: 95,
          }
        : session.status === "generating_3d"
          ? {
              label: "LIFTING INTO THREE DIMENSIONS",
              sublabel: `STAGE 03 · ${MODEL_3D_LABELS[model3D].toUpperCase()} RECONSTRUCTION`,
              estimatedSeconds: model3D === "hunyuan3d" ? 300 : 150,
            }
          : null;

  return (
    <main
      className="mx-auto relative"
      style={{
        maxWidth: 1280,
        paddingLeft: 32,
        paddingRight: 32,
        paddingTop: 56,
        paddingBottom: 64,
        zIndex: 10,
      }}
    >
      {/* Marquee subtitle — sits above the first panel, below the chassis top band */}
      <div
        className="crt-warmup"
        style={{
          marginTop: 20,
          marginBottom: 18,
          padding: "10px 16px",
          background: "rgba(255, 179, 71, 0.04)",
          border: "1px solid rgba(255, 179, 71, 0.25)",
          borderRadius: 3,
          fontFamily: "var(--font-matrix-stack)",
          fontSize: 18,
          letterSpacing: "0.12em",
          color: "var(--amber-phosphor)",
          textShadow: "var(--amber-glow)",
          textAlign: "center",
        }}
      >
        <GlitchIdle
          text={
            isNightShift
              ? "◆ SUBCONSCIOUS CHANNEL OPEN — NIGHT SHIFT ◆"
              : "◆ SPATIAL DISORIENTATION — NODE MAPPING INTERFACE ◆"
          }
          idle={isIdle}
          minIntervalMs={3200}
          maxIntervalMs={5600}
        />
      </div>

      {/* Input Phase */}
      {session.status === "input" && (
        <MachineViewport
          label="INPUT / MEMORY BUS"
          id="SUBJECT-STREAM"
          ledColor="green"
        >
          <InputForm onSubmit={handleSubmit} />
        </MachineViewport>
      )}

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
            {/* Subject / archetype readout — amber phosphor strip */}
            <MachineViewport
              label="ANALYSIS / RESULT"
              id={`CH.01 · ${session.subject_id || "??"}`}
              ledColor="green"
              screws={false}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 20,
                  fontFamily: "var(--font-matrix-stack)",
                }}
              >
                <div
                  style={{
                    color: "var(--amber-phosphor-hot)",
                    textShadow: "var(--amber-glow)",
                    fontSize: 16,
                    letterSpacing: "0.08em",
                  }}
                >
                  &gt; SUBJECT:&nbsp;{session.subject_id} &nbsp;·&nbsp; {session.analysis.keywords.length} KEYWORDS &nbsp;·&nbsp; BASE SHAPE: {session.analysis.tone_archetype?.toUpperCase() || "ORGANIC"}
                </div>
                {session.analysis.interpretation && (
                  <div
                    style={{
                      color: "var(--amber-phosphor-dim)",
                      textShadow: "0 0 3px rgba(255, 179, 71, 0.35)",
                      fontSize: 14,
                      maxWidth: 420,
                      textAlign: "right",
                      lineHeight: 1.25,
                    }}
                  >
                    {session.analysis.interpretation}
                  </div>
                )}
              </div>
            </MachineViewport>

            {/* Original input text — kept visible through mapping/generating/complete */}
            {session.input_text && (
              <MachineViewport
                label="SUBCONSCIOUS RECALL / INPUT LOG"
                id="ARCHIVED"
                ledColor="amber"
              >
                <details open style={{ color: "var(--amber-phosphor)" }}>
                  <summary
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      fontFamily: "var(--font-matrix-stack)",
                      fontSize: 15,
                      letterSpacing: "0.08em",
                      color: "var(--amber-phosphor-hot)",
                      textShadow: "var(--amber-glow)",
                      paddingBottom: 8,
                      borderBottom: "1px solid rgba(255, 179, 71, 0.25)",
                    }}
                  >
                    &gt; cat /archive/subject/{session.subject_id || "??"}/recall.log
                  </summary>
                  <p
                    style={{
                      marginTop: 12,
                      fontFamily: "var(--font-matrix-stack)",
                      fontSize: 16,
                      lineHeight: 1.45,
                      color: "var(--amber-phosphor)",
                      textShadow: "0 0 4px rgba(255, 179, 71, 0.45)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {session.input_text}
                  </p>
                </details>
              </MachineViewport>
            )}

            <MachineViewport
              label="NODE GRAPH / DISTORTION MAP"
              id="12 CHANNELS"
              ledColor="amber"
            >
              <NodeCanvas
                analysis={session.analysis}
                onConnectionsChange={handleConnectionsChange}
              />
            </MachineViewport>

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
                <label className="stencil" style={{ fontSize: 10 }}>
                  MODEL
                </label>
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value as ImageModel)}
                  className="crt-select"
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
            <MachineViewport
              label="ARTIFACT / IDENTIFIER"
              id="FILENAME"
              ledColor="amber"
            >
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-matrix-stack)",
                  fontSize: 14,
                  letterSpacing: "0.1em",
                  color: "var(--amber-phosphor-dim)",
                  textShadow: "0 0 3px rgba(255, 179, 71, 0.35)",
                  marginBottom: 6,
                }}
              >
                &gt; ARTIFACT NAME
              </label>
              <input
                type="text"
                value={session.artifact_name || ""}
                onChange={(e) =>
                  dispatch({ type: "RENAME_ARTIFACT", name: e.target.value })
                }
                placeholder="Untitled Artifact"
                maxLength={80}
                className="crt-input"
                style={{
                  fontSize: 26,
                  paddingBottom: 6,
                  borderBottom: "1px solid rgba(255, 179, 71, 0.3)",
                }}
              />
              <p
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "var(--amber-phosphor-dim)",
                  textShadow: "0 0 3px rgba(255, 179, 71, 0.3)",
                  letterSpacing: "0.12em",
                  fontFamily: "var(--font-matrix-stack)",
                }}
              >
                // CLICK TO EDIT · USED AS THE EXPORT FILENAME
              </p>
            </MachineViewport>

            <MachineViewport
              label="ARTIFACT / 2D"
              id={`FRAME · ${session.subject_id || "??"}`}
              ledColor="amber"
              crt={false}
              phosphor={false}
              chamber={false}
            >
              <div style={{ padding: 0, background: "#000" }}>
                <img
                  src={session.generated_image_url}
                  alt={session.artifact_name || "Generated spatial memory artifact"}
                  className="w-full"
                  style={{ display: "block" }}
                />
              </div>
            </MachineViewport>

            {session.explanation && (
              <MachineViewport label="INTERPRETATION / LOG" ledColor="green">
                <div
                  style={{
                    fontFamily: "var(--font-matrix-stack)",
                    fontSize: 16,
                    lineHeight: 1.45,
                    color: "var(--amber-phosphor)",
                    textShadow: "0 0 4px rgba(255, 179, 71, 0.45)",
                    whiteSpace: "pre-wrap",
                    letterSpacing: "0.02em",
                  }}
                >
                  {session.explanation}
                </div>
              </MachineViewport>
            )}

            {/* 3D Viewer — thin amber frame, dark inside. */}
            {session.model_3d_url && (
              <div className="pt-4">
                <MachineViewport
                  label="ARTIFACT / 3D · ORBIT"
                  id={`MESH · ${(MODEL_3D_LABELS[model3D] || "").toUpperCase()}`}
                  ledColor="amber"
                  crt={false}
                  phosphor={false}
                  chamber={false}
                >
                  <div style={{ padding: 12, background: "var(--background)" }}>
                    <Model3DViewer
                      key={session.model_3d_url}
                      glbUrl={session.model_3d_url}
                      artifactName={session.artifact_name}
                      subjectId={session.subject_id}
                    />
                  </div>
                </MachineViewport>
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
                className="machine-btn machine-btn-primary"
                style={{ flex: 1 }}
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
                <label className="stencil" style={{ fontSize: 10 }}>
                  3D MODEL
                </label>
                <select
                  value={model3D}
                  onChange={(e) => setModel3D(e.target.value as Model3D)}
                  disabled={session.status === "generating_3d"}
                  className="crt-select"
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
              className="machine-btn machine-btn-ghost"
              style={{ width: "100%" }}
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
