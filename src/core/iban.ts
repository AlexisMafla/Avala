import { INVALID_CHECKSUM, INVALID_FORMAT, UNSUPPORTED, type ValidationResult } from "./types.js";

/** Expected total IBAN length per country code (subset relevant to this service + common ones). */
const IBAN_LENGTHS: Record<string, number> = {
  ES: 24,
  PT: 25,
  FR: 27,
  DE: 22,
  IT: 27,
  NL: 18,
  GB: 22,
  IE: 22,
  BE: 16,
  CH: 21,
  AD: 24,
};

function clean(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

/** Convert an IBAN into its numeric string for the mod-97 check. */
function toNumeric(iban: string): string {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let out = "";
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    if (code >= 48 && code <= 57) {
      out += ch; // 0-9
    } else if (code >= 65 && code <= 90) {
      out += (code - 55).toString(); // A=10 ... Z=35
    } else {
      return ""; // invalid character
    }
  }
  return out;
}

/** mod-97 over an arbitrarily long numeric string. */
function mod97(numeric: string): number {
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + (digit.charCodeAt(0) - 48)) % 97;
  }
  return remainder;
}

/**
 * Validate an IBAN using the ISO 13616 / ISO 7064 mod-97 algorithm.
 * Optionally restricts to an expected country code.
 */
export function validateIban(input: string, expectedCountry?: string): ValidationResult {
  const iban = clean(input);

  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) {
    return { valid: false, reason: INVALID_FORMAT, details: { hint: "Expected 2-letter country, 2 check digits, then BBAN." } };
  }

  const country = iban.slice(0, 2);
  if (expectedCountry && country !== expectedCountry.toUpperCase()) {
    return { valid: false, reason: INVALID_FORMAT, details: { country, expectedCountry: expectedCountry.toUpperCase() } };
  }

  const expectedLen = IBAN_LENGTHS[country];
  if (expectedLen === undefined) {
    return { valid: false, reason: UNSUPPORTED, details: { country, hint: "Country IBAN length not registered in this service." } };
  }
  if (iban.length !== expectedLen) {
    return { valid: false, reason: INVALID_FORMAT, details: { country, length: iban.length, expectedLength: expectedLen } };
  }

  const numeric = toNumeric(iban);
  if (numeric === "") {
    return { valid: false, reason: INVALID_FORMAT };
  }

  const ok = mod97(numeric) === 1;
  if (!ok) {
    return { valid: false, reason: INVALID_CHECKSUM, details: { country } };
  }

  return {
    valid: true,
    normalized: iban,
    details: {
      country,
      checkDigits: iban.slice(2, 4),
      bban: iban.slice(4),
      formatted: iban.replace(/(.{4})/g, "$1 ").trim(),
    },
  };
}
