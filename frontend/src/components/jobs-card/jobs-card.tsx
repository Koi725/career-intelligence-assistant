"use client";

import { Plus, Upload, X } from "lucide-react";

import { useDocuments } from "@/hooks/use-documents";
import { JOBS } from "@/data/jobs/jobs-data";
import { cn } from "@/lib/utils";

import { BlueprintCard } from "@/components/blueprint-card";

const SOURCE_LABEL: Record<string, string> = {
  paste: "PASTED",
  pdf: "PDF",
};

export function JobsCard() {
  const { jobs, addJob, removeJob, jobMode, setJobMode } = useDocuments();

  const hasMoreJobs = JOBS.some((j) => !jobs.some((existing) => existing.id === j.id));

  return (
    <BlueprintCard>
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <span className="font-heading text-sm font-semibold uppercase tracking-wide text-fg">
          JOB DESCRIPTIONS
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-faint">
          {jobs.length === 0 ? "NONE ADDED" : `${jobs.length} ADDED`}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="flex border border-hairline">
          <button
            onClick={() => setJobMode("paste")}
            aria-pressed={jobMode === "paste"}
            className={cn(
              "flex-1 py-1.5 text-sm font-body focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
              jobMode === "paste" ? "bg-control-active text-fg" : "text-muted hover:bg-control"
            )}
          >
            Paste text
          </button>
          <button
            onClick={() => setJobMode("upload")}
            aria-pressed={jobMode === "upload"}
            className={cn(
              "flex-1 py-1.5 text-sm font-body border-l border-hairline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
              jobMode === "upload" ? "bg-control-active text-fg" : "text-muted hover:bg-control"
            )}
          >
            Upload PDF
          </button>
        </div>

        {jobMode === "paste" ? (
          <div className="flex flex-col gap-2">
            <textarea
              rows={4}
              placeholder="Paste the full job description here — title, company, responsibilities, requirements."
              className="w-full resize-none border border-hairline-control bg-inset px-3 py-2 text-sm text-fg placeholder:text-faint focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-faint">Title and company are detected automatically.</span>
              <button
                onClick={addJob}
                disabled={!hasMoreJobs}
                aria-label="Add job description"
                className={cn(
                  "flex items-center gap-1.5 border border-hairline px-3 py-1.5 text-sm text-fg",
                  "hover:bg-control focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                  !hasMoreJobs && "cursor-not-allowed opacity-40"
                )}
              >
                <Plus size={14} strokeWidth={1.5} />
                Add job description
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={addJob}
            disabled={!hasMoreJobs}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 py-8",
              "border border-dashed border-hairline-dashed",
              "hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
              !hasMoreJobs && "cursor-not-allowed opacity-40"
            )}
          >
            <Upload size={20} className="text-accent" strokeWidth={1.5} />
            <span className="text-sm text-faint">Drop a PDF here or click to browse</span>
          </button>
        )}

        {jobs.length === 0 ? (
          <div className="border border-hairline px-5 py-6 text-center">
            <p className="text-sm text-faint">
              No job descriptions yet. Add at least one — the assistant can only compare against what you give it.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-hairline-subtle border border-hairline">
            {jobs.map((job, index) => (
              <div
                key={job.id}
                className="flex items-center gap-3 bg-inset px-3 py-2.5 animate-in fade-in"
                style={{ animationDuration: "180ms" }}
              >
                <span className="w-logo flex-none text-center font-mono text-xs font-medium text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-1 min-w-0 flex-col gap-0.5">
                  <span className="text-sm text-fg truncate">{job.title}</span>
                  <span className="text-xs text-muted-3">{job.company}</span>
                </div>
                <span className="flex-none border border-hairline-control px-1.5 py-0.5 font-mono text-xs uppercase tracking-widest text-faint">
                  {SOURCE_LABEL[job.source]}
                </span>
                <span className="flex-none font-mono text-xs text-faint">{job.chunks} chunks</span>
                <button
                  onClick={() => removeJob(job.id)}
                  aria-label={`Remove ${job.title}`}
                  className={cn(
                    "flex h-remove-btn w-remove-btn flex-none items-center justify-center border border-hairline",
                    "hover:border-score-low hover:text-score-low",
                    "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                  )}
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </BlueprintCard>
  );
}
