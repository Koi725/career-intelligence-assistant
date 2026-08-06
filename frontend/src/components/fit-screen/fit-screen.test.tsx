import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import { FitScreen } from "./fit-screen";

describe("FitScreen", () => {
  it("renders the empty state", () => {
    render(<FitScreen />);
    expect(screen.getByText("Skill gap analysis")).toBeInTheDocument();
    expect(screen.getByText(/not yet implemented/i)).toBeInTheDocument();
  });
});
