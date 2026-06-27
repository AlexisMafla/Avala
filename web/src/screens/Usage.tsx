import { useCallback, useEffect, useState } from "react";
import { API_BASE, fetchUsageStats, pingHealth, type UsageStats } from "../api";
import { CopyCode } from "../components/CopyCode";
import { Card, LiveBadge, Pill, PrimaryButton } from "../components/ui";
import { useI18n } from "../i18n";

function formatTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

function shortHash(hash: string): string {
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash;
}

function shortAddr(addr?: string): string {
  if (!addr) return "—";
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function activitySpan(first: number | null, last: number | null, labels: { min: string; h: string; d: string }): string {
  if (!first || !last) return "—";
  const mins = Math.round((last - first) / 60_000);
  if (mins < 60) return `${mins} ${labels.min}`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs} ${labels.h}`;
  return `${Math.round(hrs / 24)} ${labels.d}`;
}

export function UsageScreen() {
  const { t } = useI18n();
  const u = t.usage;
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; ms: number } | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStatsError(false);
      const data = await fetchUsageStats();
      setStats(data);
    } catch {
      setStatsError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    const id = setInterval(loadStats, 10_000);
    return () => clearInterval(id);
  }, [loadStats]);

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const { ok, latencyMs } = await pingHealth();
      setTestResult({ ok, ms: latencyMs });
    } catch {
      setTestResult({ ok: false, ms: 0 });
    } finally {
      setTesting(false);
    }
  }

  const curlCmd = `curl -X GET ${API_BASE}/healthz`;
  const endpoints = Object.entries(stats?.byEndpoint ?? {}).sort((a, b) => b[1] - a[1]);
  const maxEndpoint = endpoints.length > 0 ? Math.max(...endpoints.map(([, n]) => n)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{u.title}</h1>
          <p className="text-sm leading-relaxed text-ink-2">{u.subtitle}</p>
        </div>
        <LiveBadge label={t.common.live} />
      </header>

      {stats && !stats.enabled && (
        <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3">
          <p className="text-xs leading-relaxed text-ink-2">{u.freeModeNote}</p>
        </div>
      )}

      {statsError && (
        <div className="rounded-xl border border-bad/30 bg-bad/5 px-4 py-3">
          <p className="text-xs leading-relaxed text-bad">{u.loadError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-ink">
            {loading ? "…" : (stats?.totalCalls ?? 0)}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-3">{u.paidCallsSub}</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-mint">
            {loading ? "…" : (stats?.totalRevenue ?? "0")}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-3">{u.revenueSub}</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-ink">
            {loading ? "…" : (stats?.uniqueAgents ?? 0)}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-3">{u.agentsSub}</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-ink">
            {loading
              ? "…"
              : activitySpan(stats?.firstAt ?? null, stats?.lastAt ?? null, u.spanUnits)}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-3">{u.activitySub}</p>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">{u.endpoints}</h2>
        <Card className="p-5">
          {endpoints.length === 0 ? (
            <p className="text-center text-sm text-ink-3">{u.emptyEndpoints}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {endpoints.map(([ep, count]) => (
                <div key={ep}>
                  <div className="mb-1 flex justify-between text-sm">
                    <code className="font-mono text-xs text-ink">{ep}</code>
                    <span className="text-ink-2">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-mint transition-all"
                      style={{ width: `${Math.round((count / maxEndpoint) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">{u.feed}</h2>
        <Card className="overflow-hidden">
          {(stats?.recent ?? []).length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-3">{u.emptyFeed}</p>
          ) : (
            <>
              <div className="hidden sm:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line/70 text-[10px] uppercase tracking-wider text-ink-3">
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        {u.feedCols.time}
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        {u.feedCols.endpoint}
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        {u.feedCols.agent}
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        {u.feedCols.amount}
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        {u.feedCols.tx}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats!.recent.map((row) => (
                      <tr key={`${row.ts}-${row.txHash}`} className="border-b border-line/40 last:border-0">
                        <td className="px-4 py-2.5 font-mono text-xs text-ink-2">{formatTime(row.ts)}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-ink">{row.endpoint}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-ink-2">{shortAddr(row.from)}</td>
                        <td className="px-4 py-2.5 font-mono text-xs font-semibold text-mint">{row.amount}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-ink-3">{shortHash(row.txHash)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col divide-y divide-line/40 sm:hidden">
                {stats!.recent.map((row) => (
                  <div key={`${row.ts}-${row.txHash}`} className="flex flex-col gap-1 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-ink-2">{formatTime(row.ts)}</span>
                      <Pill tone="mint">{row.amount}</Pill>
                    </div>
                    <span className="font-mono text-sm text-ink">{row.endpoint}</span>
                    <span className="font-mono text-xs text-ink-3">{shortAddr(row.from)} · {shortHash(row.txHash)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </section>

      <Card className="p-5">
        <h2 className="font-display text-sm font-semibold text-ink">{u.quickAction}</h2>
        <p className="mt-1 text-sm text-ink-2">{u.quickActionBody}</p>

        {testResult && (
          <p className={`mt-3 text-sm font-semibold ${testResult.ok ? "text-mint" : "text-bad"}`}>
            {testResult.ok ? u.testOk : u.testFail}
            {testResult.ok && ` · ${testResult.ms} ms`}
          </p>
        )}

        <PrimaryButton onClick={runTest} disabled={testing} className="mt-4 w-full">
          {testing ? u.testing : u.triggerTest}
        </PrimaryButton>

        <div className="mt-4">
          <CopyCode code={curlCmd} copyLabel={t.common.copy} copiedLabel={t.common.copied} />
        </div>
      </Card>
    </div>
  );
}
