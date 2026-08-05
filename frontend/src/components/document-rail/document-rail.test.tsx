import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import { JOBS } from "@/data/jobs/jobs-data";
import { RESUME } from "@/data/resume/resume-data";

import { DocumentRail } from "./document-rail";

describe("DocumentRail", () => {
  it("renders the resume filename and all job titles", () => {
    render(
      <DocumentRail
        resume={RESUME}
        jobs={JOBS}
        scope="all"
        onScopeChange={vi.fn()}
        onManageDocuments={vi.fn()}
      />
    );
    expect(screen.getByText(RESUME.filename, { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Senior Frontend Engineer", { exact: false })).toBeInTheDocument();
  });
});
