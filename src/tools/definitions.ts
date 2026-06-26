import { z } from "zod";
import {
  validateBankAccount,
  validateIban,
  validateTaxId,
  type ValidationResult,
} from "../core/index.js";

const countryEnum = z.enum(["ES", "CO", "AR"]);

export interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  /** Raw zod shape so it can be reused by both the MCP SDK and HTTP validation. */
  shape: z.ZodRawShape;
  handler: (args: Record<string, unknown>) => ValidationResult;
}

export const TOOLS: ToolDefinition[] = [
  {
    name: "validate_tax_id",
    title: "Validate tax / national ID",
    description:
      "Validate a national tax or personal identifier. Supported: ES (DNI/NIE/CIF), CO (NIT/cédula), AR (CUIT/CUIL/DNI).",
    shape: {
      country: countryEnum.describe("ISO country code: ES, CO or AR"),
      value: z.string().min(1).describe("The identifier to validate"),
      type: z
        .enum(["dni", "nie", "cif", "nit", "cedula", "cuit", "cuil"])
        .optional()
        .describe("Optional ID type hint (country-specific)"),
    },
    handler: (args) =>
      validateTaxId(
        args.country as "ES" | "CO" | "AR",
        String(args.value),
        args.type ? String(args.type) : undefined,
      ),
  },
  {
    name: "validate_bank_account",
    title: "Validate bank account",
    description:
      "Validate a bank account identifier and its checksum. Supported: ES (IBAN), AR (CBU). CO is not standardized.",
    shape: {
      country: countryEnum.describe("ISO country code: ES or AR"),
      value: z.string().min(1).describe("The bank account identifier to validate"),
    },
    handler: (args) => validateBankAccount(args.country as "ES" | "CO" | "AR", String(args.value)),
  },
  {
    name: "validate_iban",
    title: "Validate IBAN",
    description:
      "Validate any IBAN using the ISO 13616 mod-97 algorithm, with optional country enforcement.",
    shape: {
      value: z.string().min(1).describe("The IBAN to validate"),
      country: z
        .string()
        .length(2)
        .optional()
        .describe("Optional 2-letter country code to enforce"),
    },
    handler: (args) => validateIban(String(args.value), args.country ? String(args.country) : undefined),
  },
];

export function getTool(name: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.name === name);
}
