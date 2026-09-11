import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getQuote, type Selection } from "@/lib/quote";
import { snapToLadder, slugFor } from "@/lib/calcom";
import { getSlots } from "@/lib/server/calApi";

const MAX_RANGE_DAYS = 14;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
  from: z.string().regex(DATE_PATTERN),
  to: z.string().regex(DATE_PATTERN),
});

function isValidCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

function todayInParis(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function POST(request: NextRequest) {
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

  const { selection, from, to } = parsed.data;

  if (!isValidCalendarDate(from) || !isValidCalendarDate(to)) {
    return NextResponse.json(
      { error: "Dates invalides (format YYYY-MM-DD attendu)" },
      { status: 400 }
    );
  }

  if (from < todayInParis()) {
    return NextResponse.json(
      { error: "La date de début doit être aujourd'hui ou plus tard" },
      { status: 400 }
    );
  }

  const fromDate = new Date(`${from}T00:00:00Z`);
  const toDate = new Date(`${to}T00:00:00Z`);
  const rangeDays =
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);

  if (rangeDays < 0 || rangeDays > MAX_RANGE_DAYS) {
    return NextResponse.json(
      { error: `La plage de dates doit être comprise entre 0 et ${MAX_RANGE_DAYS} jours` },
      { status: 400 }
    );
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

  try {
    const slots = await getSlots(slug, from, to);
    return NextResponse.json({ slots });
  } catch (e) {
    const message = e instanceof Error ? e.message : "erreur inconnue";
    console.error(`Cal.com error for slug ${slug}: ${message}`);
    return NextResponse.json(
      { error: "Impossible de récupérer les créneaux pour le moment" },
      { status: 502 }
    );
  }
}
