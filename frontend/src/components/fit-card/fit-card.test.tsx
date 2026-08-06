import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { FitCard as FitCardType } from "@/lib/types";

import { FitCard } from "./fit-card";

const BASE_CARD: FitCardType = {
  jobId: "job-1",
  jobNumber: 1,
  title: "Senior Software Engineer",
  company: "Acme Corp",
  overallScore: 82,
  verdict: "Strong fit",
  axes: [
    { label: "Technical",  score: 0.90, justification: "Deep Python and FastAPI experience." },
    { label: "Experience", score: 0.85, justification: "Five years of product engineering." },
    { label: "Seniority",  score: 0.80, justification: "Led a cross-functional initiative." },
    { label: "Domain",     score: 0.50, justification: "Adjacent industry, not direct overlap." },
  ],
};

describe("FitCard", () => {
  it("renders all four axis rows", () => {
    render(<FitCard card={BASE_CARD} />);

    expect(screen.getByText("Technical")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Seniority")).toBeInTheDocument();
    expect(screen.getByText("Domain")).toBeInTheDocument();
  });

  it("formats the job number as JOB 01", () => {
    render(<FitCard card={BASE_CARD} />);
    expect(screen.getByText("JOB 01")).toBeInTheDocument();
  });

  it("applies good tone to a high-scoring axis and low tone to a low-scoring axis", () => {
    render(<FitCard card={BASE_CARD} />);

    // score 0.90 → "good"
    const highValue = screen.getByText("0.90");
    expect(highValue).toHaveClass("text-score-good");

    // score 0.50 → "low"
    const lowValue = screen.getByText("0.50");
    expect(lowValue).toHaveClass("text-score-low");
  });

  it("shows the verdict under the overall score", () => {
    render(<FitCard card={BASE_CARD} />);
    expect(screen.getByText("Strong fit")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
  });
});
