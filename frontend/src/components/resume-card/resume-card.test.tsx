import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import { DocumentsProvider } from "@/hooks/use-documents";

import { ResumeCard } from "./resume-card";

describe("ResumeCard", () => {
  it("renders the dropzone when no resume is loaded", () => {
    render(
      <DocumentsProvider>
        <ResumeCard />
      </DocumentsProvider>
    );
    expect(screen.getByText("Drop your resume here")).toBeInTheDocument();
  });
});
