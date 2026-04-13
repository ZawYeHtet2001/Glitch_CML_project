"use client";

import { KeywordCategory } from "@/lib/types";
import React, { useCallback, useRef } from "react";

const CATEGORY_COLORS: Record<KeywordCategory, string> = {
  object: "#e5e5e5",
  person: "#d4a017",
  event: "#8a8a8a",
  spatial_quality: "#6a6a6a",
  experience: "#b8860b",
};

const CATEGORY_LABELS: Record<KeywordCategory, string> = {
  object: "OBJ",
  person: "PER",
  event: "EVT",
  spatial_quality: "SPA",
  experience: "EXP",
};

interface KeywordFragmentProps {
  id: string;
  text: string;
  category: KeywordCategory;
  position: { x: number; y: number };
  isConnected: boolean;
  onDragMove: (id: string, x: number, y: number) => void;
  onPortDragStart: (id: string) => void;
}

export const KEYWORD_WIDTH = 140;
export const KEYWORD_HEIGHT = 36;
export const KEYWORD_PORT_RADIUS = 6;

export default function KeywordFragment({
  id,
  text,
  category,
  position,
  isConnected,
  onDragMove,
  onPortDragStart,
}: KeywordFragmentProps) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).dataset.port) return;
      dragging.current = true;
      offset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      onDragMove(id, e.clientX - offset.current.x, e.clientY - offset.current.y);
    },
    [id, onDragMove]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handlePortPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onPortDragStart(id);
    },
    [id, onPortDragStart]
  );

  const borderColor = CATEGORY_COLORS[category];

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: KEYWORD_WIDTH,
        height: KEYWORD_HEIGHT,
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Chip body */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderLeft: `3px solid ${borderColor}`,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 6,
          fontSize: 12,
          fontFamily: '"Courier New", monospace',
          opacity: isConnected ? 1 : 0.7,
        }}
      >
        <span
          style={{
            color: borderColor,
            fontSize: 9,
            letterSpacing: "0.1em",
            flexShrink: 0,
          }}
        >
          {CATEGORY_LABELS[category]}
        </span>
        <span
          style={{
            color: "var(--foreground)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>

      {/* Output port (right edge) */}
      <div
        data-port="output"
        onPointerDown={handlePortPointerDown}
        style={{
          position: "absolute",
          right: -KEYWORD_PORT_RADIUS,
          top: KEYWORD_HEIGHT / 2 - KEYWORD_PORT_RADIUS,
          width: KEYWORD_PORT_RADIUS * 2,
          height: KEYWORD_PORT_RADIUS * 2,
          borderRadius: "50%",
          background: isConnected ? "var(--accent)" : "var(--border)",
          border: "2px solid var(--accent)",
          cursor: "crosshair",
          zIndex: 2,
        }}
      />
    </div>
  );
}
