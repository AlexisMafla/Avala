import { INVALID_CHECKSUM, INVALID_FORMAT, type ValidationResult } from "./types.js";

const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";
const NIE_PREFIX: Record<string, string> = { X: "0", Y: "1", Z: "2" };

function clean(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

function controlLetter(numberPart: number): string {
  return DNI_LETTERS[numberPart % 23];
}

/**
 * Validate a Spanish DNI (8 digits + control letter) or NIE (X/Y/Z + 7 digits + control letter).
 */
export function validateEsDniNie(input: string): ValidationResult {
  const value = clean(input);

  // NIE: starts with X, Y or Z
  if (/^[XYZ]\d{7}[A-Z]$/.test(value)) {
    const prefix = value[0];
    const digits = NIE_PREFIX[prefix] + value.slice(1, 8);
    const expected = controlLetter(parseInt(digits, 10));
    const provided = value[8];
    if (expected !== provided) {
      return { valid: false, reason: INVALID_CHECKSUM, details: { type: "NIE", expectedLetter: expected, providedLetter: provided } };
    }
    return { valid: true, normalized: value, details: { type: "NIE" } };
  }

  // DNI: 8 digits + letter
  if (/^\d{8}[A-Z]$/.test(value)) {
    const number = parseInt(value.slice(0, 8), 10);
    const expected = controlLetter(number);
    const provided = value[8];
    if (expected !== provided) {
      return { valid: false, reason: INVALID_CHECKSUM, details: { type: "DNI", expectedLetter: expected, providedLetter: provided } };
    }
    return { valid: true, normalized: value, details: { type: "DNI" } };
  }

  return {
    valid: false,
    reason: INVALID_FORMAT,
    details: { hint: "Expected DNI (8 digits + letter) or NIE (X/Y/Z + 7 digits + letter)." },
  };
}

const CIF_CONTROL_LETTERS = "JABCDEFGHI";
const CIF_ORG_LETTERS = /^[ABCDEFGHJNPQRSUVW]$/;

function cifControlDigit(digits: string): number {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const n = parseInt(digits[i], 10);
    if (i % 2 === 0) {
      const doubled = n * 2;
      sum += doubled >= 10 ? doubled - 9 : doubled;
    } else {
      sum += n;
    }
  }
  const units = sum % 10;
  return units === 0 ? 0 : 10 - units;
}

/**
 * Validate a Spanish CIF (tax ID for legal entities).
 * Format: org letter + 7 digits + control character (digit or letter).
 */
export function validateEsCif(input: string): ValidationResult {
  const value = clean(input);

  if (!/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(value)) {
    return {
      valid: false,
      reason: INVALID_FORMAT,
      details: { hint: "Expected CIF: org letter + 7 digits + control character." },
    };
  }

  const orgLetter = value[0];
  const digits = value.slice(1, 8);
  const providedControl = value[8];
  const expectedDigit = cifControlDigit(digits);
  const letterControlTypes = new Set(["N", "P", "Q", "R", "S", "W"]);
  const expectedControl = letterControlTypes.has(orgLetter)
    ? CIF_CONTROL_LETTERS[expectedDigit]
    : String(expectedDigit);

  if (providedControl !== expectedControl) {
    return {
      valid: false,
      reason: INVALID_CHECKSUM,
      details: { type: "CIF", expectedControl, providedControl },
    };
  }

  return { valid: true, normalized: value, details: { type: "CIF", orgLetter } };
}

export type EsTaxIdType = "dni" | "nie" | "cif";

function detectEsType(value: string): EsTaxIdType | undefined {
  if (/^[XYZ]/.test(value)) return "nie";
  if (/^\d{8}[A-Z]$/.test(value)) return "dni";
  if (CIF_ORG_LETTERS.test(value[0]) && /^\d{7}[0-9A-J]$/.test(value.slice(1))) return "cif";
  return undefined;
}

/**
 * Validate a Spanish tax / personal ID with optional type hint.
 * Auto-detects DNI, NIE or CIF when type is omitted.
 */
export function validateEsTaxId(input: string, type?: EsTaxIdType): ValidationResult {
  const value = clean(input);
  const resolved = type ?? detectEsType(value);

  switch (resolved) {
    case "cif":
      return validateEsCif(value);
    case "nie":
    case "dni":
      return validateEsDniNie(value);
    default:
      return validateEsDniNie(value);
  }
}
