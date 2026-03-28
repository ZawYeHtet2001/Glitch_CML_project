"use client";

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs tracking-widest text-[var(--accent)]">
        05 — OUTPUT: SUBCONSCIOUS SPATIAL RECONSTRUCTION
      </h2>
      <div className="border border-[var(--border)] bg-black">
        <video
          src={url}
          controls
          autoPlay
          loop
          className="w-full"
        />
      </div>
      <p className="text-[10px] tracking-widest text-[var(--muted)] text-center">
        GENERATED WALKTHROUGH — INTERIOR SPACE SHAPED BY SUBCONSCIOUS RECONSTRUCTION
      </p>
    </section>
  );
}
