import { INVALID_CHECKSUM, INVALID_FORMAT, type ValidationResult } from "./types.js";

const CUIT_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

function computeCuitDv(first10: string): number {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(first10[i], 10) * CUIT_WEIGHTS[i];
  }
  const mod = sum % 11;
  const dv = 11 - mod;
  if (dv === 11) return 0;
  if (dv === 10) return -1; // special case handled by the caller
  return dv;
}

/**
 * Validate an Argentine CUIT/CUIL (11 digits, mod-11 check digit).
 */
export function validateArCuit(input: string): ValidationResult {
  const value = input.replace(/[\s-]/g, "");
  if (!/^\d{11}$/.test(value)) {
    return { valid: false, reason: INVALID_FORMAT, details: { hint: "Expected 11 digits (XX-XXXXXXXX-X)." } };
  }

  const expectedDv = computeCuitDv(value.slice(0, 10));
  const providedDv = parseInt(value[10], 10);

  if (expectedDv === -1) {
    return { valid: false, reason: INVALID_CHECKSUM, details: { hint: "Check digit resolves to a special CUIT not accepted." } };
  }
  if (expectedDv !== providedDv) {
    return { valid: false, reason: INVALID_CHECKSUM, details: { expectedDv, providedDv } };
  }

  const prefix = value.slice(0, 2);
  return {
    valid: true,
    normalized: `${prefix}-${value.slice(2, 10)}-${value[10]}`,
    details: { type: "CUIT/CUIL", prefix },
  };
}

/**
 * Validate an Argentine DNI — format only (no official checksum).
 */
export function validateArDni(input: string): ValidationResult {
  const value = input.replace(/[\s.-]/g, "");
  if (!/^\d{7,8}$/.test(value)) {
    return {
      valid: false,
      reason: INVALID_FORMAT,
      details: { hint: "Expected 7-8 numeric digits.", note: "no official checksum" },
    };
  }

  return {
    valid: true,
    normalized: value,
    details: { type: "DNI", note: "format only; no official checksum" },
  };
}

export type ArTaxIdType = "cuit" | "cuil" | "dni";

function detectArType(value: string): ArTaxIdType {
  const cleaned = value.replace(/[\s-]/g, "");
  if (/^\d{7,8}$/.test(cleaned)) return "dni";
  return "cuit";
}

/** Validate an Argentine tax / personal ID with optional type hint. */
export function validateArTaxId(input: string, type?: ArTaxIdType): ValidationResult {
  const resolved = type ?? detectArType(input);
  if (resolved === "dni") return validateArDni(input);
  return validateArCuit(input);
}

const CBU_BLOCK1_WEIGHTS = [7, 1, 3, 9, 7, 1, 3];
const CBU_BLOCK2_WEIGHTS = [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3];

function checkCbuBlock(digits: string, weights: number[]): boolean {
  const body = digits.slice(0, weights.length);
  const check = parseInt(digits[weights.length], 10);
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += parseInt(body[i], 10) * weights[i];
  }
  const computed = (10 - (sum % 10)) % 10;
  return computed === check;
}

/**
 * Validate an Argentine CBU (22 digits, two weighted check digits).
 */
export function validateArCbu(input: string): ValidationResult {
  const value = input.replace(/[\s-]/g, "");
  if (!/^\d{22}$/.test(value)) {
    return { valid: false, reason: INVALID_FORMAT, details: { hint: "Expected 22 digits." } };
  }

  const block1 = value.slice(0, 8);
  const block2 = value.slice(8, 22);

  const block1Ok = checkCbuBlock(block1, CBU_BLOCK1_WEIGHTS);
  const block2Ok = checkCbuBlock(block2, CBU_BLOCK2_WEIGHTS);

  if (!block1Ok || !block2Ok) {
    return { valid: false, reason: INVALID_CHECKSUM, details: { block1Ok, block2Ok } };
  }

  return {
    valid: true,
    normalized: value,
    details: { bankCode: block1.slice(0, 3), branchCode: block1.slice(3, 7) },
  };
}
