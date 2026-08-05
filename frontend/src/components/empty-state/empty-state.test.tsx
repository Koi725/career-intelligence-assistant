import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("clicking a prompt card calls onStartStreaming", () => {
    const handler = vi.fn();
    render(<EmptyState onStartStreaming={handler} />);
    fireEvent.click(screen.getByText("Which job am I the strongest fit for?"));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
