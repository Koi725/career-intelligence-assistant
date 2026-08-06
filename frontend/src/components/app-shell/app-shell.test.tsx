import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import { AppShell } from "./app-shell";

vi.mock("@/lib/api", () => ({
  listJobs: vi.fn().mockResolvedValue([]),
  uploadResume: vi.fn(),
  createJobFromText: vi.fn(),
  createJobFromFile: vi.fn(),
  deleteJob: vi.fn(),
  streamChat: vi.fn(),
}));

describe("AppShell", () => {
  it("renders the setup screen on initial load", () => {
    render(<AppShell />);
    expect(screen.getByText(/Add your resume and the jobs you/)).toBeInTheDocument();
  });
});
