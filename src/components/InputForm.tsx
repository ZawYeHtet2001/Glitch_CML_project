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
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {easterEggFired && (
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            top: -28,
            right: 0,
            fontFamily: "var(--font-matrix-stack)",
            fontSize: 14,
            letterSpacing: "0.1em",
            color: "var(--amber-phosphor-hot)",
            border: "1px solid rgba(255, 179, 71, 0.55)",
            padding: "4px 12px",
            background: "rgba(255, 179, 71, 0.08)",
            textShadow: "var(--amber-glow)",
          }}
        >
          ◉ DEVELOPER RECALL LOADED
        </div>
      )}

      {/* Subject ID — single-line CRT field */}
      <div>
        <label
          style={{
            display: "block",
            fontFamily: "var(--font-matrix-stack)",
            fontSize: 15,
            letterSpacing: "0.1em",
            color: "var(--amber-phosphor)",
            textShadow: "var(--amber-glow)",
            marginBottom: 6,
          }}
        >
          &gt; SUBJECT IDENTIFIER
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid rgba(255, 179, 71, 0.35)",
            paddingBottom: 4,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-matrix-stack)",
              color: "var(--amber-phosphor)",
              textShadow: "var(--amber-glow)",
              fontSize: 18,
            }}
          >
            $
          </span>
          <input
            type="text"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            placeholder="JW / NT / VP / ZH"
            className="crt-input"
            style={{ fontSize: 18 }}
          />
        </div>
      </div>

      {/* Recall Text — terminal textarea */}
      <div>
        <label
          style={{
            display: "block",
            fontFamily: "var(--font-matrix-stack)",
            fontSize: 15,
            letterSpacing: "0.1em",
            color: "var(--amber-phosphor)",
            textShadow: "var(--amber-glow)",
            marginBottom: 6,
          }}
        >
          &gt; SUBCONSCIOUS SPATIAL RECALL
        </label>
        <p
          style={{
            fontFamily: "var(--font-matrix-stack)",
            color: "var(--amber-phosphor-dim)",
            textShadow: "0 0 3px rgba(255, 179, 71, 0.35)",
            fontSize: 14,
            marginBottom: 8,
            lineHeight: 1.3,
          }}
        >
          Describe a remembered spatial experience — a place from memory, dream, or
          somewhere in between. Focus on what you recall: architecture, objects,
          people, sensations, how the space felt.
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "4px 0",
            borderTop: "1px solid rgba(255, 179, 71, 0.25)",
            borderBottom: "1px solid rgba(255, 179, 71, 0.25)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-matrix-stack)",
              color: "var(--amber-phosphor)",
              textShadow: "var(--amber-glow)",
              fontSize: 18,
              marginTop: 2,
            }}
          >
            &gt;_
          </span>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={7}
            maxLength={MAX_INPUT_CHARS}
            placeholder="I remember a corridor that kept stretching longer as I walked. The walls were concrete but they felt soft. There was a door at the end but every time I reached for it..."
            className="crt-input"
          />
        </div>
        <div
          style={{
            marginTop: 6,
            textAlign: "right",
            fontFamily: "var(--font-matrix-stack)",
            fontSize: 14,
            color: overLimit
              ? "var(--led-red)"
              : charCount > MAX_INPUT_CHARS * 0.85
                ? "var(--amber-phosphor-hot)"
                : "var(--amber-phosphor-dim)",
            textShadow: overLimit
              ? "0 0 4px rgba(255, 90, 90, 0.7)"
              : "0 0 3px rgba(255, 179, 71, 0.35)",
          }}
        >
          {charCount.toString().padStart(3, "0")} / {MAX_INPUT_CHARS} CHARS
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!subjectId || !inputText || overLimit}
        className="machine-btn machine-btn-primary"
        style={{ width: "100%" }}
      >
        EXTRACT + ANALYZE
      </button>
    </form>
  );
}
