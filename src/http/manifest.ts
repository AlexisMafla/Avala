import { MCP_HTTP_PATH } from "../mcp/http.js";
import { TOOLS } from "../tools/definitions.js";
import type { PaymentConfig } from "./payments.js";

const VALIDATION_RESULT_SCHEMA = {
  type: "object",
  required: ["valid"],
  properties: {
    valid: { type: "boolean", description: "Whether the identifier passed validation" },
    normalized: { type: "string", description: "Canonical form when valid" },
    reason: {
      type: "string",
      enum: ["invalid_format", "invalid_checksum", "unsupported"],
      description: "Machine-readable failure reason when valid is false",
    },
    details: { type: "object", additionalProperties: true, description: "Extra metadata (type, prefix, etc.)" },
  },
};

/**
 * JSON Schema (subset) describing the request body for each validation tool.
 * Hand-authored to avoid a zod→JSON-Schema dependency; kept in sync with
 * src/tools/definitions.ts.
 */
function toolRequestSchema(toolName: string): Record<string, unknown> {
  switch (toolName) {
    case "validate_tax_id":
      return {
        type: "object",
        required: ["country", "value"],
        properties: {
          country: { type: "string", enum: ["ES", "CO", "AR"], description: "ISO country code" },
          value: { type: "string", minLength: 1, description: "The identifier to validate" },
          type: {
            type: "string",
            enum: ["dni", "nie", "cif", "nit", "cedula", "cuit", "cuil"],
            description: "Optional ID type hint (country-specific)",
          },
        },
      };
    case "validate_bank_account":
      return {
        type: "object",
        required: ["country", "value"],
        properties: {
          country: { type: "string", enum: ["ES", "CO", "AR"], description: "ISO country code" },
          value: { type: "string", minLength: 1, description: "The bank account identifier to validate" },
        },
      };
    case "validate_iban":
      return {
        type: "object",
        required: ["value"],
        properties: {
          value: { type: "string", minLength: 1, description: "The IBAN to validate" },
          country: { type: "string", minLength: 2, maxLength: 2, description: "Optional 2-letter country code to enforce" },
        },
      };
    default:
      return { type: "object" };
  }
}

/**
 * Build the MPP discovery manifest served at /.well-known/mpp.json.
 *
 * It is a standard OpenAPI 3.1 document with two MPP extensions:
 *  - `x-service-info` at the document root (categories, docs, MCP endpoint)
 *  - `x-payment-info.offers[]` on each paid operation (Tempo charge offer)
 *
 * See https://mpp.dev/advanced/discovery
 */
export function buildMppManifest(config: PaymentConfig, baseUrl: string): Record<string, unknown> {
  const base = baseUrl.replace(/\/$/, "");
  const paths: Record<string, unknown> = {};

  for (const tool of TOOLS) {
    const route = `/v1/${tool.name.replace(/_/g, "-")}`;
    const post: Record<string, unknown> = {
      operationId: tool.name,
      summary: tool.title,
      description: tool.description,
      requestBody: {
        required: true,
        content: { "application/json": { schema: toolRequestSchema(tool.name) } },
      },
      responses: {
        "200": {
          description: "Validation result",
          content: { "application/json": { schema: VALIDATION_RESULT_SCHEMA } },
        },
        "402": { description: "Payment Required" },
        "422": { description: "Invalid input" },
      },
    };

    if (config.enabled && config.payTo) {
      post["x-payment-info"] = {
        offers: [
          {
            method: "tempo",
            intent: "charge",
            amount: config.priceAtomic,
            currency: config.asset,
            description: `${tool.description} (${config.priceDisplay} per call)`,
            network: config.network,
            recipient: config.payTo,
          },
        ],
      };
    }

    paths[route] = { post };
  }

  paths["/services.json"] = {
    get: { summary: "Service catalog", responses: { "200": { description: "Catalog" } } },
  };
  paths["/healthz"] = {
    get: { summary: "Health check", responses: { "200": { description: "OK" } } },
  };

  return {
    openapi: "3.1.0",
    info: {
      title: "Avala",
      version: "0.1.0",
      description:
        "Pay-per-call validation of tax IDs and bank accounts for Spain (DNI/NIE/CIF/IBAN), Colombia (NIT/cédula) and Argentina (CUIT/CUIL/DNI/CBU).",
      "x-guidance":
        "POST JSON to a /v1/* endpoint. Without X-Payment you receive HTTP 402 with Tempo pathUSD pricing. Transfer the amount, then retry with header X-Payment: <txHash>:42431.",
    },
    servers: [{ url: base }],
    "x-service-info": {
      categories: ["data"],
      tags: ["validation", "kyc", "tax-id", "iban", "bank-account", "spain", "colombia", "argentina"],
      docs: {
        homepage: base,
        apiReference: `${base}/services.json`,
      },
      mcp: {
        transport: "streamable-http",
        url: `${base}${MCP_HTTP_PATH}`,
      },
    },
    paths,
  };
}
