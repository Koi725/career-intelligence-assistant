import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import { DocumentsProvider } from "@/hooks/use-documents";

import { ChatScreen } from "./chat-screen";

vi.mock("@/lib/api", () => ({
  listJobs: vi.fn().mockResolvedValue([]),
  uploadResume: vi.fn(),
  createJobFromText: vi.fn(),
  createJobFromFile: vi.fn(),
  deleteJob: vi.fn(),
  streamChat: vi.fn(),
}));

describe("ChatScreen", () => {
  it("shows the empty state when no messages exist", () => {
    render(
      <DocumentsProvider initialJobs={[]}>
        <ChatScreen onNavigate={vi.fn()} />
      </DocumentsProvider>
    );
    expect(screen.getByText("Ask anything about your fit")).toBeInTheDocument();
  });
});
