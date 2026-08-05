import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the setup screen on initial load", () => {
    render(<AppShell />);
    expect(screen.getByText(/Add your resume and the jobs you/)).toBeInTheDocument();
  });
});
