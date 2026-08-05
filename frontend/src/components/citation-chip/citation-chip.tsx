"use client";

import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/collapsible";
import { toneFor, TONE_TEXT, TONE_BG } from "@/lib/tone";
import { cn } from "@/lib/utils";

import type { CitationChipProps } from "./citation-chip.types";

export function CitationChip({ citation, isExpanded, onToggle }: CitationChipProps) {
  const tone = toneFor(citation.score);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-2.5 border-t border-hairline-subtle px-2.5 py-2.5 text-left hover:bg-header focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 first:border-t-0"
      >
        <div className={cn("h-tone-bar w-tone-bar flex-none", TONE_BG[tone])} />
        <span className="w-citation-kind flex-none font-mono text-xs uppercase tracking-widest text-faint">
          {citation.kind}
        </span>
        <span className="flex-1 min-w-0 truncate text-sm text-fg-body">{citation.label}</span>
        <span className={cn("flex-none font-mono text-xs", TONE_TEXT[tone])}>
          {citation.score.toFixed(2)}
        </span>
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          className={cn("flex-none text-accent transition-transform", isExpanded && "rotate-90")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-hairline-subtle bg-deep px-3 pb-3.5 pt-3">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-faint-2">
            {citation.locator}
          </p>
          <p className="border-l-2 border-hairline-strong pl-3 font-mono text-xs leading-7 text-fg-body">
            {citation.chunk}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
