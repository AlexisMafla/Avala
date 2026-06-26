import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useI18n } from "../i18n";
import { API_BASE, PaymentRequiredError, fetchPaymentStatus, validate, type Country, type PaymentStatus, type Tool, type ValidationResult } from "../api";
import { Card, Pill, PrimaryButton } from "../components/ui";
import { Flag } from "../components/Flags";
import { ArrowRightIcon, CopyIcon } from "../components/icons";

const TOOL_PATH: Record<Tool, string> = {
  validate_tax_id: "/v1/validate-tax-id",
  validate_bank_account: "/v1/validate-bank-account",
  validate_iban: "/v1/validate-iban",
};

const TYPE_OPTIONS: Record<Country, string[]> = {
  ES: ["dni", "nie", "cif"],
  CO: ["nit", "cedula"],
  AR: ["cuit", "dni"],
};

const EXAMPLES: Record<Tool, { label: string; country?: Country; type?: string; value: string }[]> = {
  validate_tax_id: [
    { label: "DNI · ES", country: "ES", value: "12345678Z" },
    { label: "CIF · ES", country: "ES", type: "cif", value: "A58818501" },
    { label: "NIT · CO", country: "CO", value: "830084433-7" },
    { label: "CUIT · AR", country: "AR", value: "20-12345678-6" },
  ],
  validate_bank_account: [
    { label: "IBAN · ES", country: "ES", value: "ES9121000418450200051332" },
    { label: "CBU · AR", country: "AR", value: "0070099300000041534001" },
  ],
  validate_iban: [
    { label: "ES", value: "ES9121000418450200051332" },
    { label: "GB", value: "GB82WEST12345698765432" },
  ],
};

export function ApiScreen() {
  const { t } = useI18n();
  const a = t.api;

  const [tool, setTool] = useState<Tool>("validate_tax_id");
  const [country, setCountry] = useState<Country>("ES");
  const [type, setType] = useState("");
  const [value, setValue] = useState("12345678Z");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [paymentChallenge, setPaymentChallenge] = useState<unknown>(null);
  const [copied, setCopied] = useState(false);

  const showCountry = tool !== "validate_iban";
  const showType = tool === "validate_tax_id";
  const countries: Country[] = tool === "validate_bank_account" ? ["ES", "AR"] : ["ES", "CO", "AR"];

  const tools: { id: Tool; label: string }[] = [
    { id: "validate_tax_id", label: a.toolTax },
    { id: "validate_bank_account", label: a.toolBank },
    { id: "validate_iban", label: a.toolIban },
  ];

  const requestBody = useMemo(() => {
    const body: Record<string, unknown> = { value };
    if (showCountry) body.country = country;
    if (showType && type) body.type = type;
    return body;
  }, [value, country, type, showCountry, showType]);

  const rulesText = useMemo(() => {
    if (tool === "validate_iban") return a.rules.iban;
    if (tool === "validate_bank_account") return country === "AR" ? a.rules.arBank : a.rules.esBank;
    if (country === "CO") return a.rules.coTax;
    if (country === "AR") return a.rules.arTax;
    return a.rules.esTax;
  }, [tool, country, a]);

  useEffect(() => {
    let active = true;
    fetchPaymentStatus()
      .then((s) => {
        if (!active) return;
        setPaymentStatus(s);
        setPrice(s.pricePerCall);
      })
      .catch(() => {
        fetch(`${API_BASE}/services.json`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (active && data?.pricing?.amount) setPrice(String(data.pricing.amount));
          })
          .catch(() => {});
      });
    return () => {
      active = false;
    };
  }, []);

  function selectTool(next: Tool) {
    setTool(next);
    setResult(null);
    setError(null);
    setPaymentChallenge(null);
    setLatency(null);
    if (next === "validate_bank_account" && country === "CO") setCountry("ES");
  }

  function applyExample(ex: (typeof EXAMPLES)[Tool][number]) {
    if (ex.country) setCountry(ex.country);
    setType(ex.type ?? "");
    setValue(ex.value);
    setResult(null);
    setError(null);
    setPaymentChallenge(null);
  }

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    setPaymentChallenge(null);
    const started = performance.now();
    try {
      const data = await validate(tool, requestBody);
      setLatency(Math.round(performance.now() - started));
      setResult(data);
    } catch (e) {
      setLatency(Math.round(performance.now() - started));
      if (e instanceof PaymentRequiredError) {
        setPaymentChallenge(e.body);
        setError(a.paymentRequired);
      } else {
        setError(e instanceof Error ? e.message : "Validation failed");
      }
    } finally {
      setLoading(false);
    }
  }

  function copyResponse() {
    const text = JSON.stringify(paymentChallenge ?? result ?? error ?? {}, null, 2);
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  const unitCost = price ?? a.free;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{a.title}</h1>
        <p className="text-sm leading-relaxed text-ink-2">{a.subtitle}</p>
        <div className="flex flex-wrap gap-2">
          <Pill tone="neutral">Visa CLI</Pill>
          <Pill tone="neutral">Coinbase x402</Pill>
          <Pill tone="neutral">Tempo MPP</Pill>
          <Pill tone={paymentStatus?.enabled ? "mint" : "warn"}>
            {paymentStatus?.enabled ? a.paidMode : a.freeMode}
          </Pill>
        </div>
      </header>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-md bg-mint/15 px-2 py-1 font-mono text-[11px] font-bold text-mint">
            POST
          </span>
          <span className="font-mono text-xs text-ink-2">{TOOL_PATH[tool]}</span>
        </div>

        <Segmented options={tools} value={tool} onChange={selectTool} />

        {showCountry && (
          <div className="mt-4">
            <FieldLabel id="region-label">{a.region}</FieldLabel>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {countries.map((c) => {
                const active = country === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCountry(c);
                      setType("");
                      setResult(null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "border-mint/60 bg-mint/10 text-ink"
                        : "border-line bg-surface-2/50 text-ink-3 hover:border-ink-3"
                    }`}
                  >
                    <Flag country={c} />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showType && (
          <div className="mt-4">
            <FieldLabel>{a.type}</FieldLabel>
            <div className="flex flex-wrap gap-2">
              <TypeChip label={a.typeAuto} active={type === ""} onClick={() => setType("")} />
              {TYPE_OPTIONS[country].map((opt) => (
                <TypeChip
                  key={opt}
                  label={opt.toUpperCase()}
                  active={type === opt}
                  onClick={() => setType(opt)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <FieldLabel id="value-label">{a.value}</FieldLabel>
          <input
            id="validate-value"
            aria-labelledby="value-label"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={a.valuePlaceholder}
            className="w-full rounded-xl border border-line bg-base/60 px-3 py-3 font-mono text-sm text-ink outline-none transition focus:border-mint/60 focus-visible:ring-2 focus-visible:ring-mint/30"
          />
        </div>

        <div className="mt-4">
          <FieldLabel>{a.examples}</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES[tool].map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => applyExample(ex)}
                className="rounded-full border border-line px-3 py-1 font-mono text-xs text-ink-2 transition hover:border-mint/50 hover:text-mint"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="rounded-xl border border-line/70 bg-surface-2/40 px-4 py-3">
        <FieldLabel>{a.rulesEngine}</FieldLabel>
        <p className="font-mono text-xs leading-relaxed text-ink-2">{rulesText}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <span className="text-[11px] uppercase tracking-wider text-ink-3">{a.unitCost}</span>
          <p className="mt-1 font-display text-lg font-bold text-mint">{unitCost}</p>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] uppercase tracking-wider text-ink-3">{a.latency}</span>
          <p className="mt-1 font-display text-lg font-bold text-ink">
            {latency === null ? "—" : `${latency} ms`}
          </p>
        </Card>
      </div>

      <PrimaryButton onClick={run} disabled={loading || !value.trim()} className="w-full">
        {loading ? a.executing : a.execute}
        {!loading && <ArrowRightIcon width={18} height={18} />}
      </PrimaryButton>

      <JsonBlock title={a.request} data={requestBody} />

      {error && (
        <div className="rounded-xl border border-warn/40 bg-warn/5 p-4" role="alert" aria-live="polite">
          <p className="font-semibold text-warn">{error}</p>
          {paymentChallenge !== null && (
            <p className="mt-2 text-sm text-ink-2">{a.paymentRequiredBody}</p>
          )}
        </div>
      )}

      <ResponseBlock
        title={a.response}
        result={result}
        error={error}
        paymentChallenge={paymentChallenge}
        labels={{ valid: a.valid, invalid: a.invalid, normalized: a.normalized, awaiting: a.awaiting }}
        onCopy={copyResponse}
        copied={copied}
        copyLabel={copied ? a.copied : a.copy}
        ariaLive={result || paymentChallenge ? "polite" : undefined}
      />
    </div>
  );
}

function FieldLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <span
      id={id}
      className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-ink-3"
    >
      {children}
    </span>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: Tool; label: string }[];
  value: Tool;
  onChange: (id: Tool) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 rounded-xl border border-line bg-base/50 p-1 sm:grid-cols-3">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-lg px-2 py-2 text-center text-xs font-semibold transition ${
              active ? "bg-mint/15 text-mint" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function TypeChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? "border-mint/60 bg-mint/10 text-mint" : "border-line text-ink-3 hover:border-ink-3"
      }`}
    >
      {label}
    </button>
  );
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-base/60">
      <div className="border-b border-line/70 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-3">
        {title}
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-ink-2">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function ResponseBlock({
  title,
  result,
  error,
  paymentChallenge,
  labels,
  onCopy,
  copied,
  copyLabel,
  ariaLive,
}: {
  title: string;
  result: ValidationResult | null;
  error: string | null;
  paymentChallenge?: unknown;
  labels: { valid: string; invalid: string; normalized: string; awaiting: string };
  onCopy: () => void;
  copied: boolean;
  copyLabel: string;
  ariaLive?: "polite" | "assertive";
}) {
  const payload = paymentChallenge ?? (error ? { error } : result);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-base/60" aria-live={ariaLive}>
      <div className="flex items-center justify-between border-b border-line/70 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-3">{title}</span>
        {payload && (
          <button
            type="button"
            onClick={onCopy}
            aria-label={copyLabel}
            className={`inline-flex items-center gap-1.5 font-mono text-[11px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint ${
              copied ? "text-mint" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            <CopyIcon width={13} height={13} />
            {copyLabel}
          </button>
        )}
      </div>

      {result && (
        <div className="flex items-center gap-3 border-b border-line/70 px-4 py-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              result.valid ? "bg-mint/15 text-mint" : "bg-bad/15 text-bad"
            }`}
          >
            {result.valid ? labels.valid : labels.invalid}
          </span>
          {result.normalized && (
            <code className="font-mono text-sm text-mint">{result.normalized}</code>
          )}
          {result.reason && <code className="font-mono text-xs text-ink-3">{result.reason}</code>}
        </div>
      )}

      {payload ? (
        <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-ink-2">
          {JSON.stringify(payload, null, 2)}
        </pre>
      ) : (
        <p className="px-4 py-6 text-center text-sm text-ink-3">{labels.awaiting}</p>
      )}
    </div>
  );
}
