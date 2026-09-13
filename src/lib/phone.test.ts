import { describe, it, expect } from "vitest";
import { normalizePhone, INVALID_PHONE_MESSAGE } from "./phone";

describe("normalizePhone", () => {
  it.each([
    ["06 12 34 56 78", "+33612345678"],
    ["0612345678", "+33612345678"],
    ["06.12.34.56.78", "+33612345678"],
    ["+33612345678", "+33612345678"],
    ["0033612345678", "+33612345678"],
  ])("normalises %s to %s", (input, expected) => {
    const result = normalizePhone(input);
    expect(result).toEqual({ ok: true, value: expected });
  });

  it.each(["123", "abcdefghij", ""])("rejects %s", (input) => {
    const result = normalizePhone(input);
    expect(result).toEqual({ ok: false, error: INVALID_PHONE_MESSAGE });
  });
});
