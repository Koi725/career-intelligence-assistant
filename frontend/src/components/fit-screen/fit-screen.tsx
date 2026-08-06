"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { FitCard } from "@/components/fit-card";
import { FitSkeleton } from "@/components/fit-skeleton";
import { ApiError, analyzeFit } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FitCard as FitCardData } from "@/lib/types";

export function FitScreen() {
  const [cards, setCards] = useState<FitCardData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFit();
      setCards(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Analysis failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-9 pt-9">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
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
          <button
            onClick={run}
            disabled={loading}
            className={cn(
              "mt-1 flex h-cta shrink-0 items-center gap-2 border px-4",
              loading
                ? "cursor-not-allowed border-hairline text-faint-2"
                : "border-hairline text-muted hover:border-hairline-strong hover:text-fg"
            )}
          >
            <RefreshCw
              size={14}
              strokeWidth={1.5}
              className={cn(loading && "animate-spin")}
            />
            <span className="font-heading text-sm font-semibold uppercase tracking-wide">
              {loading ? "Analysing…" : "Re-run analysis"}
            </span>
          </button>
        </div>

        {/* Error state */}
        {!loading && error && (
          <div className="border border-hairline px-8 py-16 text-center">
            <p className="text-sm text-muted">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && cards !== null && cards.length === 0 && (
          <div className="border border-hairline px-8 py-16 text-center">
            <p className="text-sm text-faint">
              No job descriptions indexed yet. Add jobs on the Setup screen first.
            </p>
          </div>
        )}

        {/* Skeleton while loading */}
        {loading && (
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <FitSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Cards when loaded */}
        {!loading && !error && cards !== null && cards.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {cards.map((card) => (
              <FitCard key={card.jobId} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
