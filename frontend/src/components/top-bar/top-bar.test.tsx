import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import { TopBar } from "./top-bar";

describe("TopBar", () => {
  it("marks the active nav item with aria-pressed", () => {
    render(<TopBar screen="chat" onScreenChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /CHAT/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /SETUP/i })).toHaveAttribute("aria-pressed", "false");
  });
});
