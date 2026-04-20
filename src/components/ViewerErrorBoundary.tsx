"use client";

import { Component, ReactNode } from "react";

/**
 * Catches anything the R3F / Three.js subtree throws so the Next.js dev
 * overlay never hijacks the screen mid-demo. Most commonly triggered by
 * `webglcontextlost` Events propagating up through R3F's event system.
 * Shows an amber fallback with a manual "retry" button that remounts
 * the subtree.
 */
interface Props {
  children: ReactNode;
}
interface State {
  error: unknown | null;
  retryKey: number;
}

export default class ViewerErrorBoundary extends Component<Props, State> {
  state: State = { error: null, retryKey: 0 };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error };
  }

  componentDidCatch(error: unknown) {
    // Don't spam the console with the raw Event — summarise it.
    if (error instanceof Event) {
      // eslint-disable-next-line no-console
      console.warn(`[3D viewer] event bubbled up: ${error.type}`);
    } else {
      // eslint-disable-next-line no-console
      console.warn("[3D viewer] caught:", error);
    }
  }

  handleRetry = () => {
    this.setState((s) => ({ error: null, retryKey: s.retryKey + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: "40px 24px",
            textAlign: "center",
            fontFamily: "var(--font-matrix-stack)",
            color: "var(--amber-phosphor)",
            textShadow: "var(--amber-glow)",
            background: "var(--background)",
            border: "1px solid rgba(255, 179, 71, 0.35)",
            borderRadius: 3,
            minHeight: 320,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <div style={{ fontSize: 18, letterSpacing: "0.1em" }}>
            ⚠ 3D VIEWER INTERRUPTED
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--amber-phosphor-dim)",
              textShadow: "0 0 3px rgba(255,179,71,0.35)",
              maxWidth: 520,
              lineHeight: 1.4,
            }}
          >
            WebGL context was lost or the renderer emitted an unhandled event.
            Click retry to rebuild the viewport.
          </div>
          <button
            onClick={this.handleRetry}
            className="machine-btn machine-btn-primary"
            style={{ marginTop: 4 }}
          >
            RETRY · REBUILD VIEWPORT
          </button>
        </div>
      );
    }

    // `key` on the wrapper forces the subtree to remount after a retry.
    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}
