"use client";

import { useEffect, useState } from "react";
import { AnalysisResult } from "@/lib/types";

interface AnalystNotesProps {
  analysis: AnalysisResult;
}

export default function AnalystNotes({ analysis }: AnalystNotesProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const fullText = analysis.analyst_notes;
    let index = 0;
    setDisplayedText("");
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [analysis.analyst_notes]);

  const typeColors: Record<string, string> = {
    OMISSION: "text-red-400 border-red-400/30",
    OBSCURATION: "text-yellow-400 border-yellow-400/30",
    MISASSOCIATION: "text-blue-400 border-blue-400/30",
  };

  return (
    <section className="space-y-6">
      <h2 className="text-xs tracking-widest text-[var(--accent)]">
        03 — ANALYSIS &amp; INTERPRETATION
      </h2>

      {/* Analyst Prose */}
      <div className="border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-xs tracking-widest text-[var(--muted)] mb-4">ANALYST NOTES</p>
        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isTyping ? "typing-cursor" : ""}`}>
          {displayedText}
        </p>
      </div>

      {/* Distortion Cards */}
      <div className="grid gap-3">
        {analysis.distortions.map((d, i) => (
          <div
            key={i}
            className={`border p-4 bg-[var(--card)] ${typeColors[d.type] || "border-[var(--border)]"}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] tracking-widest font-bold">{d.type}</span>
              <span className="text-[10px] text-[var(--muted)]">
                SEVERITY: {"█".repeat(d.severity)}{"░".repeat(5 - d.severity)}
              </span>
            </div>
            <p className="text-sm mb-1">
              <span className="text-[var(--muted)]">Element:</span> {d.element}
            </p>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {d.interpretation}
            </p>
          </div>
        ))}
      </div>

      {/* Overall Pattern */}
      <div className="border-l-2 border-[var(--accent)] pl-4">
        <p className="text-xs tracking-widest text-[var(--muted)] mb-1">DOMINANT PATTERN</p>
        <p className="text-sm">{analysis.overall_pattern}</p>
      </div>
    </section>
  );
}
