import type { Exchange } from "@/lib/types";

export interface MessageThreadProps {
  exchanges: Exchange[];
  expandedChips: Record<string, boolean>;
  onChipToggle: (chipId: string) => void;
  sourcesOpen: Record<string, boolean>;
  onSourcesToggle: (exchangeId: string) => void;
}
