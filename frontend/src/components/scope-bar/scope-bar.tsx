"use client";

import { Search } from "lucide-react";

import { BlueprintCard } from "@/components/blueprint-card";
import { cn } from "@/lib/utils";

import type { ScopeBarProps } from "./scope-bar.types";

function getScopeLabel(scope: string, jobs: ScopeBarProps["jobs"]): string {
  if (scope === "all") return "All jobs";
  const job = jobs.find((j) => j.id === scope);
  return job ? job.title : "Unknown";
}

function getScopeChunks(scope: string, jobs: ScopeBarProps["jobs"], resumeChunks: number): number {
  if (scope === "all") {
    return resumeChunks + jobs.reduce((sum, j) => sum + j.chunks, 0);
  }
  const job = jobs.find((j) => j.id === scope);
  return resumeChunks + (job ? job.chunks : 0);
}

export function ScopeBar({ scope, onScopeChange, jobs, resumeChunks }: ScopeBarProps) {
  const scopeLabel = getScopeLabel(scope, jobs);
  const chunkCount = getScopeChunks(scope, jobs, resumeChunks);

  return (
    <BlueprintCard topOnly className="flex-none border-l-0 border-r-0 border-t-0 px-6 pt-3.5 pb-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-faint flex-none">
            RETRIEVAL SCOPE
          </span>
          <div className="flex flex-wrap gap-2">
            <ScopePill
              label="All jobs"
              isActive={scope === "all"}
              onClick={() => onScopeChange("all")}
            />
            {jobs.map((job) => (
              <ScopePill
                key={job.id}
                label={job.title}
                isActive={scope === job.id}
                onClick={() => onScopeChange(job.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-fg-body">
          <Search size={13} strokeWidth={1.5} className="flex-none text-faint" />
          <span>
            Answering from{" "}
            <strong className="font-semibold text-accent-light">{scopeLabel}</strong>
            {" "}— {chunkCount} indexed chunks. Nothing outside this scope is read.
          </span>
        </div>
      </div>
    </BlueprintCard>
  );
}

interface ScopePillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function ScopePill({ label, isActive, onClick }: ScopePillProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "flex min-h-6 items-center gap-1.5 border px-2.5 py-1 text-xs whitespace-nowrap font-body",
        "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        isActive
          ? "border-accent bg-accent text-accent-fg font-semibold"
          : "border-hairline text-muted hover:border-accent hover:text-fg"
      )}
    >
      <span
        className={cn(
          "h-scope-marker w-scope-marker flex-none",
          isActive ? "bg-accent-fg" : "border border-current"
        )}
      />
      {label}
    </button>
  );
}
