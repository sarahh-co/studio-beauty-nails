import { processZone, type Quote, type ZoneChoice, type FrenchStyle } from "@/lib/quote";
import { services, type Categorie } from "@/data/services";

export const LADDER = [30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240];
export const MAX_ONLINE_DURATION = 240;

export function snapToLadder(minutes: number): number | null {
  if (minutes > MAX_ONLINE_DURATION) {
    return null;
  }
  const match = LADDER.find((step) => step >= minutes);
  return match ?? null;
}

export function slugFor(route: Quote["route"], minutes: number): string {
  return route === "rdv" ? `rdv-${minutes}` : `demande-${minutes}`;
}

// French/strass only affect duration by tier (0, 1–4, 5–10), so one
// representative count per tier is enough to cover every duration they
// can produce.
const TIER_REPRESENTATIVES = [0, 1, 5];
const FLEUR3D_RANGE = Array.from({ length: 11 }, (_, i) => i); // 0..10
const BOOLEANS = [false, true];
const PLACEHOLDER_FRENCH_STYLE: FrenchStyle = "french"; // style never affects duration

function* candidateZoneChoices(categorie: Categorie): Generator<ZoneChoice> {
  for (const service of services.filter((s) => s.categorie === categorie)) {
    for (const frenchCount of TIER_REPRESENTATIVES) {
      for (const strassCount of TIER_REPRESENTATIVES) {
        for (const fleur3dCount of FLEUR3D_RANGE) {
          for (const nailArt of BOOLEANS) {
            for (const tailleXL of BOOLEANS) {
              for (const depose of BOOLEANS) {
                for (const beaute of BOOLEANS) {
                  yield {
                    serviceId: service.id,
                    depose,
                    frenchCount,
                    frenchStyle: PLACEHOLDER_FRENCH_STYLE,
                    strassCount,
                    fleur3dCount,
                    tailleXL,
                    nailArt,
                    beaute,
                  };
                }
              }
            }
          }
        }
      }
    }
  }
}

type ZoneDurationOption = {
  durationMinutes: number;
  hasNailArt: boolean;
};

// Reuses processZone (the engine) for both duration math and validation:
// any combination getQuote would reject throws here too and is skipped,
// so the rules only ever live in quote.ts.
function computeZoneDurationOptions(categorie: Categorie): ZoneDurationOption[] {
  const seen = new Set<string>();
  const options: ZoneDurationOption[] = [];

  function add(durationMinutes: number, hasNailArt: boolean) {
    const key = `${durationMinutes}|${hasNailArt}`;
    if (!seen.has(key)) {
      seen.add(key);
      options.push({ durationMinutes, hasNailArt });
    }
  }

  add(0, false); // "no prestation" in this zone

  for (const candidate of candidateZoneChoices(categorie)) {
    try {
      const result = processZone(categorie, candidate);
      add(result.durationMinutes, candidate.nailArt);
    } catch {
      // Invalid combination per getQuote's own rules — skip.
    }
  }

  return options;
}

export type RequiredSlugsResult = {
  slugs: string[];
  longestMinutes: number;
  unreachableCount: number;
};

export function requiredSlugs(): RequiredSlugsResult {
  const mainsOptions = computeZoneDurationOptions("mains");
  const piedsOptions = computeZoneDurationOptions("pieds");

  const slugSet = new Set<string>();
  let longestMinutes = 0;
  let unreachableCount = 0;

  for (const mainsOption of mainsOptions) {
    for (const piedsOption of piedsOptions) {
      if (mainsOption.durationMinutes === 0 && piedsOption.durationMinutes === 0) {
        continue; // both zones empty — getQuote returns null, not a real booking
      }

      const rawTotal = mainsOption.durationMinutes + piedsOption.durationMinutes;
      const rounded = Math.ceil(rawTotal / 15) * 15;
      const snapped = snapToLadder(rounded);

      if (snapped === null) {
        unreachableCount += 1;
        continue;
      }

      longestMinutes = Math.max(longestMinutes, snapped);

      const hasNailArt = mainsOption.hasNailArt || piedsOption.hasNailArt;
      for (const horsHoraires of BOOLEANS) {
        const route: Quote["route"] =
          horsHoraires || hasNailArt ? "sur-demande" : "rdv";
        slugSet.add(slugFor(route, snapped));
      }
    }
  }

  return {
    slugs: Array.from(slugSet).sort(),
    longestMinutes,
    unreachableCount,
  };
}
