import type { ChatState, Screen } from "@/lib/types";

export interface TopBarProps {
  screen: Screen;
  onScreenChange: (screen: Screen) => void;
  chatState?: ChatState;
  onChatStateChange?: (state: ChatState) => void;
}
