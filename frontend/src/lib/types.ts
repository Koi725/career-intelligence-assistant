export type CitationKind = "Resume" | "Job 1" | "Job 2" | "Job 3";

export type Tone = "good" | "mid" | "low";

export type Screen = "setup" | "chat" | "fit";
export type JobMode = "paste" | "upload";
export type ChatState = "empty" | "thread" | "streaming" | "error" | "noresults";
export type Scope = "all" | string;
export type StreamPhase = 0 | 1 | 2 | 3;

export interface ResumeDoc {
  filename: string;
  pages: number;
  chunks: number;
  sizeKb: number;
}

export interface JobDoc {
  id: string;
  title: string;
  company: string;
  location: string;
  source: "paste" | "pdf";
  chunks: number;
}

export interface Citation {
  id: string;
  kind: CitationKind;
  label: string;
  score: number;
  locator: string;
  chunk: string;
}

export interface AnswerBullet {
  lead: string;
  continuation: string;
}

export interface AnswerSection {
  heading: string | null;
  paragraph: string | null;
  bullets: AnswerBullet[];
}

export interface ExchangeFooter {
  latencySeconds: number;
  tokens: number;
  costDollars: number;
  model: string;
  chunks: number;
}

export interface Exchange {
  id: string;
  userMessage: string;
  sections: AnswerSection[];
  citations: Citation[];
  footer: ExchangeFooter;
  note?: string;
}

export interface FitAxis {
  label: string;
  score: number;
  justification: string;
}

export interface FitCard {
  jobId: string;
  jobNumber: number;
  title: string;
  company: string;
  overallScore: number;
  verdict: string;
  axes: FitAxis[];
}
