import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import { MessageThread } from "./message-thread";

describe("MessageThread", () => {
  it("renders both exchange user messages", () => {
    render(
      <MessageThread
        expandedChips={{}}
        onChipToggle={vi.fn()}
        sourcesOpen={{}}
        onSourcesToggle={vi.fn()}
      />
    );
    expect(screen.getByText("How does my experience align with Job 2?")).toBeInTheDocument();
    expect(screen.getByText("What skills am I missing for Job 3?")).toBeInTheDocument();
  });
});
