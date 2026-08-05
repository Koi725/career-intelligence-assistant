"use client";

import { MessageSquare } from "lucide-react";

import type { EmptyStateProps } from "./empty-state.types";

const PROMPTS = [
  "How does my experience align with Job 2?",
  "What skills am I missing for Job 3?",
  "Which job am I the strongest fit for?",
  "Prepare me for an interview based on Job 1.",
] as const;

export function EmptyState({ onStartStreaming }: EmptyStateProps) {
  return (
    <div className="flex flex-1 min-h-0 items-center justify-center overflow-auto">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 px-6 py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-heading text-xl font-semibold uppercase tracking-wide text-fg">
            Ask anything about your fit
          </h2>
          <p className="text-sm text-muted leading-6">
            The assistant searches your resume and job descriptions to give sourced, specific answers.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={onStartStreaming}
              className="border border-hairline bg-panel px-4 py-3 text-left text-sm text-fg-body hover:border-accent hover:bg-control focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              <span className="flex items-start gap-2">
                <MessageSquare
                  size={13}
                  className="mt-0.5 flex-none text-accent-light"
                  strokeWidth={1.5}
                />
                {prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
