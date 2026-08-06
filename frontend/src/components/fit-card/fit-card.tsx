import { BlueprintCard } from "@/components/blueprint-card";
import { cn } from "@/lib/utils";
import { TONE_BG, TONE_TEXT, toneFor } from "@/lib/tone";

import type { FitCardProps } from "./fit-card.types";

export function FitCard({ card }: FitCardProps) {
  const overallTone = toneFor(card.overallScore);

  return (
    <BlueprintCard>
      <div className="flex flex-col gap-4 p-5">
        {/* Header: eyebrow + title + company on the left, score + verdict on the right */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              JOB {String(card.jobNumber).padStart(2, "0")}
            </span>
            <h3 className="font-heading text-xl font-semibold leading-tight text-fg-bright">
              {card.title}
            </h3>
            <span className="text-sm text-muted-2">{card.company}</span>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className={cn("font-heading text-3xl font-bold leading-none", TONE_TEXT[overallTone])}>
              {card.overallScore}
            </span>
            <span className={cn("font-mono text-xs uppercase tracking-widest", TONE_TEXT[overallTone])}>
              {card.verdict}
            </span>
          </div>
        </div>

        <div className="border-t border-hairline-subtle" />

        {/* Axes */}
        <div className="flex flex-col gap-4">
          {card.axes.map((axis) => {
            const axisTone = toneFor(axis.score);
            return (
              <div key={axis.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-2">
                    {axis.label}
                  </span>
                  <span className={cn("font-mono text-xs", TONE_TEXT[axisTone])}>
                    {axis.score.toFixed(2)}
                  </span>
                </div>
                <div className="h-score-track bg-control">
                  <div
                    className={cn("h-full", TONE_BG[axisTone])}
                    style={{ width: `${axis.score * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-3 text-pretty">{axis.justification}</p>
              </div>
            );
          })}
        </div>
      </div>
    </BlueprintCard>
  );
}
