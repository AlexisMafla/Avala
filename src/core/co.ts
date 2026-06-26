import { INVALID_CHECKSUM, INVALID_FORMAT, type ValidationResult } from "./types.js";

// Weights applied right-to-left to the NIT base digits (DIAN algorithm).
const NIT_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

function computeNitDv(base: string): number {
  let sum = 0;
  const reversed = base.split("").reverse();
  for (let i = 0; i < reversed.length; i++) {
    sum += parseInt(reversed[i], 10) * NIT_WEIGHTS[i];
  }
  const mod = sum % 11;
  return mod > 1 ? 11 - mod : mod;
}

/**
 * Validate a Colombian NIT including its verification digit (DV).
 * Accepts "900123456-7", "9001234567" or base+dv passed together.
 * The last digit (or the digit after a dash) is treated as the DV.
 */
export function validateCoNit(input: string): ValidationResult {
  const cleaned = input.replace(/[\s.]/g, "");
  const match = cleaned.match(/^(\d{5,15})-?(\d)$/);
  if (!match) {
    return {
      valid: false,
      reason: INVALID_FORMAT,
      details: { hint: "Expected NIT base (5-15 digits) followed by a verification digit, e.g. 900123456-7." },
    };
  }

  const base = match[1];
  const providedDv = parseInt(match[2], 10);
  const expectedDv = computeNitDv(base);

  if (providedDv !== expectedDv) {
    return { valid: false, reason: INVALID_CHECKSUM, details: { base, expectedDv, providedDv } };
  }

  return {
    valid: true,
    normalized: `${base}-${expectedDv}`,
    details: { type: "NIT", base, dv: expectedDv },
  };
}

/**
 * Validate a Colombian national ID card (cédula) — format only (no official checksum).
 */
export function validateCoCedula(input: string): ValidationResult {
  const cleaned = input.replace(/[\s.-]/g, "");
  if (!/^\d{6,10}$/.test(cleaned)) {
    return {
      valid: false,
      reason: INVALID_FORMAT,
      details: { hint: "Expected 6-10 numeric digits.", note: "no official checksum" },
    };
  }

  return {
    valid: true,
    normalized: cleaned,
    details: { type: "cedula", note: "format only; no official checksum" },
  };
}

export type CoTaxIdType = "nit" | "cedula";

/** Validate a Colombian tax / personal ID with optional type hint. */
export function validateCoTaxId(input: string, type?: CoTaxIdType): ValidationResult {
  if (type === "cedula") return validateCoCedula(input);
  if (type === "nit") return validateCoNit(input);
  return validateCoNit(input);
}
