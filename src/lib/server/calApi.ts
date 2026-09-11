import "server-only";

import { calUsername, calTimeZone } from "@/data/site";

const CAL_API_BASE = "https://api.cal.com/v2";
const CAL_API_VERSION = "2024-09-04";

type CalSlotsResponse = {
  status: string;
  data: Record<string, { start: string }[]>;
};

export type SlotsByDate = { [date: string]: string[] };

export async function getSlots(
  slug: string,
  startDate: string,
  endDate: string
): Promise<SlotsByDate> {
  const apiKey = process.env.CAL_API_KEY;
  if (!apiKey) {
    throw new Error("CAL_API_KEY n'est pas configurée sur le serveur");
  }

  const url = new URL(`${CAL_API_BASE}/slots`);
  url.searchParams.set("eventTypeSlug", slug);
  url.searchParams.set("username", calUsername);
  url.searchParams.set("start", startDate);
  url.searchParams.set("end", endDate);
  url.searchParams.set("timeZone", calTimeZone);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": CAL_API_VERSION,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Cal.com a répondu avec le statut ${response.status}`
    );
  }

  const body = (await response.json()) as CalSlotsResponse;

  const slotsByDate: SlotsByDate = {};
  for (const [date, slots] of Object.entries(body.data ?? {})) {
    slotsByDate[date] = slots.map((slot) => slot.start);
  }

  return slotsByDate;
}
