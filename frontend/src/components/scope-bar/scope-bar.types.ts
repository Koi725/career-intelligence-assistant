import type { Scope } from "@/lib/types";
import type { JobDoc } from "@/lib/types";

export interface ScopeBarProps {
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  jobs: JobDoc[];
  resumeChunks: number;
}
