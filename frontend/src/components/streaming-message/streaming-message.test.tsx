import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { StreamingMessage } from "./streaming-message";

describe("StreamingMessage", () => {
  it("shows the retrieving phase label and stop button before sources arrive", () => {
    render(
      <StreamingMessage
        userMessage="Which job am I the strongest fit for?"
        citations={[]}
        partialText=""
        onStop={vi.fn()}
      />
    );
    expect(screen.getByText("Retrieving…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop generating" })).toBeInTheDocument();
  });

  it("shows the reading-sources phase label after sources arrive", () => {
    const citations = [
      { id: "c1", kind: "Resume" as const, label: "Skills", score: 0.9, locator: "p1", chunk: "text" },
      { id: "c2", kind: "Job 1" as const, label: "Req", score: 0.8, locator: "s1", chunk: "text" },
    ];
    render(
      <StreamingMessage
        userMessage="Test"
        citations={citations}
        partialText=""
        onStop={vi.fn()}
      />
    );
    expect(screen.getByText("Reading 2 sources…")).toBeInTheDocument();
  });

  it("shows partial text and generating label once delta tokens arrive", () => {
    render(
      <StreamingMessage
        userMessage="Test"
        citations={[]}
        partialText="Strong match on TypeScript"
        onStop={vi.fn()}
      />
    );
    expect(screen.getByText("Generating answer…")).toBeInTheDocument();
    expect(screen.getByText(/Strong match on TypeScript/)).toBeInTheDocument();
  });
});
