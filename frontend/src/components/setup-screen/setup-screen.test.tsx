import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import { DocumentsProvider } from "@/hooks/use-documents";

import { SetupScreen } from "./setup-screen";

describe("SetupScreen", () => {
  it("renders the page heading", () => {
    render(
      <DocumentsProvider>
        <SetupScreen />
      </DocumentsProvider>
    );
    expect(screen.getByText(/Add your resume and the jobs you/)).toBeInTheDocument();
  });
});
