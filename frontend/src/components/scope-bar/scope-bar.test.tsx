import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi } from "vitest";

import { JOBS } from "@/data/jobs/jobs-data";
import { RESUME } from "@/data/resume/resume-data";

import { ScopeBar } from "./scope-bar";

function renderScopeBar(scope = "all", onScopeChange = vi.fn()) {
  return render(
    <ScopeBar
      scope={scope}
      onScopeChange={onScopeChange}
      jobs={JOBS}
      resumeChunks={RESUME.chunks}
    />
  );
}

describe("ScopeBar", () => {
  it("selecting a job updates the active pill", async () => {
    const onScopeChange = vi.fn();
    renderScopeBar("all", onScopeChange);

    await userEvent.click(screen.getByRole("button", { name: /senior frontend engineer/i }));
    expect(onScopeChange).toHaveBeenCalledWith("job-1");
  });

  it("shows the total chunk count when scope is all jobs", () => {
    renderScopeBar("all");
    const totalChunks = RESUME.chunks + JOBS.reduce((s, j) => s + j.chunks, 0);
    expect(screen.getByText(new RegExp(`${totalChunks} indexed chunks`))).toBeInTheDocument();
  });

  it("shows resume + job chunks when a single job is selected", () => {
    renderScopeBar("job-1");
    const job1 = JOBS.find((j) => j.id === "job-1")!;
    const expectedChunks = RESUME.chunks + job1.chunks;
    expect(screen.getByText(new RegExp(`${expectedChunks} indexed chunks`))).toBeInTheDocument();
  });
});
