"use client";

import { OperationType } from "@/lib/types";
import React from "react";

const OPERATION_META: Record<
  OperationType,
  { label: string; description: string; subtext: string }
> = {
  clarity: {
    label: "CLARITY",
    description: "Boundary Diffusion",
    subtext: "Dissolves edges — connected forms blur and merge into neighbours",
  },
  completeness: {
    label: "COMPLETENESS",
    description: "Mass Subtraction",
    subtext: "Carves away volume — scoops, voids, and hollows erode the form",
  },
  stability: {
    label: "STABILITY",
    description: "Gravitational Shift",
    subtext: "Tilts and suspends — rotates the form off-axis, defying gravity",
  },
  misassociation: {
    label: "MISASSOCIATION",
    description: "Cross-Morphology Fusion",
    subtext: "Merges incompatible shapes — forces foreign forms into one body",
  },
  vulnerability: {
    label: "VULNERABILITY",
    description: "Interior Reveal",
    subtext: "Peels open surfaces — exposes hidden inner layers and cavities",
  },
  intimacy: {
    label: "INTIMACY",
    description: "Scale Compression",
    subtext: "Collapses space — surrounding mass folds inward, crushing scale",
  },
  temperature: {
    label: "TEMPERATURE",
    description: "Freeze ↔ Melt",
    subtext: "Thermal state — low: ice/frost crystallisation, high: molten flow",
  },
  pressure: {
    label: "PRESSURE",
    description: "Smooth ↔ Shatter",
    subtext: "Surface tension — low: glassy calm polish, high: jagged spikes",
  },
  luminosity: {
    label: "LUMINOSITY",
    description: "Shadow ↔ Radiance",
    subtext: "Light intensity — low: consumed by darkness, high: blinding glow",
  },
  material: {
    label: "MATERIAL",
    description: "Substance Identity",
    subtext: "What the sculpture is made from — connected keywords define the physical material",
  },
  texture: {
    label: "TEXTURE",
    description: "Surface Grain",
    subtext: "Tactile quality — connected keywords set roughness, smoothness, grain",
  },
  color: {
    label: "COLOR",
    description: "Chromatic Palette",
    subtext: "Color identity — connected keywords drive the palette and saturation",
  },
};

interface OperationNodeProps {
  id: OperationType;
  score: number;
  connectedCount: number;
  position: { x: number; y: number };
  isHovered: boolean;
  isHighlighted: boolean;
  onPortPointerEnter: (id: OperationType) => void;
  onPortPointerLeave: () => void;
  onPortPointerUp: (id: OperationType) => void;
  onSelect: (id: OperationType) => void;
}

export const OPERATION_WIDTH = 240;
export const OPERATION_HEIGHT = 90;
export const OPERATION_PORT_RADIUS = 7;

export default function OperationNode({
  id,
  score,
  connectedCount,
  position,
  isHovered,
  isHighlighted,
  onPortPointerEnter,
  onPortPointerLeave,
  onPortPointerUp,
  onSelect,
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
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
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
        className={
          connectedCount > 0 && !isHighlighted && !isHovered
            ? "node-connected-breath"
            : undefined
        }
        style={{
          width: "100%",
          height: "100%",
          background: "var(--card)",
          border: `1px solid ${
            isHovered || isHighlighted
              ? "var(--accent)"
              : connectedCount > 0
                ? "rgba(232, 184, 74, 0.55)"
                : "var(--border)"
          }`,
          borderRadius: 4,
          padding: "8px 14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono-stack)",
          boxShadow: isHighlighted
            ? "0 0 14px var(--accent), 0 0 4px var(--accent)"
            : "none",
          transition: "border-color 0.15s ease, box-shadow 0.18s ease",
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
              key={connectedCount}
              className="badge-pop"
              style={{
                color: "var(--accent)",
                fontSize: 10,
                background: "rgba(212, 160, 23, 0.15)",
                padding: "1px 6px",
                borderRadius: 3,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {connectedCount}
            </span>
          )}
        </div>

        {/* Description + subtext */}
        <div style={{ lineHeight: 1.3 }}>
          <span style={{ color: "var(--foreground)", fontSize: 10, opacity: 0.7 }}>
            {meta.description}
          </span>
          <br />
          <span style={{ color: "var(--muted)", fontSize: 9 }}>
            {meta.subtext}
          </span>
        </div>

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
