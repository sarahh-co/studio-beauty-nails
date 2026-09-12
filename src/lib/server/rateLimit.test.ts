import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// "server-only" throws when resolved outside a React Server Components
// build (see node_modules/server-only/index.js) — mocked here only, so
// every other test keeps using the real module resolution.
vi.mock("server-only", () => ({}));

import { checkRateLimit } from "./rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to the limit", () => {
    const key = "allows-up-to-limit";
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, 3, 1000).allowed).toBe(true);
    }
  });

  it("blocks the next request once the limit is reached", () => {
    const key = "blocks-next";
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 1000);
    }
    const result = checkRateLimit(key, 3, 1000);
    expect(result.allowed).toBe(false);
  });

  it("returns a sensible retryAfterSeconds", () => {
    const key = "retry-after";
    checkRateLimit(key, 1, 10_000); // consume the only slot at t=0

    vi.setSystemTime(4_000); // 4s into a 10s window
    const result = checkRateLimit(key, 1, 10_000);

    expect(result.allowed).toBe(false);
    // Window resets at t=10_000, so ~6s remain from t=4_000.
    expect(result.retryAfterSeconds).toBe(6);
  });

  it("allows again once the window has passed", () => {
    const key = "allows-again";
    checkRateLimit(key, 1, 1000);
    expect(checkRateLimit(key, 1, 1000).allowed).toBe(false);

    vi.setSystemTime(1001);

    expect(checkRateLimit(key, 1, 1000).allowed).toBe(true);
  });
});
