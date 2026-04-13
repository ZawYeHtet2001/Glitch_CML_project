"use client";

import React from "react";

interface GenerateButtonProps {
  connectionCount: number;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function GenerateButton({
  connectionCount,
  isGenerating,
  onGenerate,
}: GenerateButtonProps) {
  const disabled = connectionCount === 0 || isGenerating;

  return (
    <button
      onClick={onGenerate}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "14px 24px",
        background: disabled ? "var(--card)" : "transparent",
        border: `1px solid ${disabled ? "var(--border)" : "var(--accent)"}`,
        borderRadius: 4,
        color: disabled ? "var(--muted)" : "var(--accent)",
        fontFamily: '"Courier New", monospace',
        fontSize: 13,
        letterSpacing: "0.2em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        marginTop: 12,
      }}
    >
      {isGenerating
        ? "GENERATING..."
        : connectionCount > 0
          ? `GENERATE IMAGE — ${connectionCount} CONNECTION${connectionCount !== 1 ? "S" : ""}`
          : "CONNECT KEYWORDS TO OPERATIONS TO GENERATE"}
    </button>
  );
}
