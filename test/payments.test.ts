import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildPaymentDiscovery,
  buildPaymentStatus,
  loadPaymentConfig,
  validatePaymentConfig,
} from "../src/http/payments.js";

const ENV_KEYS = [
  "PAY_TO",
  "X402_NETWORK",
  "X402_ASSET",
  "X402_ASSET_DECIMALS",
  "PRICE_ATOMIC",
  "TEMPO_RPC_URL",
] as const;

function snapshotEnv(): Record<string, string | undefined> {
  return Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
}

function restoreEnv(saved: Record<string, string | undefined>): void {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
}

describe("loadPaymentConfig", () => {
  const saved = snapshotEnv();

  afterEach(() => restoreEnv(saved));

  it("defaults to free mode when PAY_TO is unset", () => {
    for (const k of ENV_KEYS) delete process.env[k];
    const cfg = loadPaymentConfig();
    expect(cfg.enabled).toBe(false);
    expect(cfg.network).toBe("eip155:42431");
    expect(cfg.priceDisplay).toContain("pathUSD");
    expect(cfg.rpcUrl).toContain("moderato.tempo.xyz");
  });

  it("enables when PAY_TO is set", () => {
    process.env.PAY_TO = "0x1234567890123456789012345678901234567890";
    const cfg = loadPaymentConfig();
    expect(cfg.enabled).toBe(true);
  });
});

describe("validatePaymentConfig", () => {
  it("flags missing PAY_TO", () => {
    const { missing } = validatePaymentConfig(loadPaymentConfig());
    expect(missing).toContain("PAY_TO");
  });

  it("warns on invalid PAY_TO format", () => {
    const cfg = loadPaymentConfig();
    const { warnings } = validatePaymentConfig({
      ...cfg,
      payTo: "not-an-address",
      enabled: true,
    });
    expect(warnings.some((w) => w.includes("PAY_TO"))).toBe(true);
  });
});

describe("buildPaymentStatus", () => {
  it("reports free mode by default", () => {
    const status = buildPaymentStatus(loadPaymentConfig());
    expect(status.mode).toBe("free");
    expect(status.enabled).toBe(false);
    expect(status.scheme).toBe("tempo-tip20");
  });
});

describe("buildPaymentDiscovery", () => {
  it("returns free pricing when disabled", () => {
    const discovery = buildPaymentDiscovery(loadPaymentConfig());
    expect(discovery.enabled).toBe(false);
    expect(discovery.amount).toBe("free");
  });

  it("includes tempo-tip20 fields when enabled", () => {
    const cfg = loadPaymentConfig();
    const discovery = buildPaymentDiscovery({
      ...cfg,
      enabled: true,
      payTo: "0x1234567890123456789012345678901234567890",
    });
    expect(discovery.enabled).toBe(true);
    expect(discovery.payTo).toMatch(/^0x/);
    expect(discovery.scheme).toBe("tempo-tip20");
    expect(discovery.paymentHeader).toBe("X-Payment");
  });
});

describe("checkRpcReachable", () => {
  it("returns false when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { checkRpcReachable } = await import("../src/http/payments.js");
    await expect(checkRpcReachable("https://offline.example.com")).resolves.toBe(false);
    vi.unstubAllGlobals();
  });
});
