"use client";

import { useState } from "react";
import { SessionData } from "@/lib/types";
import InputForm from "@/components/InputForm";
import ProgressTracker from "@/components/ProgressTracker";
import AnalystNotes from "@/components/AnalystNotes";
import ImageComparison from "@/components/ImageComparison";
import SpatialTranslation from "@/components/SpatialTranslation";
import VideoPlayer from "@/components/VideoPlayer";

export default function Home() {
  const [session, setSession] = useState<SessionData>({
    subject_id: "",
    memory_text: "",
    dream_text: "",
    status: "input",
  });

  const runPipeline = async (subjectId: string, memoryText: string, dreamText: string) => {
    setSession({
      subject_id: subjectId,
      memory_text: memoryText,
      dream_text: dreamText,
      status: "analyzing",
    });

    try {
      // Step 3-4: Claude Analysis
      const analysisRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_id: subjectId, memory_text: memoryText, dream_text: dreamText }),
      });
      if (!analysisRes.ok) throw new Error("Analysis failed");
      const analysis = await analysisRes.json();

      setSession((prev) => ({ ...prev, analysis, status: "generating_images" }));

      // Step 2: Generate images (memory + dream visualizations)
      const [memoryImageRes, dreamImageRes] = await Promise.all([
        fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: `Architectural interior space: ${memoryText}`, type: "memory" }),
        }),
        fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: `Dreamlike distorted architectural interior: ${dreamText}`, type: "dream" }),
        }),
      ]);
      if (!memoryImageRes.ok || !dreamImageRes.ok) throw new Error("Image generation failed");
      const memoryImage = await memoryImageRes.json();
      const dreamImage = await dreamImageRes.json();

      setSession((prev) => ({
        ...prev,
        memory_image_url: memoryImage.url,
        dream_image_url: dreamImage.url,
        status: "translating",
      }));

      // Step 5: Spatial Translation
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });
      if (!translateRes.ok) throw new Error("Spatial translation failed");
      const spatialTranslation = await translateRes.json();

      setSession((prev) => ({ ...prev, spatial_translation: spatialTranslation, status: "generating_video" }));

      // Step 6: Generate Video
      const videoRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: dreamImage.url,
          prompt: spatialTranslation.video_prompt,
        }),
      });
      if (!videoRes.ok) throw new Error("Video generation failed");
      const video = await videoRes.json();

      setSession((prev) => ({ ...prev, video_url: video.url, status: "complete" }));
    } catch (error) {
      setSession((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  };

  const steps = [
    { key: "analyzing", label: "01 — ANALYSIS" },
    { key: "generating_images", label: "02 — GENERATION" },
    { key: "translating", label: "03 — SPATIAL TRANSLATION" },
    { key: "generating_video", label: "04 — VIDEO SYNTHESIS" },
    { key: "complete", label: "05 — COMPLETE" },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-16 border-b border-[var(--border)] pb-8">
        <h1 className="text-2xl tracking-[0.3em] font-light glitch-text">
          INTERACTIVE MEMORY MACHINE
        </h1>
        <p className="text-sm text-[var(--muted)] mt-2 tracking-widest">
          SPATIAL DISORIENTATION — MEMORY ANALYSIS LABORATORY
        </p>
      </header>

      {/* Input Form */}
      {session.status === "input" && (
        <InputForm onSubmit={runPipeline} />
      )}

      {/* Pipeline Progress */}
      {session.status !== "input" && (
        <div className="space-y-12">
          <ProgressTracker currentStatus={session.status} steps={steps} />

          {/* Session Info */}
          <div className="border border-[var(--border)] p-4">
            <p className="text-xs text-[var(--muted)] tracking-widest">
              SUBJECT: {session.subject_id} — SESSION #{String(Date.now()).slice(-4)}
            </p>
          </div>

          {/* Analysis & Interpretation */}
          {session.analysis && (
            <AnalystNotes analysis={session.analysis} />
          )}

          {/* Generated Images */}
          {session.memory_image_url && session.dream_image_url && (
            <ImageComparison
              memoryUrl={session.memory_image_url}
              dreamUrl={session.dream_image_url}
            />
          )}

          {/* Spatial Translation */}
          {session.spatial_translation && (
            <SpatialTranslation translation={session.spatial_translation} />
          )}

          {/* Video Output */}
          {session.video_url && (
            <VideoPlayer url={session.video_url} />
          )}

          {/* Error Display */}
          {session.status === "error" && (
            <div className="border border-red-800 bg-red-950/30 p-6">
              <p className="text-red-400 text-sm">ERROR: {session.error}</p>
              <button
                onClick={() => setSession({ subject_id: "", memory_text: "", dream_text: "", status: "input" })}
                className="mt-4 text-xs text-[var(--accent)] underline"
              >
                RESTART SESSION
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
