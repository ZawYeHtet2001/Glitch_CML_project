"use client";

import { useReducer, useCallback } from "react";
import { SessionData, CanvasState } from "@/lib/types";
import InputForm from "@/components/InputForm";
import NodeCanvas from "@/components/NodeCanvas";
import GenerateButton from "@/components/GenerateButton";

type SessionAction =
  | { type: "START_ANALYSIS"; subject_id: string; input_text: string }
  | { type: "ANALYSIS_COMPLETE"; analysis: SessionData["analysis"] }
  | { type: "UPDATE_CANVAS"; canvas: CanvasState }
  | { type: "START_GENERATION" }
  | { type: "GENERATION_COMPLETE"; image_url: string }
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
        status: "complete",
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
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Generation failed (${res.status})`);
      }
      const result = await res.json();
      dispatch({ type: "GENERATION_COMPLETE", image_url: result.url });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        error: error instanceof Error ? error.message : "Generation failed",
      });
    }
  };

  const statusLabel =
    session.status === "analyzing"
      ? "ANALYZING SPATIAL RECALL..."
      : session.status === "generating"
        ? "GENERATING ARTIFACT..."
        : null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-12 border-b border-[var(--border)] pb-8">
        <h1 className="text-2xl tracking-[0.3em] font-light glitch-text">
          INTERACTIVE MEMORY MACHINE
        </h1>
        <p className="text-sm text-[var(--muted)] mt-2 tracking-widest">
          SPATIAL DISORIENTATION — NODE MAPPING INTERFACE
        </p>
      </header>

      {/* Input Phase */}
      {session.status === "input" && <InputForm onSubmit={handleSubmit} />}

      {/* Loading */}
      {statusLabel && (
        <div className="border border-[var(--border)] p-8 text-center">
          <p className="text-sm text-[var(--accent)] tracking-widest typing-cursor">
            {statusLabel}
          </p>
        </div>
      )}

      {/* Mapping Phase — Node Canvas */}
      {(session.status === "mapping" || session.status === "complete") &&
        session.analysis && (
          <div className="space-y-4">
            {/* Session info */}
            <div className="flex justify-between items-center">
              <p className="text-xs text-[var(--muted)] tracking-widest">
                SUBJECT: {session.subject_id} — {session.analysis.keywords.length} KEYWORDS EXTRACTED
              </p>
              {session.analysis.interpretation && (
                <p className="text-xs text-[var(--muted)] max-w-md text-right">
                  {session.analysis.interpretation}
                </p>
              )}
            </div>

            {/* Canvas */}
            <NodeCanvas
              analysis={session.analysis}
              onConnectionsChange={handleConnectionsChange}
            />

            {/* Generate button */}
            {session.status === "mapping" && (
              <GenerateButton
                connectionCount={session.canvas?.connections.length ?? 0}
                isGenerating={false}
                onGenerate={handleGenerate}
              />
            )}
          </div>
        )}

      {/* Generating state with canvas still visible */}
      {session.status === "generating" && session.analysis && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[var(--muted)] tracking-widest">
              SUBJECT: {session.subject_id}
            </p>
          </div>
          <NodeCanvas
            analysis={session.analysis}
            onConnectionsChange={handleConnectionsChange}
          />
          <GenerateButton
            connectionCount={session.canvas?.connections.length ?? 0}
            isGenerating={true}
            onGenerate={handleGenerate}
          />
        </div>
      )}

      {/* Generated Image Output */}
      {session.status === "complete" && session.generated_image_url && (
        <div className="mt-8 space-y-4">
          <label className="block text-xs tracking-widest text-[var(--accent)]">
            GENERATED ARTIFACT
          </label>
          <div className="border border-[var(--border)] p-2">
            <img
              src={session.generated_image_url}
              alt="Generated spatial memory artifact"
              className="w-full"
            />
          </div>
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="text-xs text-[var(--muted)] underline hover:text-[var(--accent)] transition-colors"
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
