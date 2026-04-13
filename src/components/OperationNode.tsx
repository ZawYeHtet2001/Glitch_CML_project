"use client";

import { OperationType } from "@/lib/types";
import React from "react";

const OPERATION_META: Record<
  OperationType,
  { label: string; description: string }
> = {
  clarity: { label: "CLARITY", description: "Edge Resolution / Fidelity" },
  completeness: {
    label: "COMPLETENESS",
    description: "Subtraction / Missing Mass",
  },
  stability: {
    label: "STABILITY",
    description: "Tilt / Center of Gravity",
  },
  misassociation: {
    label: "MISASSOCIATION",
    description: "Collision / Hybridization",
  },
  vulnerability: {
    label: "VULNERABILITY",
    description: "Porosity / Shell Thickness",
  },
  intimacy: {
    label: "INTIMACY",
    description: "Compression / Cavity Size",
  },
};

interface OperationNodeProps {
  id: OperationType;
  score: number;
  connectedCount: number;
  position: { x: number; y: number };
  isHovered: boolean;
  onPortPointerEnter: (id: OperationType) => void;
  onPortPointerLeave: () => void;
  onPortPointerUp: (id: OperationType) => void;
}

export const OPERATION_WIDTH = 220;
export const OPERATION_HEIGHT = 80;
export const OPERATION_PORT_RADIUS = 7;

export default function OperationNode({
  id,
  score,
  connectedCount,
  position,
  isHovered,
  onPortPointerEnter,
  onPortPointerLeave,
  onPortPointerUp,
}: OperationNodeProps) {
  const meta = OPERATION_META[id];

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: OPERATION_WIDTH,
        height: OPERATION_HEIGHT,
        userSelect: "none",
      }}
    >
      {/* Input port (left edge) */}
      <div
        data-port="input"
        onPointerEnter={() => onPortPointerEnter(id)}
        onPointerLeave={onPortPointerLeave}
        onPointerUp={() => onPortPointerUp(id)}
        style={{
          position: "absolute",
          left: -OPERATION_PORT_RADIUS,
          top: OPERATION_HEIGHT / 2 - OPERATION_PORT_RADIUS,
          width: OPERATION_PORT_RADIUS * 2,
          height: OPERATION_PORT_RADIUS * 2,
          borderRadius: "50%",
          background: isHovered ? "var(--accent)" : connectedCount > 0 ? "var(--accent)" : "var(--border)",
          border: "2px solid var(--accent)",
          cursor: "crosshair",
          zIndex: 2,
          boxShadow: isHovered ? "0 0 12px var(--accent)" : "none",
          transition: "box-shadow 0.15s ease",
        }}
      />

      {/* Node body */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "var(--card)",
          border: `1px solid ${isHovered ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 4,
          padding: "8px 14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: '"Courier New", monospace',
          transition: "border-color 0.15s ease",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "var(--accent)",
              fontSize: 11,
              letterSpacing: "0.2em",
              fontWeight: 600,
            }}
          >
            {meta.label}
          </span>
          {connectedCount > 0 && (
            <span
              style={{
                color: "var(--accent)",
                fontSize: 10,
                background: "rgba(212, 160, 23, 0.15)",
                padding: "1px 6px",
                borderRadius: 3,
              }}
            >
              {connectedCount}
            </span>
          )}
        </div>

        {/* Description */}
        <span style={{ color: "var(--muted)", fontSize: 10 }}>
          {meta.description}
        </span>

        {/* Score bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              flex: 1,
              height: 4,
              background: "var(--border)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${score * 100}%`,
                height: "100%",
                background: "var(--accent)",
                borderRadius: 2,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span style={{ color: "var(--foreground)", fontSize: 11, width: 32, textAlign: "right" }}>
            {score.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
