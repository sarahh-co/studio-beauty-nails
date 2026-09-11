import { describe, it, expect } from "vitest";
import { services, supplements } from "./services";

describe("services catalogue", () => {
  it("has unique ids across services and supplements", () => {
    const ids = [...services, ...supplements].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a non-negative integer price for every service", () => {
    for (const service of services) {
      expect(Number.isInteger(service.prix)).toBe(true);
      expect(service.prix).toBeGreaterThanOrEqual(0);
    }
  });

  it("has a non-negative integer or null price for every supplement", () => {
    for (const supplement of supplements) {
      if (supplement.prix === null) {
        continue;
      }
      expect(Number.isInteger(supplement.prix)).toBe(true);
      expect(supplement.prix).toBeGreaterThanOrEqual(0);
    }
  });
});
