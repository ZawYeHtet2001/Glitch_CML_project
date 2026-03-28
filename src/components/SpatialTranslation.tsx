"use client";

import { SpatialTranslation as SpatialTranslationType } from "@/lib/types";

interface SpatialTranslationProps {
  translation: SpatialTranslationType;
}

export default function SpatialTranslation({ translation }: SpatialTranslationProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs tracking-widest text-[var(--accent)]">
        04 — SPATIAL TRANSLATION
      </h2>
      <div className="border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <div>
          <p className="text-[10px] tracking-widest text-[var(--muted)] mb-2">
            ARCHITECTURAL SCENE DESCRIPTION
          </p>
          <p className="text-sm leading-relaxed">{translation.image_prompt}</p>
        </div>
        <div>
          <p className="text-[10px] tracking-widest text-[var(--muted)] mb-2">
            CAMERA MOVEMENT INSTRUCTIONS
          </p>
          <p className="text-sm leading-relaxed">{translation.video_prompt}</p>
        </div>
        <div>
          <p className="text-[10px] tracking-widest text-[var(--muted)] mb-2">
            STYLE MODIFIERS
          </p>
          <p className="text-sm text-[var(--accent)]">{translation.style_modifiers}</p>
        </div>
      </div>
    </section>
  );
}
