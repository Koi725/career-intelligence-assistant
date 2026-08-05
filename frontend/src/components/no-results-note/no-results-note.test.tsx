import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { NoResultsNote } from "./no-results-note";

describe("NoResultsNote", () => {
  it("renders the note text", () => {
    render(
      <NoResultsNote note="Retrieval returned 0 chunks above the 0.3 threshold." />
    );
    expect(
      screen.getByText("Retrieval returned 0 chunks above the 0.3 threshold.")
    ).toBeInTheDocument();
  });
});
