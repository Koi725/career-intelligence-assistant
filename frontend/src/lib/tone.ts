import type { Tone } from "./types";

// Overall scores are 0-100, axis scores are 0-1. Normalising here so toneFor()
// only ever sees one scale.
export function toneFor(value: number): Tone {
  const normalized = value > 1 ? value / 100 : value;
  // The design says 0.82, not 0.8. That boundary was drawn against real score
  // distributions, so leave it alone.
  if (normalized >= 0.82) return "good";
  if (normalized >= 0.70) return "mid";
  return "low";
}

export const TONE_TEXT: Record<Tone, string> = {
  good: "text-score-good",
  mid: "text-score-mid",
  low: "text-score-low",
};

export const TONE_BG: Record<Tone, string> = {
  good: "bg-score-good",
  mid: "bg-score-mid",
  low: "bg-score-low",
};
