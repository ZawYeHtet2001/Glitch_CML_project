"use client";

import { useEffect, useMemo, useState } from "react";

interface GlitchIdleProps {
  text: string;
  idle: boolean;
  minIntervalMs?: number;
  maxIntervalMs?: number;
  className?: string;
}

/**
 * Splits `text` into spans. When `idle` is true, one random non-space character
 * periodically "falls" (translates down + fades + blurs) and then restores.
 * Stops immediately when idle becomes false.
 */
export default function GlitchIdle({
  text,
  idle,
  minIntervalMs = 2200,
  maxIntervalMs = 4200,
  className,
}: GlitchIdleProps) {
  const chars = useMemo(() => text.split(""), [text]);
  const [fallingIndex, setFallingIndex] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!idle) {
      setFallingIndex(null);
      return;
    }
    let cancelled = false;
    let fallTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      const delay =
        minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs);
      fallTimer = setTimeout(() => {
        if (cancelled) return;
        const candidates = chars
          .map((c, i) => ({ c, i }))
          .filter(({ c }) => c.trim().length > 0);
        if (candidates.length === 0) {
          scheduleNext();
          return;
        }
        const pick =
          candidates[Math.floor(Math.random() * candidates.length)].i;
        setFallingIndex(pick);
        setCycle((n) => n + 1);
        setTimeout(() => {
          if (cancelled) return;
          setFallingIndex(null);
          scheduleNext();
        }, 1400);
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (fallTimer) clearTimeout(fallTimer);
    };
  }, [idle, chars, minIntervalMs, maxIntervalMs]);

  return (
    <span className={className}>
      {chars.map((char, i) => {
        const falling = fallingIndex === i;
        return (
          <span
            key={`${i}-${falling ? cycle : "static"}`}
            className={falling ? "glitch-fall" : undefined}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              willChange: falling ? "transform, opacity, filter" : undefined,
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
