import { AssistantMessage } from "@/components/assistant-message";
import { UserMessage } from "@/components/user-message";
import { EXCHANGES } from "@/data/chat/chat-data";

import type { MessageThreadProps } from "./message-thread.types";

export function MessageThread({
  expandedChips,
  onChipToggle,
  sourcesOpen,
  onSourcesToggle,
}: MessageThreadProps) {
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pt-6 pb-6">
        {EXCHANGES.map((exchange) => (
          <div key={exchange.id} className="flex flex-col gap-6">
            <UserMessage text={exchange.userMessage} />
            <AssistantMessage
              exchange={exchange}
              expandedChips={expandedChips}
              onChipToggle={onChipToggle}
              sourcesOpen={sourcesOpen}
              onSourcesToggle={onSourcesToggle}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
