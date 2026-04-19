"use client";

import { useEffect, useRef } from "react";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

export function useKonamiCode(callback: () => void) {
  const idx = useRef(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === CODE[idx.current]) {
        idx.current += 1;
        if (idx.current === CODE.length) {
          idx.current = 0;
          callback();
        }
      } else {
        idx.current = key === CODE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [callback]);
}
