import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi } from "vitest";

import { DocumentsProvider } from "@/hooks/use-documents";
import type { JobDoc } from "@/lib/types";

import { JobsCard } from "./jobs-card";

vi.mock("@/lib/api", () => ({
  listJobs: vi.fn().mockResolvedValue([]),
  createJobFromText: vi.fn().mockResolvedValue({
    id: "job-test-1",
    title: "Senior Frontend Engineer",
    company: "Acme",
    location: "Remote",
    source: "paste",
    chunks: 12,
  } satisfies JobDoc),
  createJobFromFile: vi.fn(),
  deleteJob: vi.fn().mockResolvedValue(undefined),
  uploadResume: vi.fn(),
  streamChat: vi.fn(),
}));

function renderJobsCard() {
  return render(
    <DocumentsProvider initialJobs={[]}>
      <JobsCard />
    </DocumentsProvider>
  );
}

describe("JobsCard", () => {
  it("adds a job when text is submitted", async () => {
    renderJobsCard();
    expect(screen.getByText("NONE ADDED")).toBeInTheDocument();
    await userEvent.type(
      screen.getByPlaceholderText(/paste the full job description/i),
      "Some job description text"
    );
    await userEvent.click(screen.getByRole("button", { name: /add job description/i }));
    await waitFor(() => expect(screen.getByText("1 ADDED")).toBeInTheDocument());
  });

  it("removes a job when its remove button is clicked", async () => {
    renderJobsCard();
    await userEvent.type(
      screen.getByPlaceholderText(/paste the full job description/i),
      "Some job description text"
    );
    await userEvent.click(screen.getByRole("button", { name: /add job description/i }));
    await waitFor(() => screen.getByText("1 ADDED"));
    await userEvent.click(screen.getByRole("button", { name: /remove senior frontend engineer/i }));
    await waitFor(() => expect(screen.getByText("NONE ADDED")).toBeInTheDocument());
  });
});
