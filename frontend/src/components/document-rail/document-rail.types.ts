import type { JobDoc, ResumeDoc, Scope } from "@/lib/types";

export interface DocumentRailProps {
  resume: ResumeDoc | null;
  jobs: JobDoc[];
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  onManageDocuments: () => void;
}
