"use client";

import { useCallback, useState } from "react";
import { useKonamiCode } from "@/hooks/useKonamiCode";

interface InputFormProps {
  onSubmit: (subjectId: string, inputText: string) => void;
}

const MAX_INPUT_CHARS = 600;

const DEV_RECALL_TEXT =
  "My grandfather's workshop in winter, 1997. Sawdust on concrete, the smell of cold steel and linseed oil. A single bare bulb hung from a cord and cast long shadows across the lathe. I was seven and stood in the doorway because my hands always froze up there. The radio played on a shelf missing the bass knob. Through the small square window, snow was piling against the garage door. He was turning something on the lathe — I never saw what, the wood curls kept falling to the floor like gold peels.";

export default function InputForm({ onSubmit }: InputFormProps) {
  const [subjectId, setSubjectId] = useState("");
  const [inputText, setInputText] = useState("");
  const [easterEggFired, setEasterEggFired] = useState(false);

  useKonamiCode(
    useCallback(() => {
      setSubjectId("DEV");
      setInputText(DEV_RECALL_TEXT);
      setEasterEggFired(true);
      setTimeout(() => setEasterEggFired(false), 2400);
    }, [])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjectId && inputText) {
      onSubmit(subjectId, inputText);
    }
  };

  const charCount = inputText.length;
  const overLimit = charCount > MAX_INPUT_CHARS;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative">
      {easterEggFired && (
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            top: -36,
            right: 0,
            fontFamily: "var(--font-mono-stack)",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--accent)",
            border: "1px solid var(--accent)",
            padding: "4px 10px",
            background: "rgba(232, 184, 74, 0.08)",
          }}
        >
          ◉ DEVELOPER RECALL LOADED
        </div>
      )}
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
          maxLength={MAX_INPUT_CHARS}
          placeholder="I remember a corridor that kept stretching longer as I walked. The walls were concrete but they felt soft. There was a door at the end but every time I reached for it..."
          className="w-full bg-[var(--card)] border border-[var(--border)] p-4 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none resize-none"
        />
        <div
          className={`mt-2 text-xs tracking-widest text-right ${
            overLimit
              ? "text-red-400"
              : charCount > MAX_INPUT_CHARS * 0.85
                ? "text-[var(--accent)]"
                : "text-[var(--muted)]"
          }`}
        >
          {charCount} / {MAX_INPUT_CHARS} CHARS
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!subjectId || !inputText || overLimit}
        className="w-full border border-[var(--accent)] text-[var(--accent)] py-3 text-sm tracking-[0.3em] hover:bg-[var(--accent)] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        EXTRACT + ANALYZE
      </button>
    </form>
  );
}
