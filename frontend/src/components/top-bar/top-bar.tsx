"use client";

import { cn } from "@/lib/utils";
import { SHOW_STATE_SWITCHER } from "@/lib/config";
import type { Screen } from "@/lib/types";

import type { TopBarProps } from "./top-bar.types";

const STEPS: { id: Screen; index: string; label: string }[] = [
  { id: "setup", index: "01", label: "SETUP" },
  { id: "chat", index: "02", label: "CHAT" },
  { id: "fit", index: "03", label: "FIT" },
];

const CHAT_STATES = ["Empty", "Thread", "Streaming", "Error", "No match"] as const;

export function TopBar({ screen, onScreenChange }: TopBarProps) {
  return (
    <header className="flex h-topbar flex-none items-center border-b border-hairline bg-header px-4 gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex h-logo w-logo flex-none items-center justify-center border border-accent">
          <span className="font-heading text-xs font-bold text-accent-light leading-none">CI</span>
        </div>
        <span className="font-heading text-lg font-semibold uppercase tracking-wide text-fg whitespace-nowrap">
          CAREER INTELLIGENCE
        </span>
      </div>

      <nav className="flex border border-hairline flex-none" aria-label="Steps">
        {STEPS.map(({ id, index, label }) => {
          const isActive = screen === id;
          return (
            <button
              key={id}
              onClick={() => onScreenChange(id)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap border-l border-hairline first:border-l-0 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                isActive
                  ? "bg-accent text-accent-fg"
                  : "text-muted hover:bg-control"
              )}
            >
              <span className={cn("font-mono text-xs", isActive && "opacity-70")}>{index}</span>
              <span className="font-heading text-sm font-semibold uppercase tracking-wide">{label}</span>
            </button>
          );
        })}
      </nav>

      {SHOW_STATE_SWITCHER && screen === "chat" && (
        <div className="flex flex-none items-center gap-2">
          <span className="font-mono text-xs tracking-widest uppercase text-faint">STATE</span>
          <div className="flex border border-hairline h-6">
            {CHAT_STATES.map((state) => (
              <button
                key={state}
                className="px-2 text-xs font-mono text-muted border-l border-hairline first:border-l-0 whitespace-nowrap hover:bg-control focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
