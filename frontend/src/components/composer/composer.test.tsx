import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it } from "vitest";

import { Composer } from "./composer";

describe("Composer", () => {
  it("send button is disabled on empty input", () => {
    render(<Composer scopeLabel="all jobs" />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("send button is enabled when text is entered", async () => {
    render(<Composer scopeLabel="all jobs" />);
    await userEvent.type(screen.getByRole("textbox"), "Hello");
    expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled();
  });
});
