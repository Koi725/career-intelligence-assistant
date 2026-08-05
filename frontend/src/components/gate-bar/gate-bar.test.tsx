import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import { DocumentsProvider } from "@/hooks/use-documents";
import { RESUME } from "@/data/resume/resume-data";
import { JOBS } from "@/data/jobs/jobs-data";
import type { JobDoc, ResumeDoc } from "@/lib/types";

function renderGateBar(initialResume: ResumeDoc | null = null, initialJobs: JobDoc[] = []) {
  return render(
    <DocumentsProvider initialResume={initialResume} initialJobs={initialJobs}>
      <GateBar onContinue={vi.fn()} />
    </DocumentsProvider>
  );
}

import { GateBar } from "./gate-bar";

describe("GateBar", () => {
  it("shows the combined reason when neither resume nor jobs are present", () => {
    renderGateBar();
    expect(
      screen.getByText("Add your resume and at least one job description to continue.")
    ).toBeInTheDocument();
  });

  it("shows the resume-only reason when jobs exist but resume does not", () => {
    renderGateBar(null, [JOBS[0]]);
    expect(
      screen.getByText("Add your resume to continue — the assistant has nothing to compare against.")
    ).toBeInTheDocument();
  });

  it("shows the jobs-only reason when resume exists but no jobs", () => {
    renderGateBar(RESUME, []);
    expect(
      screen.getByText("Add at least one job description to continue.")
    ).toBeInTheDocument();
  });
});
