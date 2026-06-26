import { paywall } from "@tempo-agentgate/middleware";
import type { Address } from "viem";
import type { Hono, MiddlewareHandler } from "hono";
import { TOOLS } from "../tools/definitions.js";

const DEFAULT_NETWORK = "eip155:42431";
const DEFAULT_ASSET = "0x20c0000000000000000000000000000000000000";
const DEFAULT_RPC = "https://rpc.moderato.tempo.xyz";

/** Shared replay-protection set across REST and MCP paywalls. */
const usedTxHashes = new Set<string>();

export interface PaymentConfig {
  payTo?: string;
  network: string;
  facilitatorUrl?: string;
  asset: string;
  assetDecimals: number;
  priceAtomic: string;
  enabled: boolean;
  /** Human-readable price for metadata endpoints. */
  priceDisplay: string;
  rpcUrl: string;
}

/** Public payment status (safe to expose via API). */
export interface PaymentStatus {
  enabled: boolean;
  mode: "paid" | "free";
  ready: boolean;
  pricePerCall: string;
  priceAtomic: string;
  network: string;
  asset: string;
  assetDecimals: number;
  payTo?: string;
  scheme: "tempo-tip20";
  paymentHeader: "X-Payment";
  paymentHeaderFormat: "txHash:chainId";
  warnings: string[];
  missing: string[];
}

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function loadPaymentConfig(): PaymentConfig {
  const payTo = process.env.PAY_TO?.trim();
  const facilitatorUrl = process.env.X402_FACILITATOR_URL?.trim();
  const network = process.env.X402_NETWORK?.trim() || DEFAULT_NETWORK;
  const asset = process.env.X402_ASSET?.trim() || DEFAULT_ASSET;
  const assetDecimals = Number(process.env.X402_ASSET_DECIMALS ?? 6);
  const priceAtomic = process.env.PRICE_ATOMIC?.trim() || "2000";
  const rpcUrl = process.env.TEMPO_RPC_URL?.trim() || DEFAULT_RPC;

  return {
    payTo,
    network,
    facilitatorUrl,
    asset,
    assetDecimals,
    priceAtomic,
    rpcUrl,
    enabled: Boolean(payTo),
    priceDisplay: `${Number(priceAtomic) / 10 ** assetDecimals} pathUSD`,
  };
}

function humanPrice(config: PaymentConfig): string {
  return (Number(config.priceAtomic) / 10 ** config.assetDecimals).toString();
}

/** Validate env-based payment config; returns human-readable issues. */
export function validatePaymentConfig(config: PaymentConfig): { warnings: string[]; missing: string[] } {
  const warnings: string[] = [];
  const missing: string[] = [];

  if (!config.payTo) missing.push("PAY_TO");
  else if (!EVM_ADDRESS.test(config.payTo)) warnings.push("PAY_TO does not look like a valid EVM address (0x…)");

  if (config.facilitatorUrl) {
    warnings.push(
      "X402_FACILITATOR_URL is optional and unused — Avala verifies TIP-20 transfers on-chain via Tempo RPC.",
    );
  }

  const atomic = Number(config.priceAtomic);
  if (!Number.isFinite(atomic) || atomic <= 0) {
    warnings.push("PRICE_ATOMIC must be a positive integer");
  }

  if (!config.network.startsWith("eip155:")) {
    warnings.push("X402_NETWORK should use CAIP-2 format (eip155:42431)");
  }

  if (!EVM_ADDRESS.test(config.asset)) {
    warnings.push("X402_ASSET does not look like a valid token contract address");
  }

  try {
    new URL(config.rpcUrl);
  } catch {
    warnings.push("TEMPO_RPC_URL is not a valid URL");
  }

  return { warnings, missing };
}

export function buildPaymentStatus(config: PaymentConfig): PaymentStatus {
  const { warnings, missing } = validatePaymentConfig(config);
  const ready = config.enabled && missing.length === 0 && warnings.filter((w) => !w.includes("optional")).length === 0;

  return {
    enabled: config.enabled,
    mode: config.enabled ? "paid" : "free",
    ready,
    pricePerCall: config.priceDisplay,
    priceAtomic: config.priceAtomic,
    network: config.network,
    asset: config.asset,
    assetDecimals: config.assetDecimals,
    payTo: config.payTo,
    scheme: "tempo-tip20",
    paymentHeader: "X-Payment",
    paymentHeaderFormat: "txHash:chainId",
    warnings,
    missing,
  };
}

/** Payment discovery block for /services.json and agent directories. */
export function buildPaymentDiscovery(config: PaymentConfig) {
  const status = buildPaymentStatus(config);
  if (!status.enabled || !config.payTo) {
    return { enabled: false, model: "per-call", amount: "free" };
  }

  return {
    enabled: true,
    model: "per-call",
    amount: status.pricePerCall,
    scheme: status.scheme,
    network: status.network,
    asset: config.asset,
    priceAtomic: status.priceAtomic,
    payTo: config.payTo,
    assetDecimals: config.assetDecimals,
    paymentHeader: status.paymentHeader,
    paymentHeaderFormat: status.paymentHeaderFormat,
    rpcUrl: config.rpcUrl,
  };
}

/** Probe Tempo RPC reachability (best-effort). */
export async function checkRpcReachable(rpcUrl: string, timeoutMs = 8000): Promise<boolean> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_chainId", params: [], id: 1 }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { result?: string };
    return Boolean(data.result);
  } catch {
    return false;
  }
}

/** @deprecated Kept for scripts that still call it; delegates to RPC check. */
export async function checkFacilitatorReachable(facilitatorUrl: string, timeoutMs = 8000): Promise<boolean> {
  const base = facilitatorUrl.replace(/\/$/, "");
  const candidates = [`${base}/supported`, `${base}/health`, base];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok || res.status === 404) return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

function buildPaywallOptions(config: PaymentConfig, pricing: Record<string, { amount: string; description?: string }>) {
  return {
    recipientAddress: config.payTo as Address,
    token: "pathUSD" as const,
    pricing,
    usedTxHashes,
    rpcUrl: config.rpcUrl,
  };
}

function buildRestPricing(config: PaymentConfig): Record<string, { amount: string; description?: string }> {
  const amount = humanPrice(config);
  const pricing: Record<string, { amount: string; description?: string }> = {};

  for (const tool of TOOLS) {
    const path = `/v1/${tool.name.replace(/_/g, "-")}`;
    pricing[`POST ${path}`] = { amount, description: tool.description };
  }

  return pricing;
}

/** Apply Tempo TIP-20 payment gating to REST validation routes (/v1/*). */
export function registerRestPaymentGating(app: Hono, config: PaymentConfig): void {
  const status = buildPaymentStatus(config);

  if (!config.enabled || !config.payTo) {
    console.log("[avala] Payments DISABLED (free/dev mode). Set PAY_TO to enable.");
    if (status.missing.length > 0) {
      console.log(`[avala] Missing: ${status.missing.join(", ")}`);
    }
    return;
  }

  if (status.warnings.length > 0) {
    console.warn(`[avala] Payment config warnings: ${status.warnings.join("; ")}`);
  }

  app.use("/v1/*", paywall(buildPaywallOptions(config, buildRestPricing(config))));
  console.log(
    `[avala] Payments ENABLED (tempo-tip20) -> payTo=${config.payTo} network=${config.network} price=${config.priceDisplay}`,
  );
}

/** Paywall middleware scoped to a single path (used for MCP tool invocations). */
export function createPathPaymentMiddleware(
  config: PaymentConfig,
  path: string,
  description: string,
): MiddlewareHandler {
  if (!config.enabled || !config.payTo) {
    return async (_c, next) => next();
  }

  const amount = humanPrice(config);
  return paywall(
    buildPaywallOptions(config, {
      [`POST ${path}`]: { amount, description },
    }),
  );
}
