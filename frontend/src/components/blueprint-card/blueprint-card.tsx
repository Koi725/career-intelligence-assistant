import { cn } from "@/lib/utils";

import type { BlueprintCardProps } from "./blueprint-card.types";

export function BlueprintCard({ children, className, topOnly = false }: BlueprintCardProps) {
  return (
    <div className={cn("relative border border-hairline bg-panel", className)}>
      <span className="blueprint-mark blueprint-mark-tl" aria-hidden="true">+</span>
      <span className="blueprint-mark blueprint-mark-tr" aria-hidden="true">+</span>
      {!topOnly && (
        <>
          <span className="blueprint-mark blueprint-mark-bl" aria-hidden="true">+</span>
          <span className="blueprint-mark blueprint-mark-br" aria-hidden="true">+</span>
        </>
      )}
      {children}
    </div>
  );
}
