import { describe, it, expect } from "vitest";
import { snapToLadder, slugFor } from "./calcom";

describe("snapToLadder", () => {
  it("30 -> 30", () => {
    expect(snapToLadder(30)).toBe(30);
  });

  it("40 -> 45", () => {
    expect(snapToLadder(40)).toBe(45);
  });

  it("60 -> 60", () => {
    expect(snapToLadder(60)).toBe(60);
  });

  it("121 -> 150", () => {
    expect(snapToLadder(121)).toBe(150);
  });

  it("135 -> 150", () => {
    expect(snapToLadder(135)).toBe(150);
  });

  it("240 -> 240", () => {
    expect(snapToLadder(240)).toBe(240);
  });

  it("241 -> null", () => {
    expect(snapToLadder(241)).toBeNull();
  });
});

describe("slugFor", () => {
  it('slugFor("rdv", 90) -> "rdv-90"', () => {
    expect(slugFor("rdv", 90)).toBe("rdv-90");
  });

  it('slugFor("sur-demande", 60) -> "demande-60"', () => {
    expect(slugFor("sur-demande", 60)).toBe("demande-60");
  });
});
