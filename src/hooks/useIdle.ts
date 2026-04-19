"use client";

import { useEffect, useState } from "react";

const DEFAULT_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
] as const;

export function useIdle(thresholdMs: number = 12000): boolean {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const arm = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), thresholdMs);
    };

    const reset = () => {
      if (isIdle) setIsIdle(false);
      arm();
    };

    arm();
    DEFAULT_EVENTS.forEach((ev) =>
      window.addEventListener(ev, reset, { passive: true })
    );

    return () => {
      if (timer) clearTimeout(timer);
      DEFAULT_EVENTS.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [thresholdMs, isIdle]);

  return isIdle;
}
