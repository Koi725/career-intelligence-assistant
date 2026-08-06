import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("clicking a prompt card calls onSubmit with the prompt text", () => {
    const handler = vi.fn();
    render(<EmptyState onSubmit={handler} />);
    fireEvent.click(screen.getByText("Which job am I the strongest fit for?"));
    expect(handler).toHaveBeenCalledWith("Which job am I the strongest fit for?");
  });
});
