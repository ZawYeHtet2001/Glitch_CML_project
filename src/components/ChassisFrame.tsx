"use client";

import { useEffect, useRef } from "react";

/**
 * Minimal machine chrome — a thin top strip with the system ID + LEDs and
 * a thin bottom strip with status/telemetry. No bone chassis, no rails,
 * no matrix rain, no running ticker. Keeps the retro/CRT character via
 * VT323 + amber phosphor + scanline classes elsewhere.
 *
 * Positioned fixed, full-width, z:50 so scrolling content masks cleanly.
 * Non-interactive.
 */

export default function ChassisFrame() {
  const tickRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let tick = 0;
    const t = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      tick = (tick + 1) % 100000;
      if (tickRef.current) {
        tickRef.current.textContent =
          "T+" + tick.toString().padStart(5, "0") + "S";
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const barStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    height: 32,
    display: "flex",
    alignItems: "center",
    gap: 18,
    padding: "0 16px",
    background: "#0e0a05",
    borderColor: "rgba(255, 179, 71, 0.35)",
    fontFamily: "var(--font-tech-stack)",
    fontSize: 10,
    letterSpacing: "0.22em",
    color: "var(--amber-phosphor-dim)",
    textShadow: "0 0 3px rgba(255, 179, 71, 0.35)",
    textTransform: "uppercase",
    pointerEvents: "none",
    zIndex: 50,
    userSelect: "none",
  };

  return (
    <div aria-hidden>
      {/* ==== Top bar ==== */}
      <div
        style={{
          ...barStyle,
          top: 0,
          borderBottom: "1px solid rgba(255, 179, 71, 0.35)",
        }}
      >
        <span style={{ color: "var(--amber-phosphor)", textShadow: "var(--amber-glow)" }}>
          INTERACTIVE MEMORY MACHINE
        </span>
        <span>·</span>
        <span>IMM-0497</span>
        <span>·</span>
        <span>v2.4</span>
        <span>·</span>
        <span>CH.01</span>

        <span style={{ flex: 1 }} />

        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="led led-amber" /> PWR
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="led led-red" /> TX
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="led led-green" /> RCV
        </span>
      </div>

      {/* ==== Bottom bar ==== */}
      <div
        style={{
          ...barStyle,
          bottom: 0,
          borderTop: "1px solid rgba(255, 179, 71, 0.35)",
        }}
      >
        <span>TEAM 10 · SUTD</span>
        <span>·</span>
        <span>RECRAFT V4 · TRELLIS / HUNYUAN3D</span>
        <span style={{ flex: 1 }} />
        <span>5V / 2.1A</span>
        <span>·</span>
        <span>COOL 41°C</span>
        <span>·</span>
        <span ref={tickRef} style={{ color: "var(--amber-phosphor)", textShadow: "var(--amber-glow)" }}>
          T+00000S
        </span>
      </div>
    </div>
  );
}
