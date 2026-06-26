export const API_BASE =
  import.meta.env.VITE_API_BASE !== undefined
    ? import.meta.env.VITE_API_BASE
    : "http://localhost:8787";

export type Country = "ES" | "CO" | "AR";
export type Tool = "validate_tax_id" | "validate_bank_account" | "validate_iban";

export interface ValidationResult {
  valid: boolean;
  normalized?: string;
  reason?: string;
  details?: Record<string, unknown>;
}

export interface ServiceCatalog {
  name: string;
  version: string;
  pricing: { model: string; amount: string };
  tools: { name: string; title: string; description: string; endpoint: string }[];
  mcp: { transport: string; url: string; tools: string[] };
}

export async function fetchCatalog(): Promise<ServiceCatalog> {
  const res = await fetch(`${API_BASE}/services.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ServiceCatalog>;
}

export async function pingHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const started = performance.now();
  const res = await fetch(`${API_BASE}/healthz`);
  const latencyMs = Math.round(performance.now() - started);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { ok: boolean };
  return { ok: data.ok, latencyMs };
}

export interface PaymentStatus {
  enabled: boolean;
  mode: "paid" | "free";
  ready: boolean;
  pricePerCall: string;
  network: string;
  payTo?: string;
  warnings: string[];
  missing: string[];
}

export class PaymentRequiredError extends Error {
  readonly status = 402;
  readonly body: unknown;

  constructor(body: unknown) {
    super("payment_required");
    this.name = "PaymentRequiredError";
    this.body = body;
  }
}

export async function fetchPaymentStatus(): Promise<PaymentStatus> {
  const res = await fetch(`${API_BASE}/payments/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<PaymentStatus>;
}

export async function validate(
  tool: Tool,
  body: Record<string, unknown>,
): Promise<ValidationResult> {
  const path = `/v1/${tool.replace(/_/g, "-")}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 402) {
    const challenge = await res.json().catch(() => ({}));
    throw new PaymentRequiredError(challenge);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err === "object" && err && "message" in err
        ? String((err as { message: string }).message)
        : `HTTP ${res.status}`,
    );
  }

  return res.json() as Promise<ValidationResult>;
}
