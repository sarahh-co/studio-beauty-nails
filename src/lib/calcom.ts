import type { Quote } from "@/lib/quote";

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
