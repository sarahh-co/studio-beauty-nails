import "server-only";

import { calUsername, calTimeZone } from "@/data/site";

const CAL_API_BASE = "https://api.cal.com/v2";
const CAL_API_VERSION = "2024-09-04";
const CAL_BOOKINGS_API_VERSION = "2026-02-25";

export class CalApiError extends Error {
  status: number;
  isConflict: boolean;
  bodyText: string;

  constructor(message: string, status: number, isConflict = false, bodyText = "") {
    super(message);
    this.name = "CalApiError";
    this.status = status;
    this.isConflict = isConflict;
    this.bodyText = bodyText;
  }
}

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

export type BookingAttendee = {
  name: string;
  email: string;
  phoneNumber?: string;
  timeZone: string;
  language: string;
};

export type CreateBookingParams = {
  slug: string;
  start: string; // ISO UTC
  attendee: BookingAttendee;
  prestationsRecap: string;
};

export type BookingResult = {
  uid: string;
  status: string;
  start: string;
};

type CalBookingResponse = {
  status: string;
  data: {
    uid: string;
    status: string;
    start: string;
  };
};

export async function createBooking(
  params: CreateBookingParams
): Promise<BookingResult> {
  const apiKey = process.env.CAL_API_KEY;
  if (!apiKey) {
    throw new CalApiError(
      "CAL_API_KEY n'est pas configurée sur le serveur",
      500
    );
  }

  const response = await fetch(`${CAL_API_BASE}/bookings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": CAL_BOOKINGS_API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start: params.start,
      eventTypeSlug: params.slug,
      username: calUsername,
      attendee: params.attendee,
      bookingFieldsResponses: {
        prestations: params.prestationsRecap,
      },
    }),
  });

  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch {
      // ignore — body isn't needed beyond the conflict heuristic below
    }
    const lowered = bodyText.toLowerCase();
    const isConflict =
      response.status === 409 ||
      lowered.includes("conflict") ||
      lowered.includes("no_available_users");

    throw new CalApiError(
      `Cal.com a répondu avec le statut ${response.status}`,
      response.status,
      isConflict,
      bodyText
    );
  }

  const body = (await response.json()) as CalBookingResponse;

  return {
    uid: body.data.uid,
    status: body.data.status,
    start: body.data.start,
  };
}
