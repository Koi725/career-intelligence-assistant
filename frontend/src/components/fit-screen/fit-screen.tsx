"use client";

export function FitScreen() {
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-9 pt-9">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            STEP 03 — ANALYSIS
          </span>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-fg-bright">
            Skill gap analysis
          </h1>
          <p className="text-sm text-muted text-pretty">
            Each job scored against your resume on four axes. Scores are derived
            from retrieved passages — open any answer in chat to see the evidence.
          </p>
        </div>

        <div className="border border-hairline px-8 py-16 text-center">
          <p className="text-sm text-faint">
            Fit analysis is not yet implemented. Use the chat screen to ask
            about your alignment with specific job descriptions.
          </p>
        </div>
      </div>
    </div>
  );
}
