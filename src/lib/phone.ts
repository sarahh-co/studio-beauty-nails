export const INVALID_PHONE_MESSAGE =
  "Numéro de téléphone invalide. Format attendu : 06 12 34 56 78.";

export type PhoneNormalizeResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/**
 * Normalises a French-style phone number to E.164 (+33...).
 * Cal.com's API requires attendee.phoneNumber in E.164 format; the client
 * form keeps accepting the natural French format, so this runs server-side.
 */
export function normalizePhone(raw: string): PhoneNormalizeResult {
  const stripped = raw.replace(/[\s.\-()]/g, "");

  let digits: string | null = null;

  if (/^\+\d{6,15}$/.test(stripped)) {
    return { ok: true, value: stripped };
  }

  if (/^0033\d{9}$/.test(stripped)) {
    digits = stripped.slice(4);
  } else if (/^0\d{9}$/.test(stripped)) {
    digits = stripped.slice(1);
  }

  if (digits !== null) {
    return { ok: true, value: `+33${digits}` };
  }

  return { ok: false, error: INVALID_PHONE_MESSAGE };
}
