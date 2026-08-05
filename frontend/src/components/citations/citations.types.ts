import type { Citation } from "@/lib/types";

export interface CitationsProps {
  citations: Citation[];
  exchangeId: string;
  expandedChips: Record<string, boolean>;
  onChipToggle: (chipId: string) => void;
  sourcesOpen: Record<string, boolean>;
  onSourcesToggle: (exchangeId: string) => void;
}
