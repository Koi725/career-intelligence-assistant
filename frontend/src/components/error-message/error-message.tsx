"use client";

import { AlertCircle, Copy, RotateCcw } from "lucide-react";

import { UserMessage } from "@/components/user-message";

import type { ErrorMessageProps } from "./error-message.types";

const ERROR_DETAIL =
  "The assistant encountered an error retrieving context from the vector store. Check the logs for a timeout or malformed embedding response.";

export function ErrorMessage({ userMessage, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pt-6 pb-6">
        <UserMessage text={userMessage} />

        <div className="flex gap-3.5">
          <div className="flex h-avatar w-avatar flex-none items-center justify-center border border-error-border">
            <AlertCircle size={12} className="text-error-title" strokeWidth={1.5} />
          </div>

          <div className="flex flex-1 min-w-0 flex-col gap-3">
            <div className="border border-error-border bg-error-bg px-4 py-3">
              <p className="text-sm leading-6 text-error-body text-pretty">{ERROR_DETAIL}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 border border-hairline px-3 py-1.5 text-xs text-fg-body hover:border-accent hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                <RotateCcw size={11} strokeWidth={1.5} className="flex-none" />
                Retry
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(ERROR_DETAIL)}
                aria-label="Copy error message"
                className="flex items-center gap-1.5 border border-hairline px-3 py-1.5 text-xs text-muted hover:border-accent hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                <Copy size={11} strokeWidth={1.5} className="flex-none" />
                Copy error
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
