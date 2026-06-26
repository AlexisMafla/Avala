import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { amountToMicros, microsToAmount, PaymentStore } from "../src/http/store.js";

describe("amount conversion", () => {
  it("parses human amounts into micro-units", () => {
    expect(amountToMicros("0.002")).toBe(2000n);
    expect(amountToMicros("1")).toBe(1_000_000n);
    expect(amountToMicros("1.5")).toBe(1_500_000n);
    expect(amountToMicros("0")).toBe(0n);
  });

  it("formats micro-units back to human amounts", () => {
    expect(microsToAmount(2000n)).toBe("0.002");
    expect(microsToAmount(1_000_000n)).toBe("1");
    expect(microsToAmount(1_500_000n)).toBe("1.5");
    expect(microsToAmount(0n)).toBe("0");
  });
});

describe("PaymentStore", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "avala-store-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("persists used tx hashes and survives a reload", () => {
    const store = new PaymentStore();
    store.init(dir);
    expect(store.persistent).toBe(true);

    store.usedTxSet.add("0xabc");
    expect(store.usedTxSet.has("0xabc")).toBe(true);

    const reloaded = new PaymentStore();
    reloaded.init(dir);
    expect(reloaded.usedTxSet.has("0xabc")).toBe(true);
  });

  it("records payment events and aggregates stats", () => {
    const store = new PaymentStore();
    store.init(dir);

    store.recordPayment({ ts: 1, endpoint: "POST /v1/validate-tax-id", from: "0xAAA", amount: "0.002", txHash: "0x1" });
    store.recordPayment({ ts: 2, endpoint: "POST /v1/validate-tax-id", from: "0xaaa", amount: "0.002", txHash: "0x2" });
    store.recordPayment({ ts: 3, endpoint: "POST /v1/validate-iban", from: "0xBBB", amount: "0.002", txHash: "0x3" });

    const reloaded = new PaymentStore();
    reloaded.init(dir);
    expect(reloaded.getStats(true).totalCalls).toBe(3);

    const stats = store.getStats(true);
    expect(stats.totalCalls).toBe(3);
    expect(stats.totalRevenue).toBe("0.006");
    expect(stats.uniqueAgents).toBe(2);
    expect(stats.byEndpoint["POST /v1/validate-tax-id"]).toBe(2);
    expect(stats.firstAt).toBe(1);
    expect(stats.lastAt).toBe(3);
    expect(stats.recent[0].txHash).toBe("0x3");
  });
});
