"use client";

import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/collapsible";
import { CitationChip } from "@/components/citation-chip";
import { cn } from "@/lib/utils";

import type { CitationsProps } from "./citations.types";

export function Citations({
  citations,
  exchangeId,
  expandedChips,
  onChipToggle,
  sourcesOpen,
  onSourcesToggle,
}: CitationsProps) {
  if (citations.length === 0) return null;

  const isOpen = sourcesOpen[exchangeId] ?? true;

  return (
    <div className="border-t border-hairline-subtle pt-3">
      <Collapsible open={isOpen} onOpenChange={() => onSourcesToggle(exchangeId)}>
        <CollapsibleTrigger
          aria-expanded={isOpen}
          className="flex items-center gap-2 text-muted-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <span className="font-mono text-xs uppercase tracking-widest">
            SOURCES ({citations.length})
          </span>
          <ChevronRight
            size={12}
            strokeWidth={1.5}
            className={cn("transition-transform", isOpen && "rotate-90")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 border border-hairline-subtle bg-header">
            {citations.map((citation) => (
              <CitationChip
                key={citation.id}
                citation={citation}
                isExpanded={expandedChips[citation.id] ?? false}
                onToggle={() => onChipToggle(citation.id)}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
