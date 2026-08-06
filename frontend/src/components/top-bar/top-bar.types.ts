import type { Screen } from "@/lib/types";

export interface TopBarProps {
  screen: Screen;
  onScreenChange: (screen: Screen) => void;
}
