import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getQuote, type Selection, type QuoteLine } from "@/lib/quote";
import { snapToLadder, slugFor } from "@/lib/calcom";
import { getSlots, createBooking, CalApiError } from "@/lib/server/calApi";
import { formatDuration } from "@/lib/formatDuration";
import { calTimeZone } from "@/data/site";
import { checkRateLimit, getClientIp } from "@/lib/server/rateLimit";
import { normalizePhone } from "@/lib/phone";

const RATE_LIMIT_10MIN = 5;
const RATE_WINDOW_10MIN_MS = 10 * 60_000;
const RATE_LIMIT_1MIN = 2;
const RATE_WINDOW_1MIN_MS = 60_000;

const RATE_LIMIT_MESSAGE =
  "Trop de tentatives. Merci de réessayer dans quelques instants.";

const zoneChoiceSchema = z.object({
  serviceId: z.string(),
  depose: z.boolean(),
  frenchCount: z.number(),
  frenchStyle: z.enum(["french", "babyboomer", "chrome"]),
  strassCount: z.number(),
  fleur3dCount: z.number(),
  tailleXL: z.boolean(),
  nailArt: z.boolean(),
  beaute: z.boolean(),
});

const selectionSchema = z.object({
  mains: zoneChoiceSchema.nullable(),
  pieds: zoneChoiceSchema.nullable(),
  horsHoraires: z.boolean(),
});

const bodySchema = z.object({
  selection: selectionSchema,
  slotIso: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Date de créneau invalide",
  }),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  consent: z.literal(true),
});

const CONFLICT_MESSAGE = "Ce créneau vient d’être réservé.";

function fieldErrorMessage(bodyText: string): string {
  const lowered = bodyText.toLowerCase();
  if (lowered.includes("phone")) {
    return "Numéro de téléphone invalide. Format attendu : 06 12 34 56 78.";
  }
  if (lowered.includes("email")) {
    return "Adresse e-mail invalide.";
  }
  if (lowered.includes("name")) {
    return "Nom invalide.";
  }
  return "La demande de réservation est invalide.";
}

function dayInParis(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function buildPrestationsRecap(
  lines: QuoteLine[],
  total: number,
  hasDevis: boolean,
  durationMinutes: number
): string {
  const lineStrings = lines.map(
    (line) => `${line.label} ${line.price === null ? "sur devis" : `${line.price} €`}`
  );

  const parts = [
    ...lineStrings,
    `Total : ${total} €${hasDevis ? " + devis" : ""}`,
    `Durée : ${formatDuration(durationMinutes)}`,
  ];

  return parts.join(" · ");
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (ip !== null) {
    const shortWindow = checkRateLimit(
      `reservation-1m:${ip}`,
      RATE_LIMIT_1MIN,
      RATE_WINDOW_1MIN_MS
    );
    const longWindow = checkRateLimit(
      `reservation-10m:${ip}`,
      RATE_LIMIT_10MIN,
      RATE_WINDOW_10MIN_MS
    );

    if (!shortWindow.allowed || !longWindow.allowed) {
      const retryAfterSeconds = Math.max(
        shortWindow.allowed ? 0 : shortWindow.retryAfterSeconds,
        longWindow.allowed ? 0 : longWindow.retryAfterSeconds
      );
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        }
      );
    }
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { selection, slotIso, name, email, phone } = parsed.data;

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone.ok) {
    return NextResponse.json({ error: normalizedPhone.error }, { status: 400 });
  }

  let quote;
  try {
    quote = getQuote(selection as Selection);
  } catch {
    return NextResponse.json({ error: "Sélection invalide" }, { status: 400 });
  }

  if (!quote) {
    return NextResponse.json({ error: "Sélection invalide" }, { status: 400 });
  }

  const snapped = snapToLadder(quote.durationMinutes);
  if (snapped === null) {
    return NextResponse.json(
      { error: "Durée trop longue pour la réservation en ligne" },
      { status: 422 }
    );
  }

  const slug = slugFor(quote.route, snapped);
  const day = dayInParis(slotIso);

  try {
    const slots = await getSlots(slug, day, day);
    const stillOffered = (slots[day] ?? []).includes(slotIso);
    if (!stillOffered) {
      return NextResponse.json({ error: CONFLICT_MESSAGE }, { status: 409 });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "erreur inconnue";
    console.error(`Cal.com slots re-check error for slug ${slug}: ${message}`);
    return NextResponse.json(
      { error: "La réservation n’a pas pu être enregistrée." },
      { status: 502 }
    );
  }

  const prestationsRecap = buildPrestationsRecap(
    quote.lines,
    quote.total,
    quote.hasDevis,
    quote.durationMinutes
  );

  try {
    const booking = await createBooking({
      slug,
      start: slotIso,
      attendee: {
        name,
        email,
        phoneNumber: normalizedPhone.value,
        timeZone: calTimeZone,
        language: "fr",
      },
      prestationsRecap,
    });

    return NextResponse.json({ uid: booking.uid, status: booking.status });
  } catch (e) {
    if (e instanceof CalApiError) {
      console.error(
        `Cal.com booking error for slug ${slug}: status ${e.status} - ${e.bodyText}`
      );
      if (e.isConflict) {
        return NextResponse.json({ error: CONFLICT_MESSAGE }, { status: 409 });
      }
      if (e.status >= 400 && e.status < 500) {
        return NextResponse.json(
          { error: fieldErrorMessage(e.bodyText) },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "La réservation n’a pas pu être enregistrée." },
        { status: 502 }
      );
    }
    console.error(`Cal.com booking error for slug ${slug}: unknown error`);
    return NextResponse.json(
      { error: "La réservation n’a pas pu être enregistrée." },
      { status: 502 }
    );
  }
}
