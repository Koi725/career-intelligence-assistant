import type { ChatState, Screen } from "@/lib/types";

export interface ChatScreenProps {
  onNavigate: (screen: Screen) => void;
  chatState: ChatState;
  onChatStateChange: (state: ChatState) => void;
}
