"use client";

import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { FitCard } from "@/components/fit-card";
import { FitSkeleton } from "@/components/fit-skeleton";
import { FIT_CARDS } from "@/data/fit/fit-data";

export function FitScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleRerun() {
    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      timerRef.current = null;
    }, 1600);
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-9 pt-9">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              STEP 03 — ANALYSIS
            </span>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-fg-bright">
              Skill gap analysis
            </h1>
            <p className="text-sm text-muted text-pretty">
              Each job scored against your resume on four axes. Scores are derived from retrieved passages — open any answer in chat to see the evidence.
            </p>
          </div>
          <button
            onClick={handleRerun}
            disabled={isLoading}
            className="flex flex-none items-center gap-2 border border-hairline px-4 py-2 text-sm text-fg-body hover:border-accent hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw size={13} strokeWidth={1.5} className="flex-none" />
            {isLoading ? "Analysing…" : "Re-run analysis"}
          </button>
        </div>

        {isLoading ? (
          <FitSkeleton />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {FIT_CARDS.map((card) => (
              <FitCard key={card.jobId} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
