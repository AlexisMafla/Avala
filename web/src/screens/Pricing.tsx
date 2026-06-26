import { useEffect, useState } from "react";
import { API_BASE, fetchPaymentStatus, type PaymentStatus } from "../api";
import { CopyCode } from "../components/CopyCode";
import { Card, Pill, PrimaryButton } from "../components/ui";
import { useI18n } from "../i18n";
import type { Tab } from "../App";

export function PricingScreen({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { t } = useI18n();
  const p = t.pricing;
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const price = status?.pricePerCall ?? p.defaultPrice;
  const mode = status?.enabled ? p.paidMode : p.freeMode;

  const paymentExample = `X-Payment: 0x<txHash>:42431`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{p.title}</h1>
        <p className="text-sm leading-relaxed text-ink-2">{p.subtitle}</p>
      </header>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={status?.enabled ? "mint" : "warn"}>{loading ? "…" : mode}</Pill>
          <Pill tone="neutral">{p.scheme}</Pill>
        </div>
        <p className="mt-4 font-display text-4xl font-bold text-mint">{price}</p>
        <p className="mt-1 text-sm text-ink-2">{p.perCall}</p>
        {status?.network && (
          <p className="mt-3 font-mono text-xs text-ink-3">
            {p.network}: {status.network}
          </p>
        )}
      </Card>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">{p.howTitle}</h2>
        <ol className="flex flex-col gap-3">
          {p.steps.map((step, i) => (
            <Card key={step.title} className="p-4">
              <span className="font-mono text-xs font-bold text-mint">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-2">{step.body}</p>
            </Card>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">{p.endpointsTitle}</h2>
        <Card className="divide-y divide-line/50 overflow-hidden">
          {p.endpoints.map((ep) => (
            <div key={ep.path} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <code className="font-mono text-xs text-mint">{ep.path}</code>
              <span className="text-sm text-ink-2">{ep.label}</span>
            </div>
          ))}
        </Card>
      </section>

      <CopyCode
        title={p.headerTitle}
        code={paymentExample}
        copyLabel={t.common.copy}
        copiedLabel={t.common.copied}
      />

      <PrimaryButton onClick={() => onNavigate("api")} className="w-full">
        {p.tryApi}
      </PrimaryButton>

      <p className="text-center text-xs text-ink-3">
        {p.statusHint}{" "}
        <code className="text-ink-2">{API_BASE || ""}/payments/status</code>
      </p>
    </div>
  );
}
