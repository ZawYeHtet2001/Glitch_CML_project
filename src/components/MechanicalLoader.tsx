"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "░▒▓█▄▀▌▐│┤┘┐└┌├┬┴┼┄┈═║╔╗╚╝01".split("");

interface MechanicalLoaderProps {
  label: string;
  sublabel?: string;
  estimatedSeconds?: number;
}

export default function MechanicalLoader({
  label,
  sublabel,
  estimatedSeconds,
}: MechanicalLoaderProps) {
  const startRef = useRef<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [noise, setNoise] = useState<string>("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    startRef.current = Date.now();
    const t = setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000);
    }, 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const gen = () =>
      Array.from({ length: 42 }, () =>
        GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      ).join("");
    setNoise(gen());
    const t = setInterval(() => {
      setNoise(gen());
      setTick((n) => n + 1);
    }, 140);
    return () => clearInterval(t);
  }, []);

  const hasEstimate = typeof estimatedSeconds === "number" && estimatedSeconds > 0;
  // Cap progress at 98% so it never claims completion before the API returns
  const progress = hasEstimate
    ? Math.min(elapsed / (estimatedSeconds as number), 0.98)
    : null;

  return (
    <div
      className="border border-[var(--border)] bg-[var(--card)] p-6"
      style={{ fontFamily: "var(--font-mono-stack)" }}
    >
      {/* Header row: label + elapsed counter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <span
          className="typing-cursor"
          style={{
            fontSize: 12,
            letterSpacing: "0.3em",
            color: "var(--accent)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "var(--muted-strong)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          T+{elapsed.toFixed(1).padStart(5, "0")}S
          {hasEstimate && ` / ~${estimatedSeconds}S`}
        </span>
      </div>

      {/* Scan bar */}
      <div
        style={{
          position: "relative",
          height: 3,
          background: "var(--border)",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        {progress !== null ? (
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "var(--accent)",
              transition: "width 0.2s linear",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "22%",
              background:
                "linear-gradient(90deg, transparent, var(--accent), transparent)",
              animation: "scan-bar 1.4s linear infinite",
            }}
          />
        )}
      </div>

      {/* Noise / telemetry row */}
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.05em",
          color: "var(--muted)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          opacity: 0.55,
          userSelect: "none",
        }}
        aria-hidden
      >
        {noise}
      </div>

      {/* Sublabel: stage / frame counter */}
      {sublabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--muted)",
          }}
        >
          <span>{sublabel}</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            FRAME {tick.toString().padStart(4, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
