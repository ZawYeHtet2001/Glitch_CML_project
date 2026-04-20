"use client";

import React from "react";

interface GenerateButtonProps {
  connectionCount: number;
  isGenerating: boolean;
  hasPreviousResult?: boolean;
  onGenerate: () => void;
}

export default function GenerateButton({
  connectionCount,
  isGenerating,
  hasPreviousResult = false,
  onGenerate,
}: GenerateButtonProps) {
  const disabled = connectionCount === 0 || isGenerating;

  const label = isGenerating
    ? "GENERATING..."
    : connectionCount > 0
      ? `${hasPreviousResult ? "REGENERATE" : "GENERATE IMAGE"} — ${connectionCount} CONNECTION${connectionCount !== 1 ? "S" : ""}`
      : "CONNECT KEYWORDS TO OPERATIONS TO GENERATE";

  return (
    <button
      onClick={onGenerate}
      disabled={disabled}
      className="machine-btn machine-btn-primary"
      style={{ width: "100%", marginTop: 12 }}
    >
      {label}
    </button>
  );
}
