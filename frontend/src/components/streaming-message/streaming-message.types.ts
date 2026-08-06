import type { Citation } from "@/lib/types";

export interface StreamingMessageProps {
  userMessage: string;
  citations: Citation[];
  partialText: string;
  onStop: () => void;
}
