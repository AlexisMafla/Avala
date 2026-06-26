import { validateArCbu, validateArCuit, validateArDni, validateArTaxId, type ArTaxIdType } from "./ar.js";
import { validateCoCedula, validateCoNit, validateCoTaxId, type CoTaxIdType } from "./co.js";
import { validateEsCif, validateEsDniNie, validateEsTaxId, type EsTaxIdType } from "./es.js";
import { validateIban } from "./iban.js";
import { UNSUPPORTED, type Country, type ValidationResult } from "./types.js";

export * from "./types.js";
export { validateIban } from "./iban.js";
export { validateEsDniNie, validateEsCif, validateEsTaxId, type EsTaxIdType } from "./es.js";
export { validateCoNit, validateCoCedula, validateCoTaxId, type CoTaxIdType } from "./co.js";
export { validateArCuit, validateArCbu, validateArDni, validateArTaxId, type ArTaxIdType } from "./ar.js";

export type TaxIdType = EsTaxIdType | CoTaxIdType | ArTaxIdType;

export const SUPPORTED_COUNTRIES: Country[] = ["ES", "CO", "AR"];

/**
 * Validate a national tax / personal identifier for a supported country.
 * - ES: DNI / NIE / CIF
 * - CO: NIT (with verification digit) / cédula (format)
 * - AR: CUIT / CUIL / DNI (format)
 */
export function validateTaxId(country: Country, value: string, type?: string): ValidationResult {
  switch (country) {
    case "ES":
      return validateEsTaxId(value, type as EsTaxIdType | undefined);
    case "CO":
      return validateCoTaxId(value, type as CoTaxIdType | undefined);
    case "AR":
      return validateArTaxId(value, type as ArTaxIdType | undefined);
    default:
      return { valid: false, reason: UNSUPPORTED, details: { country } };
  }
}

/**
 * Validate a bank account identifier for a supported country.
 * - ES: IBAN
 * - AR: CBU
 * - CO: not standardized (no IBAN/CBU equivalent) -> unsupported
 */
export function validateBankAccount(country: Country, value: string): ValidationResult {
  switch (country) {
    case "ES":
      return validateIban(value, "ES");
    case "AR":
      return validateArCbu(value);
    case "CO":
      return {
        valid: false,
        reason: UNSUPPORTED,
        details: { country, hint: "Colombia has no IBAN/CBU standard; account numbers are bank-specific." },
      };
    default:
      return { valid: false, reason: UNSUPPORTED, details: { country } };
  }
}
