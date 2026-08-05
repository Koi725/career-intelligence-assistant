import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

import { useStreaming } from "./use-streaming";

describe("useStreaming", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears all timers on unmount", () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() => useStreaming(vi.fn()));
    act(() => { vi.advanceTimersByTime(2000); });
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("stop preserves partial text and exits streaming", () => {
    vi.useFakeTimers();
    const onStop = vi.fn();
    const { result } = renderHook(() => useStreaming(onStop));
    act(() => { vi.advanceTimersByTime(2200); });
    const wordsBefore = result.current.visibleWords.length;
    expect(wordsBefore).toBeGreaterThan(0);
    act(() => { result.current.stopStreaming(); });
    expect(result.current.visibleWords).toHaveLength(wordsBefore);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
