export interface MessageThreadProps {
  expandedChips: Record<string, boolean>;
  onChipToggle: (chipId: string) => void;
  sourcesOpen: Record<string, boolean>;
  onSourcesToggle: (exchangeId: string) => void;
}
