import { AnswerBody } from "@/components/answer-body";
import { Citations } from "@/components/citations";
import { MetaFooter } from "@/components/meta-footer";

import type { AssistantMessageProps } from "./assistant-message.types";

export function AssistantMessage({
  exchange,
  expandedChips,
  onChipToggle,
  sourcesOpen,
  onSourcesToggle,
}: AssistantMessageProps) {
  return (
    <div className="flex gap-3.5">
      <div className="flex h-avatar w-avatar flex-none items-center justify-center border border-accent-quiet">
        <span className="font-mono text-xs font-medium text-accent-light leading-none">CI</span>
      </div>
      <div className="flex flex-1 min-w-0 flex-col gap-3.5">
        <AnswerBody sections={exchange.sections} />
        <Citations
          citations={exchange.citations}
          exchangeId={exchange.id}
          expandedChips={expandedChips}
          onChipToggle={onChipToggle}
          sourcesOpen={sourcesOpen}
          onSourcesToggle={onSourcesToggle}
        />
        <MetaFooter footer={exchange.footer} />
      </div>
    </div>
  );
}
