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
    expect(manifest["x-service-info"].categories).toContain("compliance");
    expect(manifest["x-service-info"].mcp.url).toBe(`${BASE}/mcp`);
  });

  it("advertises all validation endpoints", () => {
    const manifest = buildMppManifest(loadPaymentConfig(), BASE) as Record<string, any>;
    expect(manifest.paths["/v1/validate-tax-id"].post.operationId).toBe("validate_tax_id");
    expect(manifest.paths["/v1/validate-bank-account"].post).toBeDefined();
    expect(manifest.paths["/v1/validate-iban"].post).toBeDefined();
  });

  it("omits payment offers in free mode", () => {
    const manifest = buildMppManifest(loadPaymentConfig(), BASE) as Record<string, any>;
    expect(manifest.paths["/v1/validate-tax-id"].post["x-payment-info"]).toBeUndefined();
  });

  it("includes a Tempo charge offer when payments are enabled", () => {
    const cfg = {
      ...loadPaymentConfig(),
      enabled: true,
      payTo: "0x1234567890123456789012345678901234567890",
    };
    const manifest = buildMppManifest(cfg, BASE) as Record<string, any>;
    const offers = manifest.paths["/v1/validate-tax-id"].post["x-payment-info"].offers;
    expect(offers).toHaveLength(1);
    expect(offers[0].method).toBe("tempo");
    expect(offers[0].intent).toBe("charge");
    expect(offers[0].amount).toBe(cfg.priceAtomic);
    expect(offers[0].currency).toBe(cfg.asset);
    expect(offers[0].recipient).toBe(cfg.payTo);
  });

  it("trims a trailing slash from the base URL", () => {
    const manifest = buildMppManifest(loadPaymentConfig(), `${BASE}/`) as Record<string, any>;
    expect(manifest.servers[0].url).toBe(BASE);
  });
});
