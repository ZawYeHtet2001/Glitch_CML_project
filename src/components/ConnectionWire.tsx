"use client";

import React from "react";

interface ConnectionWireProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive?: boolean; // true for the wire being drawn
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export default function ConnectionWire({
  from,
  to,
  isActive = false,
  isSelected = false,
  onClick,
  onPointerDown,
}: ConnectionWireProps) {
  const dx = Math.abs(to.x - from.x) * 0.4;
  const d = `M ${from.x},${from.y} C ${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`;

  return (
    <>
      {/* Invisible wider path for easier clicking */}
      {!isActive && (
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={12}
          onClick={onClick}
          onPointerDown={onPointerDown}
          style={{ cursor: "pointer", pointerEvents: "stroke" }}
        />
      )}
      {/* Visible wire */}
      <path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={isSelected ? 2 : 1.5}
        strokeOpacity={isActive ? 0.4 : isSelected ? 1 : 0.6}
        strokeDasharray={isActive ? "6 4" : undefined}
        className={!isActive ? "wire-draw-in" : undefined}
        style={{ pointerEvents: "none" }}
      />
    </>
  );
}
