import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import type { AnswerSection } from "@/lib/types";

import { AnswerBody } from "./answer-body";

const SECTIONS: AnswerSection[] = [
  { heading: "Overall alignment", paragraph: "Strong and direct.", bullets: [] },
  {
    heading: null,
    paragraph: null,
    bullets: [
      { lead: "React depth", continuation: "— six years of experience." },
    ],
  },
];

describe("AnswerBody", () => {
  it("renders headings, paragraphs and bullets from the section array", () => {
    render(<AnswerBody sections={SECTIONS} />);
    expect(screen.getByText("Overall alignment")).toBeInTheDocument();
    expect(screen.getByText("Strong and direct.")).toBeInTheDocument();
    expect(screen.getByText("React depth")).toBeInTheDocument();
  });
});
