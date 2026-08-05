import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi } from "vitest";

import type { Citation } from "@/lib/types";

import { Citations } from "./citations";

const CITATIONS: Citation[] = [
  {
    id: "c1",
    kind: "Resume",
    label: "Experience — Fathom",
    score: 0.91,
    locator: "Page 2 · chunk 14 of 42",
    chunk: "Led the billing dashboard rewrite.",
  },
  {
    id: "c2",
    kind: "Job 2",
    label: "Responsibilities — ownership",
    score: 0.88,
    locator: "Section 2 · chunk 4 of 14",
    chunk: "You will own product surfaces end to end.",
  },
];

function renderCitations(expandedChips: Record<string, boolean> = {}) {
  const onChipToggle = vi.fn();
  const onSourcesToggle = vi.fn();
  render(
    <Citations
      citations={CITATIONS}
      exchangeId="ex-1"
      expandedChips={expandedChips}
      onChipToggle={onChipToggle}
      sourcesOpen={{ "ex-1": true }}
      onSourcesToggle={onSourcesToggle}
    />
  );
  return { onChipToggle };
}

describe("Citations", () => {
  it("chips expand and collapse independently of each other", async () => {
    const { onChipToggle } = renderCitations({ c1: true, c2: false });
    expect(screen.getByText("Led the billing dashboard rewrite.")).toBeInTheDocument();
    expect(screen.queryByText("You will own product surfaces end to end.")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Responsibilities — ownership"));
    expect(onChipToggle).toHaveBeenCalledWith("c2");
  });
});
