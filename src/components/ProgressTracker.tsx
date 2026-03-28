"use client";

interface Step {
  key: string;
  label: string;
}

interface ProgressTrackerProps {
  currentStatus: string;
  steps: Step[];
}

export default function ProgressTracker({ currentStatus, steps }: ProgressTrackerProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="flex gap-1">
      {steps.map((step, i) => {
        const isActive = step.key === currentStatus;
        const isComplete = i < currentIndex || currentStatus === "complete";

        return (
          <div key={step.key} className="flex-1">
            <div
              className={`h-1 mb-2 transition-colors ${
                isComplete
                  ? "bg-[var(--accent)]"
                  : isActive
                  ? "bg-[var(--accent)] animate-pulse"
                  : "bg-[var(--border)]"
              }`}
            />
            <p
              className={`text-[10px] tracking-widest ${
                isActive
                  ? "text-[var(--accent)]"
                  : isComplete
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
