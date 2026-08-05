import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import { MetaFooter } from "./meta-footer";

describe("MetaFooter", () => {
  it("renders the model name and chunk count", () => {
    render(
      <MetaFooter
        footer={{ latencySeconds: 1.84, tokens: 1240, costDollars: 0.0043, model: "claude-sonnet", chunks: 4 }}
      />
    );
    expect(screen.getByText(/claude-sonnet/)).toBeInTheDocument();
  });
});
