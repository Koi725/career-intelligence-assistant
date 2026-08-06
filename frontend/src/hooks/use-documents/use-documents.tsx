"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import * as api from "@/lib/api";
import type { JobDoc, JobMode, ResumeDoc } from "@/lib/types";

interface DocumentsContextValue {
  resume: ResumeDoc | null;
  uploadResume: (file: File) => void;
  uploadingResume: boolean;
  uploadError: string | null;
  clearResume: () => void;
  jobs: JobDoc[];
  addJobFromText: (text: string) => void;
  addJobFromFile: (file: File) => void;
  removeJob: (id: string) => void;
  addingJob: boolean;
  jobError: string | null;
  jobMode: JobMode;
  setJobMode: (mode: JobMode) => void;
  canContinue: boolean;
  blockedReason: string;
}

interface DocumentsProviderProps {
  children: ReactNode;
  // Seed props for tests — when provided, the API fetch on mount is skipped.
  initialResume?: ResumeDoc | null;
  initialJobs?: JobDoc[];
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

export function DocumentsProvider({
  children,
  initialResume = null,
  initialJobs,
}: DocumentsProviderProps) {
  const [resume, setResume] = useState<ResumeDoc | null>(initialResume);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobDoc[]>(initialJobs ?? []);
  const [addingJob, setAddingJob] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobMode, setJobMode] = useState<JobMode>("paste");

  useEffect(() => {
    // Skip when initial state is explicitly provided (e.g., in component tests).
    if (initialJobs !== undefined) return;
    api.listJobs().then(setJobs).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadResume = (file: File) => {
    setUploadingResume(true);
    setUploadError(null);
    api.uploadResume(file)
      .then(setResume)
      .catch((err: unknown) =>
        setUploadError(err instanceof Error ? err.message : "Upload failed.")
      )
      .finally(() => setUploadingResume(false));
  };

  const clearResume = () => setResume(null);

  const addJobFromText = (text: string) => {
    setAddingJob(true);
    setJobError(null);
    api.createJobFromText(text)
      .then((job) => setJobs((prev) => [...prev, job]))
      .catch((err: unknown) =>
        setJobError(err instanceof Error ? err.message : "Failed to add job.")
      )
      .finally(() => setAddingJob(false));
  };

  const addJobFromFile = (file: File) => {
    setAddingJob(true);
    setJobError(null);
    api.createJobFromFile(file)
      .then((job) => setJobs((prev) => [...prev, job]))
      .catch((err: unknown) =>
        setJobError(err instanceof Error ? err.message : "Failed to add job.")
      )
      .finally(() => setAddingJob(false));
  };

  const removeJob = (id: string) => {
    api.deleteJob(id)
      .then(() => setJobs((prev) => prev.filter((j) => j.id !== id)))
      .catch((err: unknown) =>
        setJobError(err instanceof Error ? err.message : "Failed to remove job.")
      );
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
      value={{
        resume, uploadResume, uploadingResume, uploadError, clearResume,
        jobs, addJobFromText, addJobFromFile, removeJob, addingJob, jobError,
        jobMode, setJobMode, canContinue, blockedReason,
      }}
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
