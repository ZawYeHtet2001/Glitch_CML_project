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
  { id: "clarity", label: "CLARITY", description: "Edge Resolution / Fidelity" },
  { id: "completeness", label: "COMPLETENESS", description: "Subtraction / Missing Mass" },
  { id: "stability", label: "STABILITY", description: "Tilt / Center of Gravity" },
  { id: "misassociation", label: "MISASSOCIATION", description: "Collision / Hybridization" },
  { id: "vulnerability", label: "VULNERABILITY", description: "Porosity / Shell Thickness" },
  { id: "intimacy", label: "INTIMACY", description: "Compression / Cavity Size" },
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
  | { type: "SELECT_CONNECTION"; connectionId: string | null };

interface CanvasReducerState extends CanvasState {
  selectedConnectionId: string | null;
}

const initialState: CanvasReducerState = {
  keywords: [],
  operations: [],
  connections: [],
  activeWire: null,
  selectedConnectionId: null,
};

function canvasReducer(
  state: CanvasReducerState,
  action: CanvasAction
): CanvasReducerState {
  switch (action.type) {
    case "INIT_CANVAS": {
      const { analysis, canvasWidth, canvasHeight } = action;
      const opX = canvasWidth - OPERATION_WIDTH - 40;
      const opSpacing = Math.min(
        (canvasHeight - 40) / OPERATION_DEFS.length,
        OPERATION_HEIGHT + 16
      );
      const opStartY =
        (canvasHeight - opSpacing * OPERATION_DEFS.length) / 2;

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
        selectedConnectionId: null,
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
        selectedConnectionId: null,
      };
    }

    case "SELECT_CONNECTION":
      return { ...state, selectedConnectionId: action.connectionId };

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

  // Keyboard handler for deleting selected connection
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        state.selectedConnectionId
      ) {
        dispatch({
          type: "REMOVE_CONNECTION",
          connectionId: state.selectedConnectionId,
        });
      }
      if (e.key === "Escape") {
        dispatch({ type: "CANCEL_WIRE" });
        dispatch({ type: "SELECT_CONNECTION", connectionId: null });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.selectedConnectionId]);

  // Drag keyword
  const handleKeywordDragMove = useCallback(
    (id: string, x: number, y: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      dispatch({
        type: "MOVE_KEYWORD",
        id,
        x: x - rect.left,
        y: y - rect.top,
      });
    },
    []
  );

  // Wire start from keyword port
  const handlePortDragStart = useCallback((id: string) => {
    dispatch({ type: "START_WIRE", fromKeywordId: id });
  }, []);

  // Wire follow mouse
  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!state.activeWire || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      dispatch({
        type: "UPDATE_WIRE_POSITION",
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [state.activeWire]
  );

  // Wire cancel on canvas click
  const handleCanvasPointerUp = useCallback(() => {
    if (state.activeWire) {
      // Check if hovering over an operation port
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

  // Compute wire endpoints
  const getKeywordPortPos = (kwId: string) => {
    const kw = state.keywords.find((k) => k.id === kwId);
    if (!kw) return { x: 0, y: 0 };
    return {
      x: kw.position.x + KEYWORD_WIDTH + KEYWORD_PORT_RADIUS,
      y: kw.position.y + KEYWORD_HEIGHT / 2,
    };
  };

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

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: 600,
        background: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        overflow: "hidden",
        touchAction: "none",
      }}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onClick={() =>
        dispatch({ type: "SELECT_CONNECTION", connectionId: null })
      }
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
              isSelected={state.selectedConnectionId === conn.id}
              onClick={() =>
                dispatch({
                  type: "SELECT_CONNECTION",
                  connectionId: conn.id,
                })
              }
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
          onDragMove={handleKeywordDragMove}
          onPortDragStart={handlePortDragStart}
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
          onPortPointerEnter={handleOpPortEnter}
          onPortPointerLeave={handleOpPortLeave}
          onPortPointerUp={handleOpPortUp}
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
            fontFamily: '"Courier New", monospace',
          }}
        >
          DRAG FROM KEYWORD PORTS TO OPERATION NODES TO CREATE CONNECTIONS
        </div>
      )}
    </div>
  );
}
