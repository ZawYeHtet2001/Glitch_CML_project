"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const GLYPHS = "░▒▓█▄▀▌▐│┤┘┐└┌├┬┴┼┄┈═║╔╗╚╝01".split("");

/** Cryptic per-stage serial output pools. */
const MESSAGE_POOLS: Record<string, string[]> = {
  analyze: [
    "RCV :: RAW SPATIAL STREAM  0x4A2F",
    "DECODE :: SYNAPTIC VECTORS",
    "SEGMENT :: SUBJECT TOKENS [8..15]",
    "QUERY :: ARCHIVE Γ-17",
    "CROSS-REF :: ARCHETYPE ENGINE",
    "TAG :: OBJ / PER / EVT / SPA / EXP",
    "SCORE :: 12 DISTORTION CHANNELS",
    "LOCK :: BIAS DRIFT Δ = -0.18",
    "RESOLVE :: ARCHETYPE CANDIDATE",
    "WRITE :: KEYWORD POOL  OK",
    "HANDSHAKE :: CLAUDE HAIKU",
    "CHECKSUM :: STABLE",
  ],
  generate: [
    "MOUNT :: ART-DIRECTOR SOCKET",
    "COMPILE :: MECHANICAL PROMPT",
    "ASSEMBLE :: VISUAL BRIEF",
    "REQUEST :: FAL.AI // RECRAFT V4",
    "NEGOTIATE :: SAMPLER Δ-K",
    "INJECT :: ARCHETYPE SEED",
    "MIX :: CONNECTION WEIGHTS",
    "RENDER :: LATENT PASS 01/12",
    "RENDER :: LATENT PASS 05/12",
    "RENDER :: LATENT PASS 09/12",
    "DIFFUSE :: BOUNDARY FIELDS",
    "COOL :: TENSOR CHAMBER 04",
    "STAMP :: ARTIFACT SIGIL",
    "NAME :: CONSULT CLAUDE",
    "PACKAGE :: PAYLOAD .PNG",
  ],
  generate_3d: [
    "HANDSHAKE :: FAL.AI // TRELLIS",
    "UPLOAD :: 2D REFERENCE FRAME",
    "BACKPROJECT :: DEPTH FIELD",
    "SCAFFOLD :: VOXEL CHAMBER",
    "OCCLUDE :: HIDDEN GEOMETRY",
    "MARCH :: ISO-SURFACE",
    "WELD :: MESH TOPOLOGY",
    "SMOOTH :: LAPLACIAN Γ=0.4",
    "BAKE :: MATERIAL MAPS",
    "BAKE :: NORMAL PASS",
    "VALIDATE :: WATERTIGHT  OK",
    "WRAP :: GLB CONTAINER",
    "SIGN :: ARCHIVE KEY",
    "STREAM :: MESH DOWNLINK",
  ],
};

function poolForLabel(label: string): string[] {
  const up = label.toUpperCase();
  if (up.includes("EXTRACT") || up.includes("ANALYZ"))
    return MESSAGE_POOLS.analyze;
  if (up.includes("LIFTING") || up.includes("3D") || up.includes("DIMENSION"))
    return MESSAGE_POOLS.generate_3d;
  return MESSAGE_POOLS.generate;
}

function asciiBar(pct: number, width = 32) {
  const clamped = Math.max(0, Math.min(1, pct));
  const fill = Math.round(clamped * width);
  return `[${"█".repeat(fill)}${"░".repeat(width - fill)}]`;
}

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

  const pool = useMemo(() => poolForLabel(label), [label]);
  const [log, setLog] = useState<string[]>(() => pool.slice(0, 1));

  useEffect(() => {
    startRef.current = Date.now();
    const t = setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000);
    }, 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const gen = () =>
      Array.from({ length: 48 }, () =>
        GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      ).join("");
    setNoise(gen());
    const t = setInterval(() => {
      setNoise(gen());
      setTick((n) => n + 1);
    }, 320);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLog(pool.slice(0, 1));
    let idx = 1;
    const t = setInterval(() => {
      setLog((prev) => {
        const next = [...prev, pool[idx % pool.length]];
        idx += 1;
        return next.slice(-6);
      });
    }, 900);
    return () => clearInterval(t);
  }, [pool]);

  const hasEstimate = typeof estimatedSeconds === "number" && estimatedSeconds > 0;
  const progress = hasEstimate
    ? Math.min(elapsed / (estimatedSeconds as number), 0.98)
    : null;
  const displayProgress = progress ?? (((tick * 320) % 4000) / 4000);
  // Overshot the estimate — fal.ai is still working, but we can't know how much
  // longer. Show "WAITING ON RENDER FARM" so the user knows nothing is wrong.
  const overEstimate =
    hasEstimate && elapsed > (estimatedSeconds as number) * 0.98;

  return (
    <div
      style={{
        position: "relative",
        padding: 6,
        background: "linear-gradient(180deg, var(--chassis-bone-hi), var(--chassis-bone))",
        border: "1px solid var(--chassis-seam)",
        borderRadius: 6,
        boxShadow:
          "inset 1px 1px 0 rgba(255,255,255,0.4), inset -1px -1px 0 rgba(0,0,0,0.35), 0 3px 6px rgba(0,0,0,0.7)",
      }}
    >
      {/* Label tab */}
      <div className="machine-viewport-label">SYS // RUN  ·  DIAGNOSTIC</div>
      <div className="machine-viewport-id">
        <span>T+{elapsed.toFixed(1).padStart(5, "0")}S</span>
        <span className="led-bezel led-red" />
      </div>
      <span className="viewport-screw" style={{ top: 6, left: 6 }} />
      <span className="viewport-screw" style={{ top: 6, right: 6 }} />
      <span className="viewport-screw" style={{ bottom: 6, left: 6 }} />
      <span className="viewport-screw" style={{ bottom: 6, right: 6 }} />

      {/* Recessed CRT content */}
      <div
        className="viewport-inner"
        style={{
          padding: "18px 20px",
          minHeight: 260,
          fontFamily: "var(--font-matrix-stack)",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            color: "var(--amber-phosphor-hot)",
            textShadow: "var(--amber-glow)",
            fontSize: 18,
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          <span>&gt;&gt; {label}</span>
          <span style={{ fontSize: 14, opacity: 0.8, fontVariantNumeric: "tabular-nums" }}>
            T+{elapsed.toFixed(1).padStart(5, "0")}S
            {hasEstimate && ` / ~${estimatedSeconds}S`}
          </span>
        </div>

        {/* ASCII progress bar */}
        <div
          className="ascii-bar"
          style={{
            color: "var(--amber-phosphor)",
            marginBottom: 6,
          }}
        >
          {asciiBar(displayProgress)} {(displayProgress * 100).toFixed(1)}%
        </div>

        {overEstimate && (
          <div
            style={{
              fontFamily: "var(--font-matrix-stack)",
              fontSize: 14,
              letterSpacing: "0.1em",
              color: "var(--led-amber)",
              textShadow: "0 0 6px rgba(255, 179, 71, 0.7)",
              marginBottom: 12,
            }}
          >
            ⚠ WAITING ON RENDER FARM — fal.ai still working, do not reload
          </div>
        )}

        {/* Cryptic serial-output log */}
        <div
          className="serial-log"
          style={{
            minHeight: 130,
            marginBottom: 12,
          }}
        >
          {log.map((line, i) => {
            const isActive = i === log.length - 1;
            return (
              <div
                key={`${i}-${line}`}
                className={isActive ? "serial-active" : ""}
                style={{ opacity: isActive ? 1 : 0.35 + i * 0.1 }}
              >
                <span style={{ opacity: 0.7 }}>&gt;&gt;&nbsp;</span>
                {line}
                {isActive && <span className="serial-cursor">&nbsp;</span>}
              </div>
            );
          })}
        </div>

        {/* Noise row */}
        <div
          style={{
            fontSize: 13,
            letterSpacing: "0",
            color: "var(--amber-phosphor-dim)",
            textShadow: "0 0 3px rgba(255, 179, 71, 0.35)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            opacity: 0.7,
            userSelect: "none",
            fontFamily: "var(--font-matrix-stack)",
          }}
          aria-hidden
        >
          {noise}
        </div>

        {/* Sublabel + frame counter */}
        {sublabel && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              fontSize: 13,
              letterSpacing: "0.08em",
              color: "var(--amber-phosphor-dim)",
              textShadow: "0 0 3px rgba(255, 179, 71, 0.35)",
              fontFamily: "var(--font-matrix-stack)",
            }}
          >
            <span>{sublabel}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              FRAME {tick.toString().padStart(4, "0")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
