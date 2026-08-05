"use client";

import { useState } from "react";

import { Composer } from "@/components/composer";
import { DocumentRail } from "@/components/document-rail";
import { MessageThread } from "@/components/message-thread";
import { ScopeBar } from "@/components/scope-bar";
import { useDocuments } from "@/hooks/use-documents";
import { JOBS } from "@/data/jobs/jobs-data";
import { RESUME } from "@/data/resume/resume-data";
import type { Scope } from "@/lib/types";

import type { ChatScreenProps } from "./chat-screen.types";

function getScopeLabel(scope: Scope, jobs: typeof JOBS): string {
  if (scope === "all") return "all jobs";
  const job = jobs.find((j) => j.id === scope);
  return job ? job.title.toLowerCase() : "unknown";
}

export function ChatScreen({ onNavigate }: ChatScreenProps) {
  const { resume, jobs } = useDocuments();
  const [scope, setScope] = useState<Scope>("all");
  const [expandedChips, setExpandedChips] = useState<Record<string, boolean>>({});
  const [sourcesOpen, setSourcesOpen] = useState<Record<string, boolean>>({
    "exchange-1": true,
    "exchange-2": true,
  });

  const activeJobs = jobs.length > 0 ? jobs : JOBS;
  const activeResume = resume ?? RESUME;

  const handleChipToggle = (chipId: string) => {
    setExpandedChips((prev) => ({ ...prev, [chipId]: !prev[chipId] }));
  };

  const handleSourcesToggle = (exchangeId: string) => {
    setSourcesOpen((prev) => ({ ...prev, [exchangeId]: !(prev[exchangeId] ?? true) }));
  };

  const scopeLabel = getScopeLabel(scope, activeJobs);

  return (
    <div className="flex flex-1 min-h-0">
      <DocumentRail
        resume={activeResume}
        jobs={activeJobs}
        scope={scope}
        onScopeChange={setScope}
        onManageDocuments={() => onNavigate("setup")}
      />

      <div className="flex flex-1 min-w-0 flex-col min-h-0">
        <ScopeBar
          scope={scope}
          onScopeChange={setScope}
          jobs={activeJobs}
          resumeChunks={activeResume.chunks}
        />
        <MessageThread
          expandedChips={expandedChips}
          onChipToggle={handleChipToggle}
          sourcesOpen={sourcesOpen}
          onSourcesToggle={handleSourcesToggle}
        />
        <Composer scopeLabel={scopeLabel} />
      </div>
    </div>
  );
}
