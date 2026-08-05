import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { FitCard } from "./fit-card";
import { FIT_CARDS } from "@/data/fit/fit-data";

describe("FitCard", () => {
  it("renders all four axis rows", () => {
    render(<FitCard card={FIT_CARDS[0]} />);
    expect(screen.getByText("Technical")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Seniority")).toBeInTheDocument();
    expect(screen.getByText("Domain")).toBeInTheDocument();
  });

  it("applies the correct tone colour to each axis score", () => {
    render(<FitCard card={FIT_CARDS[0]} />);
    // Job 1 Stripe: Technical 0.86 → good, Experience 0.81 → mid, Domain 0.61 → low
    expect(screen.getByText("0.86")).toHaveClass("text-score-good");
    expect(screen.getByText("0.81")).toHaveClass("text-score-mid");
    expect(screen.getByText("0.61")).toHaveClass("text-score-low");
  });
});
