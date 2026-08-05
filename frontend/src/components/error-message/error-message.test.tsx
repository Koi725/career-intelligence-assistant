import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { ErrorMessage } from "./error-message";

describe("ErrorMessage", () => {
  it("retry restarts streaming by calling onRetry", () => {
    const onRetry = vi.fn();
    render(
      <ErrorMessage
        userMessage="Prepare me for an interview based on Job 1."
        onRetry={onRetry}
      />
    );
    fireEvent.click(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
