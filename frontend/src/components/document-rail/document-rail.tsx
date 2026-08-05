import { FileText, Plus } from "lucide-react";

import { EMBEDDING_MODEL } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { Scope } from "@/lib/types";

import type { DocumentRailProps } from "./document-rail.types";

const TOTAL_CHUNKS = 90;

export function DocumentRail({ resume, jobs, scope, onScopeChange, onManageDocuments }: DocumentRailProps) {
  const indexedChunks = scope === "all"
    ? TOTAL_CHUNKS
    : (() => {
        const job = jobs.find((j) => j.id === scope);
        const resumeChunks = resume ? resume.chunks : 0;
        return resumeChunks + (job ? job.chunks : 0);
      })();

  return (
    <aside className="flex w-64 flex-none flex-col overflow-auto border-r border-hairline bg-header p-4 gap-5">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-faint">RESUME</span>
        {resume && (
          <div className="flex items-center gap-2 border border-hairline bg-panel px-3 py-2">
            <FileText size={14} className="flex-none text-accent-light" strokeWidth={1.5} />
            <span className="flex-1 min-w-0 truncate text-xs text-fg-body">{resume.filename}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-faint">JOB DESCRIPTIONS</span>
        <div className="flex flex-col gap-1">
          {jobs.map((job, index) => {
            const isActive = scope === job.id;
            return (
              <button
                key={job.id}
                onClick={() => onScopeChange(job.id as Scope)}
                aria-pressed={isActive}
                className={cn(
                  "flex items-center gap-2 border px-3 py-2 text-left",
                  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                  isActive
                    ? "border-accent-quiet bg-panel"
                    : "border-hairline-subtle bg-transparent hover:bg-panel"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-xs font-medium flex-none",
                    isActive ? "text-accent-light" : "text-faint"
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "flex-1 min-w-0 truncate text-xs",
                    isActive ? "text-fg-bright font-semibold" : "text-fg-body"
                  )}
                >
                  {job.title}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onManageDocuments}
          className="flex items-center gap-2 border border-dashed border-hairline-dashed px-3 py-2 text-xs text-faint hover:border-accent hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <Plus size={12} strokeWidth={1.5} className="flex-none" />
          Manage documents
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-hairline pt-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-faint">Indexed chunks</span>
          <span className="font-mono text-xs text-faint">{indexedChunks}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-faint">Embedding</span>
          <span className="font-mono text-xs text-faint truncate max-w-32">{EMBEDDING_MODEL}</span>
        </div>
      </div>
    </aside>
  );
}
