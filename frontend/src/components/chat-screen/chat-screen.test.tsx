import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import { DocumentsProvider } from "@/hooks/use-documents";

import { ChatScreen } from "./chat-screen";

describe("ChatScreen", () => {
  it("renders the scope bar and message thread", () => {
    render(
      <DocumentsProvider>
        <ChatScreen onNavigate={vi.fn()} />
      </DocumentsProvider>
    );
    expect(screen.getByText("RETRIEVAL SCOPE")).toBeInTheDocument();
    expect(screen.getByText("How does my experience align with Job 2?")).toBeInTheDocument();
  });
});
