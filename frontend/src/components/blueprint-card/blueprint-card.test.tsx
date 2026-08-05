import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import { BlueprintCard } from "./blueprint-card";

describe("BlueprintCard", () => {
  it("renders children", () => {
    render(<BlueprintCard>Hello blueprint</BlueprintCard>);
    expect(screen.getByText("Hello blueprint")).toBeInTheDocument();
  });
});
