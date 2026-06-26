import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** A single verified paid call, recorded for usage/revenue metrics. */
export interface PaymentEvent {
  ts: number;
  endpoint: string;
  from?: string;
  /** Human-readable amount (e.g. "0.002"). */
  amount: string;
  txHash: string;
}

export interface UsageStats {
  enabled: boolean;
  persistent: boolean;
  totalCalls: number;
  totalRevenue: string;
  uniqueAgents: number;
  byEndpoint: Record<string, number>;
  firstAt: number | null;
  lastAt: number | null;
  recent: PaymentEvent[];
}

const RECENT_LIMIT = 25;

/**
 * Durable payment store.
 *
 * Persists used transaction hashes (replay protection) and paid-call events
 * (usage metrics) to append-only logs under DATA_DIR, surviving restarts and
 * redeploys when DATA_DIR points at a mounted volume. Falls back to in-memory
 * only when no writable directory is available (dev / ephemeral).
 */
export class PaymentStore {
  private dataDir: string | null = null;
  private usedTxFile = "";
  private eventsFile = "";

  private readonly agents = new Set<string>();
  private readonly events: PaymentEvent[] = [];
  private readonly endpointCounts: Record<string, number> = {};
  private totalCalls = 0;
  private revenueMicros = 0n;

  /** Set passed to the paywall middleware; persists each new hash on add(). */
  readonly usedTxSet: Set<string>;

  constructor() {
    const self = this;
    this.usedTxSet = new (class extends Set<string> {
      add(hash: string): this {
        if (!this.has(hash)) {
          super.add(hash);
          self.persistUsedTx(hash);
        }
        return this;
      }
    })();
  }

  get persistent(): boolean {
    return this.dataDir !== null;
  }

  /** Load durable state from disk (idempotent). */
  init(dataDir = process.env.DATA_DIR): void {
    const dir = dataDir?.trim() || join(process.cwd(), ".data");
    try {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      this.usedTxFile = join(dir, "used-tx.log");
      this.eventsFile = join(dir, "payments.log");
      this.loadUsedTx();
      this.loadEvents();
      this.dataDir = dir;
      console.log(`[avala] payment store: persistent at ${dir} (${this.usedTxSet.size} tx, ${this.totalCalls} calls)`);
    } catch (err) {
      this.dataDir = null;
      console.warn(`[avala] payment store: in-memory only (${(err as Error).message})`);
    }
  }

  private loadUsedTx(): void {
    if (!existsSync(this.usedTxFile)) return;
    for (const line of readFileSync(this.usedTxFile, "utf8").split("\n")) {
      const hash = line.trim();
      if (hash) Set.prototype.add.call(this.usedTxSet, hash);
    }
  }

  private loadEvents(): void {
    if (!existsSync(this.eventsFile)) return;
    for (const line of readFileSync(this.eventsFile, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        this.applyEvent(JSON.parse(trimmed) as PaymentEvent, false);
      } catch {
        /* skip malformed line */
      }
    }
  }

  private persistUsedTx(hash: string): void {
    if (!this.dataDir) return;
    try {
      appendFileSync(this.usedTxFile, `${hash}\n`);
    } catch (err) {
      console.warn(`[avala] payment store: failed to persist tx (${(err as Error).message})`);
    }
  }

  /** Record a verified paid call (called from the paywall onPayment hook). */
  recordPayment(event: PaymentEvent): void {
    this.applyEvent(event, true);
  }

  private applyEvent(event: PaymentEvent, persist: boolean): void {
    this.totalCalls += 1;
    this.byEndpointInc(event.endpoint);
    if (event.from) this.agents.add(event.from.toLowerCase());
    this.revenueMicros += amountToMicros(event.amount);

    this.events.push(event);
    if (this.events.length > RECENT_LIMIT) this.events.shift();

    if (persist && this.dataDir) {
      try {
        appendFileSync(this.eventsFile, `${JSON.stringify(event)}\n`);
      } catch (err) {
        console.warn(`[avala] payment store: failed to persist event (${(err as Error).message})`);
      }
    }
  }

  private byEndpointInc(endpoint: string): void {
    this.endpointCounts[endpoint] = (this.endpointCounts[endpoint] ?? 0) + 1;
  }

  getStats(enabled: boolean): UsageStats {
    const sorted = [...this.events].sort((a, b) => a.ts - b.ts);
    return {
      enabled,
      persistent: this.persistent,
      totalCalls: this.totalCalls,
      totalRevenue: microsToAmount(this.revenueMicros),
      uniqueAgents: this.agents.size,
      byEndpoint: { ...this.endpointCounts },
      firstAt: sorted[0]?.ts ?? null,
      lastAt: sorted[sorted.length - 1]?.ts ?? null,
      recent: [...this.events].sort((a, b) => b.ts - a.ts),
    };
  }
}

/** Parse a human amount like "0.002" into integer micro-units (1e-6). */
function amountToMicros(amount: string): bigint {
  const [whole, frac = ""] = amount.split(".");
  const fracPadded = (frac + "000000").slice(0, 6);
  try {
    return BigInt(whole || "0") * 1_000_000n + BigInt(fracPadded || "0");
  } catch {
    return 0n;
  }
}

function microsToAmount(micros: bigint): string {
  const whole = micros / 1_000_000n;
  const frac = (micros % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : `${whole}`;
}

export const paymentStore = new PaymentStore();
export { amountToMicros, microsToAmount };
