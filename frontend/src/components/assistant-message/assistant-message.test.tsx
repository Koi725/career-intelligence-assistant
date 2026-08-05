import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import { EXCHANGE_1 } from "@/data/chat/chat-data";

import { AssistantMessage } from "./assistant-message";

describe("AssistantMessage", () => {
  it("renders the CI avatar and first section heading", () => {
    render(
      <AssistantMessage
        exchange={EXCHANGE_1}
        expandedChips={{}}
        onChipToggle={vi.fn()}
        sourcesOpen={{}}
        onSourcesToggle={vi.fn()}
      />
    );
    expect(screen.getByText("CI")).toBeInTheDocument();
    expect(screen.getByText("Overall alignment")).toBeInTheDocument();
  });
});
