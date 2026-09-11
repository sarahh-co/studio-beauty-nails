import { describe, it, expect } from "vitest";
import { formatDuration } from "./formatDuration";

describe("formatDuration", () => {
  it("30 -> 30 min", () => {
    expect(formatDuration(30)).toBe("30 min");
  });

  it("60 -> 1 h", () => {
    expect(formatDuration(60)).toBe("1 h");
  });

  it("90 -> 1 h 30", () => {
    expect(formatDuration(90)).toBe("1 h 30");
  });

  it("135 -> 2 h 15", () => {
    expect(formatDuration(135)).toBe("2 h 15");
  });

  it("240 -> 4 h", () => {
    expect(formatDuration(240)).toBe("4 h");
  });
});
