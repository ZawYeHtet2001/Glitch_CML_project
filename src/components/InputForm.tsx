"use client";

import { useState } from "react";

interface InputFormProps {
  onSubmit: (subjectId: string, memoryText: string, dreamText: string) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [subjectId, setSubjectId] = useState("");
  const [memoryText, setMemoryText] = useState("");
  const [dreamText, setDreamText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjectId && memoryText && dreamText) {
      onSubmit(subjectId, memoryText, dreamText);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Subject ID */}
      <div>
        <label className="block text-xs tracking-widest text-[var(--muted)] mb-2">
          SUBJECT IDENTIFIER
        </label>
        <input
          type="text"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          placeholder="e.g. JW, NT, VP, ZH"
          className="w-full bg-[var(--card)] border border-[var(--border)] p-3 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      {/* Memory Record */}
      <div>
        <label className="block text-xs tracking-widest text-[var(--accent)] mb-2">
          01 — MEMORY RECORD (WAKING EXPERIENCE)
        </label>
        <p className="text-xs text-[var(--muted)] mb-3">
          Describe a recent spatial experience from your memory. Focus on the architecture,
          the space, the objects, the light, the atmosphere.
        </p>
        <textarea
          value={memoryText}
          onChange={(e) => setMemoryText(e.target.value)}
          rows={6}
          placeholder="I remember walking through a long corridor with tall windows on the left side..."
          className="w-full bg-[var(--card)] border border-[var(--border)] p-4 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none resize-none"
        />
      </div>

      {/* Dream Record */}
      <div>
        <label className="block text-xs tracking-widest text-[var(--accent)] mb-2">
          02 — DREAM RECORD (SUBCONSCIOUS RECONSTRUCTION)
        </label>
        <p className="text-xs text-[var(--muted)] mb-3">
          Describe the dream version of the same space. How did your subconscious
          reconstruct it? What changed, shifted, or disappeared?
        </p>
        <textarea
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          rows={6}
          placeholder="In the dream, the corridor seemed endless. The windows were there but I couldn't see through them..."
          className="w-full bg-[var(--card)] border border-[var(--border)] p-4 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!subjectId || !memoryText || !dreamText}
        className="w-full border border-[var(--accent)] text-[var(--accent)] py-3 text-sm tracking-[0.3em] hover:bg-[var(--accent)] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        BEGIN ANALYSIS
      </button>
    </form>
  );
}
