import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FitScreen } from "./fit-screen";

vi.mock("@/lib/api", () => ({
  analyzeFit: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

const MOCK_CARD = {
  jobId: "job-1",
  jobNumber: 1,
  title: "Senior Engineer",
  company: "Acme",
  overallScore: 82,
  verdict: "Strong fit",
  axes: [
    { label: "Technical",  score: 0.90, justification: "Strong stack." },
    { label: "Experience", score: 0.85, justification: "Five years." },
    { label: "Seniority",  score: 0.80, justification: "Led teams." },
    { label: "Domain",     score: 0.75, justification: "Adjacent industry." },
  ],
};

describe("FitScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows skeleton then cards on success", async () => {
    const { analyzeFit } = await import("@/lib/api");
    vi.mocked(analyzeFit).mockResolvedValue([MOCK_CARD]);

    render(<FitScreen />);

    expect(screen.getByText("Skill gap analysis")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    });
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Strong fit")).toBeInTheDocument();
  });

  it("shows an error message when the API call fails", async () => {
    const { analyzeFit, ApiError } = await import("@/lib/api");
    vi.mocked(analyzeFit).mockRejectedValue(
      new ApiError(400, "Upload a resume before running fit analysis.")
    );

    render(<FitScreen />);

    await waitFor(() => {
      expect(
        screen.getByText("Upload a resume before running fit analysis.")
      ).toBeInTheDocument();
    });
  });
});
