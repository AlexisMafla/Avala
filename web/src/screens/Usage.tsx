import { useState } from "react";
import { API_BASE, pingHealth } from "../api";
import { CopyCode } from "../components/CopyCode";
import { Card, LiveBadge, Pill, PrimaryButton } from "../components/ui";
import { useI18n } from "../i18n";

const CHART_POINTS = [12, 18, 15, 22, 28, 35, 42, 38, 45, 52, 48, 55, 62, 58, 70, 65, 72, 68, 75, 80, 78, 85, 82, 90];

const FEED = [
  { time: "22:14:02", region: "EU-C-1", type: "fiscal" as const },
  { time: "22:13:58", region: "US-W-2", type: "bank" as const },
  { time: "22:13:51", region: "LATAM-1", type: "fiscal" as const },
  { time: "22:13:44", region: "EU-C-1", type: "bank" as const },
  { time: "22:13:39", region: "APAC-E", type: "fiscal" as const },
];

const CLUSTERS = [
  { id: "AV-MAIN-01", load: 12.8, latency: 12 },
  { id: "AV-EURO-02", load: 42.1, latency: 42 },
  { id: "AV-LATAM-03", load: 83.4, latency: 118 },
];

export function UsageScreen() {
  const { t } = useI18n();
  const u = t.usage;
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; ms: number } | null>(null);

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

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{u.title}</h1>
          <p className="text-sm leading-relaxed text-ink-2">{u.subtitle}</p>
        </div>
        <LiveBadge label={t.common.live} />
      </header>

      <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <Pill tone="warn">{t.common.demoData}</Pill>
        </div>
        <p className="text-xs leading-relaxed text-ink-2">{u.demoNote}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-ink">{u.throughput}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-3">{u.throughputSub}</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-mint">{u.revenue}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-3">{u.revenueSub}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display text-sm font-semibold text-ink">{u.activity}</h2>
        <p className="mb-4 text-xs text-ink-3">{u.activitySub}</p>
        <ActivityChart points={CHART_POINTS} />
        <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-3">
          <span>00:00</span>
          <span>23:59</span>
        </div>
      </Card>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">{u.feed}</h2>
        <Card className="overflow-hidden">
          <div className="hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line/70 text-[10px] uppercase tracking-wider text-ink-3">
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    {u.feedCols.time}
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    {u.feedCols.region}
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    {u.feedCols.type}
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEED.map((row) => (
                  <tr key={row.time + row.region} className="border-b border-line/40 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-2">{row.time}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink">{row.region}</td>
                    <td className="px-4 py-2.5">
                      <TypeBadge
                        label={row.type === "bank" ? u.types.bank : u.types.fiscal}
                        kind={row.type}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col divide-y divide-line/40 sm:hidden">
            {FEED.map((row) => (
              <div key={row.time + row.region} className="flex flex-col gap-1 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-2">{row.time}</span>
                  <TypeBadge
                    label={row.type === "bank" ? u.types.bank : u.types.fiscal}
                    kind={row.type}
                  />
                </div>
                <span className="font-mono text-sm text-ink">{row.region}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-disabled="true"
            className="w-full border-t border-line/70 py-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-3"
          >
            {u.viewLog}
          </button>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">{u.clusters}</h2>
        <div className="flex flex-col gap-3">
          {CLUSTERS.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <code className="font-mono text-sm font-semibold text-ink">{c.id}</code>
                <Pill tone="mint">{u.stable}</Pill>
              </div>
              <div className="mb-1 flex justify-between text-[11px] text-ink-3">
                <span>{u.clusterCols.load}</span>
                <span>
                  {c.load}% · {u.clusterCols.latency} {c.latency}ms
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-mint transition-all"
                  style={{ width: `${c.load}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card className="p-5">
        <h2 className="font-display text-sm font-semibold text-ink">{u.quickAction}</h2>
        <p className="mt-1 text-sm text-ink-2">{u.quickActionBody}</p>

        {testResult && (
          <p
            className={`mt-3 text-sm font-semibold ${testResult.ok ? "text-mint" : "text-bad"}`}
          >
            {testResult.ok ? u.testOk : u.testFail}
            {testResult.ok && ` · ${testResult.ms} ms`}
          </p>
        )}

        <PrimaryButton
          onClick={runTest}
          disabled={testing}
          className="mt-4 w-full"
        >
          {testing ? u.testing : u.triggerTest}
        </PrimaryButton>

        <div className="mt-4">
          <CopyCode
            code={curlCmd}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
          />
        </div>
      </Card>
    </div>
  );
}

function ActivityChart({ points }: { points: number[] }) {
  const w = 320;
  const h = 80;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });

  const polyline = coords.join(" ");
  const area = `0,${h} ${polyline} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" preserveAspectRatio="none">
      <polygon points={area} fill="color-mix(in srgb, var(--color-mint) 12%, transparent)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="var(--color-mint)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TypeBadge({ label, kind }: { label: string; kind: "bank" | "fiscal" }) {
  const cls =
    kind === "bank"
      ? "border-mint/40 bg-mint/10 text-mint"
      : "border-iris/40 bg-iris/10 text-iris-soft";
  return (
    <span className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] font-bold ${cls}`}>
      {label}
    </span>
  );
}
