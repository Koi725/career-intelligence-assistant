"use client";

import { AlertCircle, ArrowRight, Check } from "lucide-react";

import { useDocuments } from "@/hooks/use-documents";

import type { GateBarProps } from "./gate-bar.types";

export function GateBar({ onContinue }: GateBarProps) {
  const { canContinue, blockedReason, resume, jobs } = useDocuments();

  return (
    <div className="flex-none border-t border-hairline bg-header py-3.5">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {canContinue ? (
            <>
              <Check size={16} className="text-score-good flex-none" strokeWidth={1.5} />
              <span className="text-sm text-fg-body">
                {resume
                  ? `1 resume · ${jobs.length} job ${jobs.length === 1 ? "description" : "descriptions"} indexed and ready.`
                  : ""}
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-score-mid flex-none" strokeWidth={1.5} />
              <span className="text-sm text-score-mid">{blockedReason}</span>
            </>
          )}
        </div>

        {canContinue ? (
          <button
            onClick={onContinue}
            className="flex h-cta flex-none items-center gap-2 border border-accent bg-accent px-4 text-accent-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <span className="font-heading text-sm font-semibold uppercase tracking-wide">
              CONTINUE TO CHAT
            </span>
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        ) : (
          <button
            disabled
            aria-disabled="true"
            className="flex h-cta flex-none cursor-not-allowed items-center gap-2 border border-hairline px-4 text-faint-2"
          >
            <span className="font-heading text-sm font-semibold uppercase tracking-wide">
              CONTINUE TO CHAT
            </span>
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
