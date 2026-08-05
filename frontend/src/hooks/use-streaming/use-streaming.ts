import { useState, useRef, useEffect } from "react";

import { STREAMING_TARGET_TEXT } from "@/data/chat/chat-data";
import type { StreamPhase } from "@/lib/types";

export interface UseStreamingResult {
  streamPhase: StreamPhase;
  visibleWords: string[];
  stopStreaming: () => void;
}

export function useStreaming(onStop: () => void): UseStreamingResult {
  const [streamPhase, setStreamPhase] = useState<StreamPhase>(0);
  const [visibleWords, setVisibleWords] = useState<string[]>([]);

  const timerT1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerT2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const onStopRef = useRef(onStop);

  useEffect(() => {
    onStopRef.current = onStop;
  });

  useEffect(() => {
    // Two timeouts and an interval. All three die in cleanup — a leaked interval
    // here keeps "generating" running long after the component is gone.
    function clearAll() {
      if (timerT1.current !== null) { clearTimeout(timerT1.current); timerT1.current = null; }
      if (timerT2.current !== null) { clearTimeout(timerT2.current); timerT2.current = null; }
      if (timerInterval.current !== null) { clearInterval(timerInterval.current); timerInterval.current = null; }
    }

    timerT1.current = setTimeout(() => setStreamPhase(1), 850);
    timerT2.current = setTimeout(() => {
      setStreamPhase(2);
      const words = STREAMING_TARGET_TEXT.split(" ");
      let wordCount = 0;
      timerInterval.current = setInterval(() => {
        wordCount++;
        setVisibleWords(words.slice(0, wordCount));
        if (wordCount >= words.length) {
          clearInterval(timerInterval.current!);
          timerInterval.current = null;
          setStreamPhase(3);
        }
      }, 55);
    }, 1750);

    return clearAll;
  }, []);

  function stopStreaming() {
    if (timerT1.current !== null) { clearTimeout(timerT1.current); timerT1.current = null; }
    if (timerT2.current !== null) { clearTimeout(timerT2.current); timerT2.current = null; }
    if (timerInterval.current !== null) { clearInterval(timerInterval.current); timerInterval.current = null; }
    onStopRef.current();
  }

  return { streamPhase, visibleWords, stopStreaming };
}
