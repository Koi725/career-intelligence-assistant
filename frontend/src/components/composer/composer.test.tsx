import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi } from "vitest";

import { Composer } from "./composer";

describe("Composer", () => {
  it("send button is disabled on empty input", () => {
    render(<Composer scopeLabel="all jobs" onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("send button is enabled when text is entered", async () => {
    render(<Composer scopeLabel="all jobs" onSubmit={vi.fn()} />);
    await userEvent.type(screen.getByRole("textbox"), "Hello");
    expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled();
  });
});
