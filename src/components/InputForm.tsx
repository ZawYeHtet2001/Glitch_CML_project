"use client";

import { useState } from "react";

interface InputFormProps {
  onSubmit: (subjectId: string, inputText: string) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [subjectId, setSubjectId] = useState("");
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjectId && inputText) {
      onSubmit(subjectId, inputText);
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

      {/* Subconsciousness Text */}
      <div>
        <label className="block text-xs tracking-widest text-[var(--accent)] mb-2">
          SUBCONSCIOUS SPATIAL RECALL
        </label>
        <p className="text-xs text-[var(--muted)] mb-3">
          Describe a remembered spatial experience — a place from memory, dream, or
          somewhere in between. Focus on what you recall: the architecture, objects,
          people, sensations, and how the space felt.
        </p>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={8}
          placeholder="I remember a corridor that kept stretching longer as I walked. The walls were concrete but they felt soft, like skin. There was a door at the end but every time I reached for it..."
          className="w-full bg-[var(--card)] border border-[var(--border)] p-4 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!subjectId || !inputText}
        className="w-full border border-[var(--accent)] text-[var(--accent)] py-3 text-sm tracking-[0.3em] hover:bg-[var(--accent)] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        EXTRACT + ANALYZE
      </button>
    </form>
  );
}
