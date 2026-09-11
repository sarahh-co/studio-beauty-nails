// Temporary test route — will accept a Selection instead of a slug in the next step.

import { NextRequest, NextResponse } from "next/server";
import { getSlots } from "@/lib/server/calApi";

const SLUG_PATTERN = /^(rdv|demande)-\d+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 14;

function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: "Paramètre slug invalide" },
      { status: 400 }
    );
  }

  if (!from || !to || !isValidDate(from) || !isValidDate(to)) {
    return NextResponse.json(
      { error: "Paramètres from/to invalides (format YYYY-MM-DD attendu)" },
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

  try {
    const slots = await getSlots(slug, from, to);
    return NextResponse.json(slots);
  } catch {
    return NextResponse.json(
      { error: "Impossible de récupérer les créneaux pour le moment" },
      { status: 502 }
    );
  }
}
