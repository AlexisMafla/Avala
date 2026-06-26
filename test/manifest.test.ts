import { describe, expect, it } from "vitest";
import { buildMppManifest } from "../src/http/manifest.js";
import { loadPaymentConfig } from "../src/http/payments.js";

const BASE = "https://avala-production.up.railway.app";

describe("buildMppManifest", () => {
  it("produces a valid OpenAPI 3.1 document with service info", () => {
    const manifest = buildMppManifest(loadPaymentConfig(), BASE) as Record<string, any>;
    expect(manifest.openapi).toBe("3.1.0");
    expect(manifest.info.title).toBe("Avala");
    expect(manifest.servers[0].url).toBe(BASE);
    expect(manifest["x-service-info"].categories).toContain("data");
    expect(manifest["x-service-info"].categories).not.toContain("compliance");
    expect(manifest["x-service-info"].mcp.url).toBe(`${BASE}/mcp`);
  });

  it("advertises all validation endpoints", () => {
    const manifest = buildMppManifest(loadPaymentConfig(), BASE) as Record<string, any>;
    expect(manifest.paths["/v1/validate-tax-id"].post.operationId).toBe("validate_tax_id");
    expect(manifest.paths["/v1/validate-bank-account"].post).toBeDefined();
    expect(manifest.paths["/v1/validate-iban"].post).toBeDefined();
  });

  it("only lists the paid POST routes (no auxiliary GET routes)", () => {
    const manifest = buildMppManifest(loadPaymentConfig(), BASE) as Record<string, any>;
    expect(Object.keys(manifest.paths)).toHaveLength(3);
    expect(manifest.paths["/services.json"]).toBeUndefined();
    expect(manifest.paths["/healthz"]).toBeUndefined();
  });

  it("omits payment offers in free mode", () => {
    const manifest = buildMppManifest(loadPaymentConfig(), BASE) as Record<string, any>;
    expect(manifest.paths["/v1/validate-tax-id"].post["x-payment-info"]).toBeUndefined();
  });

  it("includes input and output schemas on paid endpoints", () => {
    const cfg = {
      ...loadPaymentConfig(),
      enabled: true,
      payTo: "0x1234567890123456789012345678901234567890",
    };
    const manifest = buildMppManifest(cfg, BASE) as Record<string, any>;
    const op = manifest.paths["/v1/validate-tax-id"].post;
    expect(op.requestBody.content["application/json"].schema).toBeDefined();
    expect(op.responses["200"].content["application/json"].schema).toBeDefined();
    expect(op.responses["402"]).toBeDefined();
    expect(op["x-payment-info"].offers[0].description).toContain("per call");
  });

  it("includes a Tempo charge offer when payments are enabled", () => {
    const cfg = {
      ...loadPaymentConfig(),
      enabled: true,
      payTo: "0x1234567890123456789012345678901234567890",
    };
    const manifest = buildMppManifest(cfg, BASE) as Record<string, any>;
    const pay = manifest.paths["/v1/validate-tax-id"].post["x-payment-info"];
    expect(pay.offers).toHaveLength(1);
    expect(pay.offers[0].method).toBe("tempo");
    expect(pay.offers[0].intent).toBe("charge");
    expect(pay.offers[0].amount).toBe(cfg.priceAtomic);
    expect(pay.offers[0].currency).toBe(cfg.asset);
    expect(pay.offers[0].recipient).toBe(cfg.payTo);
  });

  it("declares MPPScan/X402Scan price and protocols on paid endpoints", () => {
    const cfg = {
      ...loadPaymentConfig(),
      enabled: true,
      payTo: "0x1234567890123456789012345678901234567890",
    };
    const manifest = buildMppManifest(cfg, BASE) as Record<string, any>;
    const pay = manifest.paths["/v1/validate-tax-id"].post["x-payment-info"];
    expect(pay.price.mode).toBe("fixed");
    expect(pay.price.currency).toBe("USD");
    expect(pay.price.amount).toBe("0.002000");
    expect(pay.protocols[0].mpp.method).toBe("tempo");
    expect(manifest.info.contact.url).toBe(BASE);
    expect(manifest.info.contact.email).toBe("xn9project@gmail.com");
  });

  it("trims a trailing slash from the base URL", () => {
    const manifest = buildMppManifest(loadPaymentConfig(), `${BASE}/`) as Record<string, any>;
    expect(manifest.servers[0].url).toBe(BASE);
  });
});
