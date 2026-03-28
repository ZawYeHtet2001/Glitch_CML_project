"use client";

interface ImageComparisonProps {
  memoryUrl: string;
  dreamUrl: string;
}

export default function ImageComparison({ memoryUrl, dreamUrl }: ImageComparisonProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs tracking-widest text-[var(--accent)]">
        02 — INITIAL GENERATION
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] tracking-widest text-[var(--muted)]">MEMORY VISUALIZATION</p>
          <div className="border border-[var(--border)] overflow-hidden aspect-square">
            <img src={memoryUrl} alt="Memory visualization" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] tracking-widest text-[var(--muted)]">DREAM VISUALIZATION</p>
          <div className="border border-[var(--border)] overflow-hidden aspect-square">
            <img src={dreamUrl} alt="Dream visualization" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
