import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

import { FitScreen } from "./fit-screen";

describe("FitScreen", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("shows the skeleton during re-run and the cards after", () => {
    vi.useFakeTimers();
    render(<FitScreen />);

    expect(screen.getByText("Staff Product Engineer")).toBeInTheDocument();

    act(() => { screen.getByRole("button", { name: "Re-run analysis" }).click(); });
    expect(screen.queryByText("Staff Product Engineer")).not.toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1600); });
    expect(screen.getByText("Staff Product Engineer")).toBeInTheDocument();
  });
});
