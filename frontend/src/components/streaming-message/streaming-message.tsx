"use client";

import { UserMessage } from "@/components/user-message";
import { useStreaming } from "@/hooks/use-streaming";
import { STREAMING_TARGET_USER } from "@/data/chat/chat-data";

import type { StreamingMessageProps } from "./streaming-message.types";

const PHASE_LABELS = ["Retrieving…", "Reading 12 sources…", "Generating answer…"] as const;

export function StreamingMessage({ onStop }: StreamingMessageProps) {
  const { streamPhase, visibleWords, stopStreaming } = useStreaming(onStop);

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-6 pt-6">
        <UserMessage text={STREAMING_TARGET_USER} />

        <div className="flex gap-3.5">
          <div className="flex h-avatar w-avatar flex-none items-center justify-center border border-accent-quiet">
            <span className="font-mono text-xs font-medium text-accent-light leading-none">CI</span>
          </div>

          <div className="flex flex-1 min-w-0 flex-col gap-3">
            {streamPhase < 3 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 flex-none bg-accent streaming-pulse" aria-hidden="true" />
                <span className="font-mono text-xs text-muted">{PHASE_LABELS[streamPhase as 0 | 1 | 2]}</span>
              </div>
            )}

            {streamPhase >= 2 && visibleWords.length > 0 && (
              <p className="text-sm leading-7 text-fg-body">
                {visibleWords.join(" ")}
                {streamPhase === 3 && (
                  <span
                    className="ml-0.5 inline-block h-cursor w-cursor align-text-bottom bg-accent streaming-cursor"
                    aria-hidden="true"
                  />
                )}
              </p>
            )}

            {streamPhase < 3 && (
              <button
                onClick={stopStreaming}
                aria-label="Stop generating"
                className="flex items-center gap-1.5 self-start border border-hairline px-3 py-1.5 text-xs text-fg-body hover:border-accent hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                <div className="h-2.5 w-2.5 flex-none bg-current" />
                Stop generating
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
