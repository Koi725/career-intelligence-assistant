"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { JOBS } from "@/data/jobs/jobs-data";
import type { JobDoc, JobMode, ResumeDoc } from "@/lib/types";

interface DocumentsContextValue {
  resume: ResumeDoc | null;
  setResume: (doc: ResumeDoc | null) => void;
  jobs: JobDoc[];
  addJob: () => void;
  removeJob: (id: string) => void;
  jobMode: JobMode;
  setJobMode: (mode: JobMode) => void;
  canContinue: boolean;
  blockedReason: string;
}

interface DocumentsProviderProps {
  children: ReactNode;
  initialResume?: ResumeDoc | null;
  initialJobs?: JobDoc[];
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

export function DocumentsProvider({ children, initialResume = null, initialJobs = [] }: DocumentsProviderProps) {
  const [resume, setResume] = useState<ResumeDoc | null>(initialResume);
  const [jobs, setJobs] = useState<JobDoc[]>(initialJobs);
  const [jobMode, setJobMode] = useState<JobMode>("paste");

  const addJob = () => {
    const next = JOBS.find((j) => !jobs.some((existing) => existing.id === j.id));
    if (next) setJobs((prev) => [...prev, next]);
  };

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const canContinue = !!resume && jobs.length > 0;

  let blockedReason = "";
  if (!resume && jobs.length === 0) {
    blockedReason = "Add your resume and at least one job description to continue.";
  } else if (!resume) {
    blockedReason = "Add your resume to continue — the assistant has nothing to compare against.";
  } else if (jobs.length === 0) {
    blockedReason = "Add at least one job description to continue.";
  }

  return (
    <DocumentsContext.Provider
      value={{ resume, setResume, jobs, addJob, removeJob, jobMode, setJobMode, canContinue, blockedReason }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments(): DocumentsContextValue {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}
