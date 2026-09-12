import { describe, it, expect } from "vitest";
import { snapToLadder, slugFor, requiredSlugs } from "./calcom";
import { getQuote, type Selection, type ZoneChoice } from "@/lib/quote";
import { servicesParCategorie, type Categorie } from "@/data/services";

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

// Independently walks getQuote (not requiredSlugs' own generator) across
// every service and a representative spread of its options, single-zone
// and combined. If a future change to services.ts/quote.ts produces a
// reachable duration that requiredSlugs() doesn't cover, this fails.
describe("requiredSlugs guard", () => {
  function zone(overrides: Partial<ZoneChoice> & { serviceId: string }): ZoneChoice {
    return {
      depose: false,
      frenchCount: 0,
      frenchStyle: "french",
      strassCount: 0,
      fleur3dCount: 0,
      tailleXL: false,
      nailArt: false,
      beaute: false,
      ...overrides,
    };
  }

  function assertCovered(selection: Selection, slugs: string[]) {
    const quote = getQuote(selection);
    if (!quote) return;
    const snapped = snapToLadder(quote.durationMinutes);
    if (snapped === null) return; // beyond 240 min — not required to be reachable online
    const slug = slugFor(quote.route, snapped);
    expect(slugs).toContain(slug);
  }

  it("every reachable single-zone duration has a slug", () => {
    const { slugs } = requiredSlugs();
    const zoneKeys: Categorie[] = ["mains", "pieds"];

    for (const zoneKey of zoneKeys) {
      for (const service of servicesParCategorie(zoneKey)) {
        for (const depose of service.allowsDepose ? [false, true] : [false]) {
          for (const beaute of service.allowsBeaute ? [false, true] : [false]) {
            for (const tailleXL of service.allowsTailleXL ? [false, true] : [false]) {
              for (const frenchCount of service.allowsDeco ? [0, 2, 8] : [0]) {
                for (const strassCount of service.allowsDeco ? [0, 2, 8] : [0]) {
                  for (const fleur3dCount of service.allowsDeco ? [0, 3, 10] : [0]) {
                    for (const nailArt of service.allowsDeco ? [false, true] : [false]) {
                      for (const horsHoraires of [false, true]) {
                        const zoneChoice = zone({
                          serviceId: service.id,
                          depose,
                          beaute,
                          tailleXL,
                          frenchCount,
                          strassCount,
                          fleur3dCount,
                          nailArt,
                        });
                        const selection: Selection =
                          zoneKey === "mains"
                            ? { mains: zoneChoice, pieds: null, horsHoraires }
                            : { mains: null, pieds: zoneChoice, horsHoraires };
                        assertCovered(selection, slugs);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  it("every reachable combined mains+pieds duration has a slug", () => {
    const { slugs } = requiredSlugs();

    const mainsCandidates: ZoneChoice[] = [
      zone({ serviceId: "mains-beaute" }),
      zone({ serviceId: "mains-semi" }),
      zone({ serviceId: "mains-capsule", tailleXL: true, fleur3dCount: 10, nailArt: true }),
    ];
    const piedsCandidates: ZoneChoice[] = [
      zone({ serviceId: "pieds-beaute" }),
      zone({ serviceId: "pieds-semi" }),
      zone({ serviceId: "pieds-rallongement", tailleXL: true, fleur3dCount: 10, nailArt: true }),
    ];

    for (const mains of mainsCandidates) {
      for (const pieds of piedsCandidates) {
        for (const horsHoraires of [false, true]) {
          assertCovered({ mains, pieds, horsHoraires }, slugs);
        }
      }
    }
  });
});
