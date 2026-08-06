"use client";

import { useRef, useState } from "react";

import { Composer } from "@/components/composer";
import { DocumentRail } from "@/components/document-rail";
import { EmptyState } from "@/components/empty-state";
import { ErrorMessage } from "@/components/error-message";
import { MessageThread } from "@/components/message-thread";
import { ScopeBar } from "@/components/scope-bar";
import { StreamingMessage } from "@/components/streaming-message";
import { useDocuments } from "@/hooks/use-documents";
import { streamChat } from "@/lib/api";
import type { ChatState, Citation, Exchange, ExchangeFooter, Scope } from "@/lib/types";

import type { ChatScreenProps } from "./chat-screen.types";

interface StreamingState {
  userMessage: string;
  citations: Citation[];
  partialText: string;
}

interface ErrorInfo {
  userMessage: string;
  code: string;
  requestId: string;
}

export function ChatScreen({ onNavigate }: ChatScreenProps) {
  const { resume, jobs } = useDocuments();
  const [scope, setScope] = useState<Scope>("all");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [streaming, setStreaming] = useState<StreamingState | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [expandedChips, setExpandedChips] = useState<Record<string, boolean>>({});
  const [sourcesOpen, setSourcesOpen] = useState<Record<string, boolean>>({});

  const abortRef = useRef<AbortController | null>(null);
  // Ref mirrors streaming state so the stop handler reads a fresh value synchronously.
  const streamingRef = useRef<StreamingState | null>(null);

  const chatState: ChatState =
    streaming !== null ? "streaming" :
    errorInfo !== null ? "error" :
    exchanges.length === 0 ? "empty" :
    exchanges[exchanges.length - 1].citations.length === 0 ? "noresults" :
    "thread";

  const handleSubmit = async (message: string) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const initial: StreamingState = { userMessage: message, citations: [], partialText: "" };
    streamingRef.current = initial;
    setStreaming(initial);
    setErrorInfo(null);

    await streamChat(message, scope, {
      onSources: (citations) => {
        const next = { ...(streamingRef.current ?? initial), citations };
        streamingRef.current = next;
        setStreaming(next);
      },
      onDelta: (text) => {
        const prev = streamingRef.current ?? initial;
        const next = { ...prev, partialText: prev.partialText + text };
        streamingRef.current = next;
        setStreaming(next);
      },
      onDone: (sections, footer) => {
        const current = streamingRef.current;
        streamingRef.current = null;
        setStreaming(null);
        if (current) {
          const exchange: Exchange = {
            id: crypto.randomUUID(),
            userMessage: current.userMessage,
            sections,
            citations: current.citations,
            footer: footer as ExchangeFooter,
          };
          setExchanges((prev) => [...prev, exchange]);
        }
      },
      onError: (code, requestId) => {
        streamingRef.current = null;
        setStreaming(null);
        setErrorInfo({ userMessage: message, code, requestId });
      },
    }, controller.signal);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    const current = streamingRef.current;
    streamingRef.current = null;
    setStreaming(null);
    // Keep partial answer if any text arrived.
    if (current?.partialText) {
      setExchanges((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          userMessage: current.userMessage,
          sections: [{ heading: null, paragraph: current.partialText, bullets: [] }],
          citations: current.citations,
          footer: { latencySeconds: 0, tokens: 0, costDollars: 0, model: "stopped", chunks: current.citations.length },
          note: "Generation stopped.",
        },
      ]);
    }
  };

  const scopeLabel = scope === "all" ? "all jobs" : (jobs.find((j) => j.id === scope)?.title.toLowerCase() ?? "unknown");

  return (
    <div className="flex flex-1 min-h-0">
      <DocumentRail
        resume={resume}
        jobs={jobs}
        scope={scope}
        onScopeChange={setScope}
        onManageDocuments={() => onNavigate("setup")}
      />

      <div className="flex flex-1 min-h-0 min-w-0 flex-col">
        {chatState !== "empty" && (
          <ScopeBar
            scope={scope}
            onScopeChange={setScope}
            jobs={jobs}
            resumeChunks={resume?.chunks ?? 0}
          />
        )}

        {chatState === "empty" && (
          <EmptyState onSubmit={handleSubmit} />
        )}
        {(chatState === "thread" || chatState === "noresults") && (
          <MessageThread
            exchanges={exchanges}
            expandedChips={expandedChips}
            onChipToggle={(id) => setExpandedChips((prev) => ({ ...prev, [id]: !prev[id] }))}
            sourcesOpen={sourcesOpen}
            onSourcesToggle={(id) => setSourcesOpen((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }))}
          />
        )}
        {chatState === "streaming" && streaming && (
          <StreamingMessage
            userMessage={streaming.userMessage}
            citations={streaming.citations}
            partialText={streaming.partialText}
            onStop={handleStop}
          />
        )}
        {chatState === "error" && errorInfo && (
          <ErrorMessage
            userMessage={errorInfo.userMessage}
            detail={`${errorInfo.code}${errorInfo.requestId ? ` · ${errorInfo.requestId}` : ""}`}
            onRetry={() => { void handleSubmit(errorInfo.userMessage); }}
          />
        )}

        <Composer
          scopeLabel={scopeLabel}
          onSubmit={handleSubmit}
          disabled={chatState === "streaming"}
        />
      </div>
    </div>
  );
}
