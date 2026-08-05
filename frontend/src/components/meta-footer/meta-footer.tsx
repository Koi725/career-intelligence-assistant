import type { MetaFooterProps } from "./meta-footer.types";

export function MetaFooter({ footer }: MetaFooterProps) {
  const { latencySeconds, tokens, costDollars, model, chunks } = footer;

  return (
    <p className="font-mono text-xs text-faint-3">
      {latencySeconds.toFixed(2)} s
      <span className="mx-1.5 text-dot">·</span>
      {tokens.toLocaleString()} tokens
      <span className="mx-1.5 text-dot">·</span>
      ${costDollars.toFixed(4)}
      <span className="mx-1.5 text-dot">·</span>
      {model}
      <span className="mx-1.5 text-dot">·</span>
      {chunks} {chunks === 1 ? "chunk" : "chunks"}
    </p>
  );
}
