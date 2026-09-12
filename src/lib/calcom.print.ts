import { it } from "vitest";
import { requiredSlugs, MAX_ONLINE_DURATION } from "./calcom";

// One-off reporting script — run with `npm run cal:links`.
// Not part of the regular `npm test` suite (see vitest.links.config.mts).
it("prints the Cal.com event-type slugs this app requires", () => {
  const { slugs, longestMinutes, unreachableCount } = requiredSlugs();

  const rdvSlugs = slugs.filter((slug) => slug.startsWith("rdv-"));
  const demandeSlugs = slugs.filter((slug) => slug.startsWith("demande-"));

  console.log("=== rdv- slugs ===");
  rdvSlugs.forEach((slug) => console.log(slug));

  console.log("\n=== demande- slugs ===");
  demandeSlugs.forEach((slug) => console.log(slug));

  console.log(`\nTotal slugs required: ${slugs.length}`);
  console.log(`Longest reachable duration: ${longestMinutes} min`);
  console.log(
    `Combinations exceeding ${MAX_ONLINE_DURATION / 60} h (${MAX_ONLINE_DURATION} min): ${unreachableCount}`
  );
});
