"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ComposerProps } from "./composer.types";

export function Composer({ scopeLabel }: ComposerProps) {
  const [value, setValue] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
    }
  };

  return (
    <div className="flex-none border-t border-hairline bg-header px-6 pt-3.5 pb-4">
      <div className="mx-auto max-w-3xl flex flex-col gap-2">
        <div className="flex items-end gap-2 border border-hairline-strong bg-inset px-3 py-2">
          <textarea
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your fit, gaps, or interview prep…"
            className="flex-1 resize-none bg-transparent text-sm text-fg placeholder:text-faint focus:outline-none max-h-28"
          />
          <button
            aria-label="Send message"
            disabled={value.trim().length === 0}
            className={cn(
              "flex h-send-button w-send-button flex-none items-center justify-center bg-accent text-accent-fg hover:bg-accent-hover",
              "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
              value.trim().length === 0 && "cursor-not-allowed opacity-40"
            )}
          >
            <Send size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-faint">
            Answers are grounded in your documents only. Every claim is citable.
          </span>
          <span className="font-mono text-xs text-faint">scope: {scopeLabel}</span>
        </div>
      </div>
    </div>
  );
}
