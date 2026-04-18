"use client";

import { KeywordCategory } from "@/lib/types";
import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const CATEGORY_COLORS: Record<KeywordCategory, string> = {
  object: "#c8c8c8",
  person: "#e8b84a",
  event: "#8ab4d4",
  spatial_quality: "#7a7a7a",
  experience: "#d96a5c",
};

const CATEGORY_LABELS: Record<KeywordCategory, string> = {
  object: "OBJ",
  person: "PER",
  event: "EVT",
  spatial_quality: "SPA",
  experience: "EXP",
};

interface CategoryShape {
  borderRadius?: number | string;
  clipPath?: string;
  borderStyle?: string;
}

const CATEGORY_SHAPE: Record<KeywordCategory, CategoryShape> = {
  object: { borderRadius: 2 },
  person: { borderRadius: 999 },
  event: {
    clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)",
  },
  spatial_quality: {
    clipPath: "polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%)",
  },
  experience: {
    borderRadius: 999,
    borderStyle: "dashed",
  },
};

interface KeywordFragmentProps {
  id: string;
  text: string;
  category: KeywordCategory;
  position: { x: number; y: number };
  isConnected: boolean;
  isHighlighted: boolean;
  onChipPointerDown: (id: string, e: React.PointerEvent) => void;
  onPortPointerDown: (id: string, e: React.PointerEvent) => void;
  onHoverChange: (id: string, hovered: boolean) => void;
  onSelect: (id: string) => void;
}

export const KEYWORD_WIDTH = 140;
export const KEYWORD_HEIGHT = 36;
export const KEYWORD_PORT_RADIUS = 6;
export const KEYWORD_EXPANDED_WIDTH = 260;

export default function KeywordFragment({
  id,
  text,
  category,
  position,
  isConnected,
  isHighlighted,
  onChipPointerDown,
  onPortPointerDown,
  onHoverChange,
  onSelect,
}: KeywordFragmentProps) {
  const [hovered, setHovered] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  // Detect whether the text gets truncated at the default chip width so we
  // only expand chips that actually need it.
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setOverflows(el.scrollWidth > el.clientWidth);
  }, [text]);

  const handleChipDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).dataset.port) return;
      onChipPointerDown(id, e);
    },
    [id, onChipPointerDown]
  );

  const handlePortDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onPortPointerDown(id, e);
    },
    [id, onPortPointerDown]
  );

  const handleEnter = useCallback(() => {
    setHovered(true);
    if (overflows) onHoverChange(id, true);
  }, [id, overflows, onHoverChange]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    if (overflows) onHoverChange(id, false);
  }, [id, overflows, onHoverChange]);

  const color = CATEGORY_COLORS[category] || "#c8c8c8";
  const shape = CATEGORY_SHAPE[category] || { borderRadius: 2 };
  const expanded = hovered && overflows;
  const width = expanded ? KEYWORD_EXPANDED_WIDTH : KEYWORD_WIDTH;

  const usesClipPath = Boolean(shape.clipPath);
  const chipPaddingX = usesClipPath ? 18 : 10;

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width,
        height: KEYWORD_HEIGHT,
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
        zIndex: expanded ? 10 : 1,
        transition: "width 0.18s ease, filter 0.18s ease",
        filter: isHighlighted
          ? `drop-shadow(0 0 10px var(--accent)) drop-shadow(0 0 5px var(--accent)) drop-shadow(0 0 2px var(--accent))`
          : expanded
            ? `drop-shadow(0 0 6px ${color}55)`
            : "none",
      }}
      title={text}
      onPointerDown={handleChipDown}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: isHighlighted
            ? "var(--card-highlight, #2a2a2a)"
            : "var(--card)",
          ...(usesClipPath
            ? {}
            : {
                borderTop: `1px ${shape.borderStyle ?? "solid"} ${
                  isHighlighted ? "var(--accent)" : "var(--border)"
                }`,
                borderRight: `1px ${shape.borderStyle ?? "solid"} ${
                  isHighlighted ? "var(--accent)" : "var(--border)"
                }`,
                borderBottom: `1px ${shape.borderStyle ?? "solid"} ${
                  isHighlighted ? "var(--accent)" : "var(--border)"
                }`,
                borderLeft: `3px solid ${isHighlighted ? "var(--accent)" : color}`,
              }),
          borderRadius: shape.borderRadius,
          clipPath: shape.clipPath,
          display: "flex",
          alignItems: "center",
          padding: `0 ${chipPaddingX}px`,
          gap: 6,
          fontSize: 12,
          fontFamily: "var(--font-mono-stack)",
          opacity: isConnected ? 1 : 0.75,
          pointerEvents: "none",
          transition:
            "opacity 0.15s ease, border-color 0.15s ease, background 0.15s ease",
        }}
      >
        <span
          style={{
            color,
            fontSize: 9,
            letterSpacing: "0.1em",
            flexShrink: 0,
            fontWeight: 600,
          }}
        >
          {CATEGORY_LABELS[category]}
        </span>
        <span
          ref={textRef}
          style={{
            color: "var(--foreground)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {text}
        </span>
      </div>

      <div
        data-port="output"
        onPointerDown={handlePortDown}
        style={{
          position: "absolute",
          right: -KEYWORD_PORT_RADIUS,
          top: KEYWORD_HEIGHT / 2 - KEYWORD_PORT_RADIUS,
          width: KEYWORD_PORT_RADIUS * 2,
          height: KEYWORD_PORT_RADIUS * 2,
          borderRadius: "50%",
          background: isConnected ? color : "var(--border)",
          border: `2px solid ${color}`,
          cursor: "crosshair",
          zIndex: 2,
          transition: "background 0.15s ease",
        }}
      />
    </div>
  );
}
