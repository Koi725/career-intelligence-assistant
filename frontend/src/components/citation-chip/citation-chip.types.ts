import type { Citation } from "@/lib/types";

export interface CitationChipProps {
  citation: Citation;
  isExpanded: boolean;
  onToggle: () => void;
}
