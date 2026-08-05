import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { StreamingMessage } from "./streaming-message";

describe("StreamingMessage", () => {
  it("shows the phase label and stop button on mount", () => {
    vi.useFakeTimers();
    render(<StreamingMessage onStop={vi.fn()} />);
    expect(screen.getByText("Retrieving…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop generating" })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
