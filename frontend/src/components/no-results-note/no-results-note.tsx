import { Info } from "lucide-react";

import type { NoResultsNoteProps } from "./no-results-note.types";

export function NoResultsNote({ note }: NoResultsNoteProps) {
  return (
    <div className="flex items-start gap-2 border border-warn-border bg-warn-bg px-3 py-2.5">
      <Info size={13} className="mt-0.5 flex-none text-warn-fg" strokeWidth={1.5} />
      <p className="text-xs leading-5 text-warn-fg">{note}</p>
    </div>
  );
}
