import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import type { Citation } from "@/lib/types";

import { CitationChip } from "./citation-chip";

const CITATION: Citation = {
  id: "c1",
  kind: "Resume",
  label: "Experience — Fathom",
  score: 0.91,
  locator: "Page 2 · chunk 14 of 42",
  chunk: "Led the billing dashboard rewrite.",
};

describe("CitationChip", () => {
  it("renders the citation label", () => {
    render(<CitationChip citation={CITATION} isExpanded={false} onToggle={vi.fn()} />);
    expect(screen.getByText("Experience — Fathom")).toBeInTheDocument();
  });
});
