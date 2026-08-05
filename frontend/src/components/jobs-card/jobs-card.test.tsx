import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it } from "vitest";

import { DocumentsProvider } from "@/hooks/use-documents";

import { JobsCard } from "./jobs-card";

function renderJobsCard() {
  return render(
    <DocumentsProvider>
      <JobsCard />
    </DocumentsProvider>
  );
}

describe("JobsCard", () => {
  it("adds a job when the button is clicked", async () => {
    renderJobsCard();
    expect(screen.getByText("NONE ADDED")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /add job description/i }));
    expect(screen.getByText("1 ADDED")).toBeInTheDocument();
  });

  it("removes a job when its remove button is clicked", async () => {
    renderJobsCard();
    await userEvent.click(screen.getByRole("button", { name: /add job description/i }));
    expect(screen.getByText("1 ADDED")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /remove senior frontend engineer/i }));
    expect(screen.getByText("NONE ADDED")).toBeInTheDocument();
  });
});
