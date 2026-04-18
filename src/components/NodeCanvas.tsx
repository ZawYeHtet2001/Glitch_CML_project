"use client";

import React, { useReducer, useCallback, useRef, useEffect } from "react";
import {
  KeywordFragment as KeywordFragmentType,
  OperationNode as OperationNodeType,
  OperationType,
  Connection,
  SubconsciousAnalysis,
  CanvasState,
} from "@/lib/types";
import KeywordFragment, {
  KEYWORD_WIDTH,
  KEYWORD_EXPANDED_WIDTH,
  KEYWORD_HEIGHT,
  KEYWORD_PORT_RADIUS,
} from "./KeywordFragment";
import OperationNode, {
  OPERATION_WIDTH,
  OPERATION_HEIGHT,
  OPERATION_PORT_RADIUS,
} from "./OperationNode";
import ConnectionWire from "./ConnectionWire";

// --- Operation definitions with fixed order ---
const OPERATION_DEFS: {
  id: OperationType;
  label: string;
  description: string;
}[] = [
  { id: "clarity", label: "CLARITY", description: "Boundary Diffusion" },
  { id: "completeness", label: "COMPLETENESS", description: "Mass Subtraction" },
  { id: "stability", label: "STABILITY", description: "Gravitational Shift" },
  { id: "misassociation", label: "MISASSOCIATION", description: "Cross-Morphology Fusion" },
  { id: "vulnerability", label: "VULNERABILITY", description: "Interior Reveal" },
  { id: "intimacy", label: "INTIMACY", description: "Scale Compression" },
  { id: "temperature", label: "TEMPERATURE", description: "Freeze ↔ Melt" },
  { id: "pressure", label: "PRESSURE", description: "Smooth ↔ Shatter" },
  { id: "luminosity", label: "LUMINOSITY", description: "Shadow ↔ Radiance" },
  { id: "material", label: "MATERIAL", description: "Substance Identity" },
  { id: "texture", label: "TEXTURE", description: "Surface Grain" },
  { id: "color", label: "COLOR", description: "Chromatic Palette" },
];

// --- Canvas reducer ---
type CanvasAction =
  | {
      type: "INIT_CANVAS";
      analysis: SubconsciousAnalysis;
      canvasWidth: number;
      canvasHeight: number;
    }
  | { type: "MOVE_KEYWORD"; id: string; x: number; y: number }
  | { type: "START_WIRE"; fromKeywordId: string }
  | { type: "UPDATE_WIRE_POSITION"; x: number; y: number }
  | { type: "COMPLETE_CONNECTION"; toOperationId: OperationType }
  | { type: "CANCEL_WIRE" }
  | { type: "REMOVE_CONNECTION"; connectionId: string }
  | { type: "SELECT"; selection: Selection }
  | {
      type: "RETRACT_CONNECTION";
      connectionId: string;
      mousePos: { x: number; y: number };
    };

type Selection =
  | { kind: "wire"; id: string }
  | { kind: "keyword"; id: string }
  | { kind: "operation"; id: OperationType }
  | null;

interface CanvasReducerState extends CanvasState {
  selection: Selection;
}

const initialState: CanvasReducerState = {
  keywords: [],
  operations: [],
  connections: [],
  activeWire: null,
  selection: null,
};

function canvasReducer(
  state: CanvasReducerState,
  action: CanvasAction
): CanvasReducerState {
  switch (action.type) {
    case "INIT_CANVAS": {
      const { analysis, canvasWidth, canvasHeight } = action;
      const opX = canvasWidth - OPERATION_WIDTH - 40;
      const opSpacing = OPERATION_HEIGHT + 8;
      const totalOpHeight = opSpacing * OPERATION_DEFS.length;
      const opStartY = Math.max(
        20,
        (canvasHeight - totalOpHeight) / 2
      );

      const operations: OperationNodeType[] = OPERATION_DEFS.map(
        (def, i) => ({
          ...def,
          score: analysis.scores[def.id],
          position: { x: opX, y: opStartY + i * opSpacing },
          connectedKeywords: [],
        })
      );

      // Group keywords by category, stagger vertically
      const kwSpacing = Math.min(
        (canvasHeight - 40) / analysis.keywords.length,
        52
      );
      const kwStartY =
        (canvasHeight - kwSpacing * analysis.keywords.length) / 2;

      const keywords: KeywordFragmentType[] = analysis.keywords.map(
        (kw, i) => ({
          ...kw,
          position: { x: 40, y: kwStartY + i * kwSpacing },
        })
      );

      return {
        ...initialState,
        keywords,
        operations,
      };
    }

    case "MOVE_KEYWORD":
      return {
        ...state,
        keywords: state.keywords.map((kw) =>
          kw.id === action.id
            ? { ...kw, position: { x: action.x, y: action.y } }
            : kw
        ),
      };

    case "START_WIRE":
      return {
        ...state,
        activeWire: {
          fromKeywordId: action.fromKeywordId,
          mousePos: { x: 0, y: 0 },
        },
        selection: null,
      };

    case "UPDATE_WIRE_POSITION":
      if (!state.activeWire) return state;
      return {
        ...state,
        activeWire: {
          ...state.activeWire,
          mousePos: { x: action.x, y: action.y },
        },
      };

    case "COMPLETE_CONNECTION": {
      if (!state.activeWire) return state;
      const { fromKeywordId } = state.activeWire;
      const { toOperationId } = action;

      // Check if connection already exists
      const exists = state.connections.some(
        (c) =>
          c.fromKeywordId === fromKeywordId &&
          c.toOperationId === toOperationId
      );
      if (exists) return { ...state, activeWire: null };

      const newConnection: Connection = {
        id: `conn-${fromKeywordId}-${toOperationId}`,
        fromKeywordId,
        toOperationId,
      };

      return {
        ...state,
        activeWire: null,
        connections: [...state.connections, newConnection],
        operations: state.operations.map((op) =>
          op.id === toOperationId
            ? {
                ...op,
                connectedKeywords: [...op.connectedKeywords, fromKeywordId],
              }
            : op
        ),
      };
    }

    case "CANCEL_WIRE":
      return { ...state, activeWire: null };

    case "REMOVE_CONNECTION": {
      const conn = state.connections.find(
        (c) => c.id === action.connectionId
      );
      if (!conn) return state;
      return {
        ...state,
        connections: state.connections.filter(
          (c) => c.id !== action.connectionId
        ),
        operations: state.operations.map((op) =>
          op.id === conn.toOperationId
            ? {
                ...op,
                connectedKeywords: op.connectedKeywords.filter(
                  (kid) => kid !== conn.fromKeywordId
                ),
              }
            : op
        ),
        selection: null,
      };
    }

    case "SELECT":
      return { ...state, selection: action.selection };

    case "RETRACT_CONNECTION": {
      // Grasshopper-style: remove the existing connection and immediately
      // start a new active wire from the same keyword, following the mouse.
      const conn = state.connections.find(
        (c) => c.id === action.connectionId
      );
      if (!conn) return state;
      return {
        ...state,
        connections: state.connections.filter(
          (c) => c.id !== action.connectionId
        ),
        operations: state.operations.map((op) =>
          op.id === conn.toOperationId
            ? {
                ...op,
                connectedKeywords: op.connectedKeywords.filter(
                  (kid) => kid !== conn.fromKeywordId
                ),
              }
            : op
        ),
        selection: null,
        activeWire: {
          fromKeywordId: conn.fromKeywordId,
          mousePos: action.mousePos,
        },
      };
    }

    default:
      return state;
  }
}

// --- NodeCanvas component ---

interface NodeCanvasProps {
  analysis: SubconsciousAnalysis;
  onConnectionsChange: (state: CanvasState) => void;
}

export default function NodeCanvas({
  analysis,
  onConnectionsChange,
}: NodeCanvasProps) {
  const [state, dispatch] = useReducer(canvasReducer, initialState);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredOpRef = useRef<OperationType | null>(null);
  const [hoveredOp, setHoveredOp] = React.useState<OperationType | null>(null);
  const [hoveredKeywordId, setHoveredKeywordId] = React.useState<string | null>(
    null
  );

  // Drag state (viewport-to-canvas mapping handled here)
  const dragRef = useRef<{
    keywordId: string;
    // Offset between pointer position (canvas coords) and chip's top-left (canvas coords)
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Initialize canvas when analysis arrives
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dispatch({
      type: "INIT_CANVAS",
      analysis,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    });
  }, [analysis]);

  // Notify parent of connection changes
  useEffect(() => {
    onConnectionsChange(state);
  }, [state.connections, onConnectionsChange, state]);

  // Keyboard handler: Delete/Backspace removes a selected wire; Escape clears.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        state.selection?.kind === "wire"
      ) {
        dispatch({
          type: "REMOVE_CONNECTION",
          connectionId: state.selection.id,
        });
      }
      if (e.key === "Escape") {
        dispatch({ type: "CANCEL_WIRE" });
        dispatch({ type: "SELECT", selection: null });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.selection]);

  // Convert viewport coords to canvas-relative coords
  const toCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  // Keyword chip drag start
  const handleChipPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      const kw = state.keywords.find((k) => k.id === id);
      if (!kw) return;
      const { x, y } = toCanvasCoords(e.clientX, e.clientY);
      dragRef.current = {
        keywordId: id,
        offsetX: x - kw.position.x,
        offsetY: y - kw.position.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [state.keywords, toCanvasCoords]
  );

  // Wire start from keyword port
  const handlePortPointerDown = useCallback(
    (id: string, _e: React.PointerEvent) => {
      dispatch({ type: "START_WIRE", fromKeywordId: id });
    },
    []
  );

  // Pointer move on canvas — handles both chip drag and wire drawing
  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const { x, y } = toCanvasCoords(e.clientX, e.clientY);

      // Chip dragging takes priority
      if (dragRef.current) {
        dispatch({
          type: "MOVE_KEYWORD",
          id: dragRef.current.keywordId,
          x: x - dragRef.current.offsetX,
          y: y - dragRef.current.offsetY,
        });
        return;
      }

      // Wire drawing
      if (state.activeWire) {
        dispatch({ type: "UPDATE_WIRE_POSITION", x, y });
      }
    },
    [state.activeWire, toCanvasCoords]
  );

  // Pointer up — end drag or complete/cancel wire
  const handleCanvasPointerUp = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = null;
      return;
    }
    if (state.activeWire) {
      if (hoveredOpRef.current) {
        dispatch({
          type: "COMPLETE_CONNECTION",
          toOperationId: hoveredOpRef.current,
        });
      } else {
        dispatch({ type: "CANCEL_WIRE" });
      }
    }
  }, [state.activeWire]);

  // Operation port hover
  const handleOpPortEnter = useCallback((id: OperationType) => {
    hoveredOpRef.current = id;
    setHoveredOp(id);
  }, []);

  const handleOpPortLeave = useCallback(() => {
    hoveredOpRef.current = null;
    setHoveredOp(null);
  }, []);

  // Operation port drop
  const handleOpPortUp = useCallback(
    (id: OperationType) => {
      if (state.activeWire) {
        dispatch({ type: "COMPLETE_CONNECTION", toOperationId: id });
      }
    },
    [state.activeWire]
  );

  // Compute wire endpoints. When a keyword is hovered and its chip expands
  // rightward, the port moves with it — wires should track the port.
  const getKeywordPortPos = (kwId: string) => {
    const kw = state.keywords.find((k) => k.id === kwId);
    if (!kw) return { x: 0, y: 0 };
    const width =
      hoveredKeywordId === kwId ? KEYWORD_EXPANDED_WIDTH : KEYWORD_WIDTH;
    return {
      x: kw.position.x + width + KEYWORD_PORT_RADIUS,
      y: kw.position.y + KEYWORD_HEIGHT / 2,
    };
  };

  const handleKeywordHoverChange = useCallback((id: string, hovered: boolean) => {
    setHoveredKeywordId((prev) => {
      if (hovered) return id;
      return prev === id ? null : prev;
    });
  }, []);

  // Grasshopper-style: Ctrl/Cmd + mouse-down on an existing wire retracts it
  // into a new active wire that follows the cursor. Without the modifier the
  // event falls through to the normal click handler for selection.
  const handleWirePointerDown = useCallback(
    (connectionId: string, e: React.PointerEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.stopPropagation();
      e.preventDefault();
      const { x, y } = toCanvasCoords(e.clientX, e.clientY);
      dispatch({
        type: "RETRACT_CONNECTION",
        connectionId,
        mousePos: { x, y },
      });
    },
    [toCanvasCoords]
  );

  const getOperationPortPos = (opId: OperationType) => {
    const op = state.operations.find((o) => o.id === opId);
    if (!op) return { x: 0, y: 0 };
    return {
      x: op.position.x - OPERATION_PORT_RADIUS,
      y: op.position.y + OPERATION_HEIGHT / 2,
    };
  };

  const connectedKeywordIds = new Set(
    state.connections.map((c) => c.fromKeywordId)
  );

  // Derive highlight sets from the current selection. Clicking a wire lights
  // up the wire + both endpoints; clicking a keyword or operation lights up
  // that node + all connections it participates in + the other endpoints.
  const highlightedConnIds = new Set<string>();
  const highlightedKwIds = new Set<string>();
  const highlightedOpIds = new Set<OperationType>();
  if (state.selection) {
    const sel = state.selection;
    if (sel.kind === "wire") {
      const conn = state.connections.find((c) => c.id === sel.id);
      if (conn) {
        highlightedConnIds.add(conn.id);
        highlightedKwIds.add(conn.fromKeywordId);
        highlightedOpIds.add(conn.toOperationId);
      }
    } else if (sel.kind === "keyword") {
      highlightedKwIds.add(sel.id);
      for (const c of state.connections) {
        if (c.fromKeywordId === sel.id) {
          highlightedConnIds.add(c.id);
          highlightedOpIds.add(c.toOperationId);
        }
      }
    } else if (sel.kind === "operation") {
      highlightedOpIds.add(sel.id);
      for (const c of state.connections) {
        if (c.toOperationId === sel.id) {
          highlightedConnIds.add(c.id);
          highlightedKwIds.add(c.fromKeywordId);
        }
      }
    }
  }

  // Compute minimum canvas height to fit all operation nodes without overlap
  const minOpHeight = OPERATION_DEFS.length * (OPERATION_HEIGHT + 8) + 40;
  const minKwHeight = (state.keywords.length || 10) * 52 + 40;
  const canvasInnerHeight = Math.max(minOpHeight, minKwHeight, 700);

  return (
    <div
      style={{
        width: "100%",
        height: Math.min(canvasInnerHeight, 800),
        border: "1px solid var(--border)",
        borderRadius: 4,
        overflowY: canvasInnerHeight > 800 ? "auto" : "hidden",
        overflowX: "hidden",
        background: "var(--background)",
      }}
    >
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: canvasInnerHeight,
        touchAction: "none",
      }}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onClick={() => dispatch({ type: "SELECT", selection: null })}
    >
      {/* SVG wire layer */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* Established connections */}
        {state.connections.map((conn) => (
          <g key={conn.id} style={{ pointerEvents: "auto" }}>
            <ConnectionWire
              from={getKeywordPortPos(conn.fromKeywordId)}
              to={getOperationPortPos(conn.toOperationId)}
              isSelected={highlightedConnIds.has(conn.id)}
              onClick={(e) => {
                e.stopPropagation();
                dispatch({
                  type: "SELECT",
                  selection: { kind: "wire", id: conn.id },
                });
              }}
              onPointerDown={(e) => handleWirePointerDown(conn.id, e)}
            />
          </g>
        ))}

        {/* Active wire being drawn */}
        {state.activeWire && (
          <ConnectionWire
            from={getKeywordPortPos(state.activeWire.fromKeywordId)}
            to={state.activeWire.mousePos}
            isActive
          />
        )}
      </svg>

      {/* Keyword fragments */}
      {state.keywords.map((kw) => (
        <KeywordFragment
          key={kw.id}
          id={kw.id}
          text={kw.text}
          category={kw.category}
          position={kw.position}
          isConnected={connectedKeywordIds.has(kw.id)}
          isHighlighted={highlightedKwIds.has(kw.id)}
          onChipPointerDown={handleChipPointerDown}
          onPortPointerDown={handlePortPointerDown}
          onHoverChange={handleKeywordHoverChange}
          onSelect={(id) =>
            dispatch({ type: "SELECT", selection: { kind: "keyword", id } })
          }
        />
      ))}

      {/* Operation nodes */}
      {state.operations.map((op) => (
        <OperationNode
          key={op.id}
          id={op.id}
          score={op.score}
          connectedCount={op.connectedKeywords.length}
          position={op.position}
          isHovered={hoveredOp === op.id && state.activeWire !== null}
          isHighlighted={highlightedOpIds.has(op.id)}
          onPortPointerEnter={handleOpPortEnter}
          onPortPointerLeave={handleOpPortLeave}
          onPortPointerUp={handleOpPortUp}
          onSelect={(id) =>
            dispatch({ type: "SELECT", selection: { kind: "operation", id } })
          }
        />
      ))}

      {/* Instructions overlay */}
      {state.connections.length === 0 && !state.activeWire && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            color: "var(--muted)",
            fontSize: 11,
            letterSpacing: "0.15em",
            textAlign: "center",
            fontFamily: "var(--font-mono-stack)",
          }}
        >
          DRAG FROM KEYWORD PORTS TO OPERATION NODES TO CREATE CONNECTIONS
        </div>
      )}
    </div>
    </div>
  );
}
