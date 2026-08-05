import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import { UserMessage } from "./user-message";

describe("UserMessage", () => {
  it("renders the message text", () => {
    render(<UserMessage text="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });
});
