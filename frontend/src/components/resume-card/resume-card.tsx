"use client";

import { FileText, Upload, X } from "lucide-react";

import { useDocuments } from "@/hooks/use-documents";
import { RESUME } from "@/data/resume/resume-data";
import { cn } from "@/lib/utils";

import { BlueprintCard } from "@/components/blueprint-card";

export function ResumeCard() {
  const { resume, setResume } = useDocuments();

  return (
    <BlueprintCard>
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <span className="font-heading text-sm font-semibold uppercase tracking-wide text-fg">RESUME</span>
        <span className="font-mono text-xs uppercase tracking-widest text-faint">REQUIRED · PDF ONLY</span>
      </div>

      {resume ? (
        <div className="flex items-center gap-3 bg-inset px-5 py-3">
          <FileText size={18} className="flex-none text-accent-light" strokeWidth={1.5} />
          <div className="flex flex-1 min-w-0 items-center gap-3">
            <span className="text-sm text-fg truncate">{resume.filename}</span>
            <span className="font-mono text-xs text-faint whitespace-nowrap flex-none">
              {resume.pages} pages · {resume.chunks} chunks · {resume.sizeKb} KB
            </span>
            <span className="flex-none border border-good-border bg-good-bg px-1.5 py-0.5 font-mono text-xs uppercase tracking-widest text-score-good">
              PARSED
            </span>
          </div>
          <button
            onClick={() => setResume(null)}
            aria-label="Remove resume"
            className={cn(
              "flex h-remove-btn w-remove-btn flex-none items-center justify-center border border-hairline",
              "hover:border-score-low hover:text-score-low",
              "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            )}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setResume(RESUME)}
          aria-label="Upload resume"
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 py-11",
            "border border-dashed border-hairline-dashed",
            "hover:border-accent hover:bg-panel",
            "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          )}
        >
          <Upload size={26} className="text-accent" strokeWidth={1.5} />
          <span className="font-heading text-lg font-medium text-fg">Drop your resume here</span>
          <span className="text-sm text-faint">or click to browse · PDF, up to 10 MB</span>
        </button>
      )}
    </BlueprintCard>
  );
}
