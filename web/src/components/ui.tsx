import type { ReactNode } from "react";

type Tone = "mint" | "iris" | "warn" | "neutral";

const toneClasses: Record<Tone, string> = {
  mint: "border-mint/40 text-mint bg-mint/10",
  iris: "border-iris/40 text-iris-soft bg-iris/10",
  warn: "border-warn/40 text-warn bg-warn/10",
  neutral: "border-line text-ink-2 bg-surface-2",
};

export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function LiveBadge({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/40 bg-mint/10 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-mint">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
      </span>
      {label}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface/80 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function IconBadge({
  children,
  tone = "mint",
}: {
  children: ReactNode;
  tone?: "mint" | "iris";
}) {
  const tones = {
    mint: "border-mint/30 bg-mint/10 text-mint",
    iris: "border-iris/30 bg-iris/10 text-iris-soft",
  };
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  value,
  label,
  tone = "ink",
}: {
  value: string;
  label: string;
  tone?: "ink" | "mint" | "iris";
}) {
  const valueTone = {
    ink: "text-ink",
    mint: "text-mint",
    iris: "text-iris-soft",
  }[tone];
  return (
    <div className="flex flex-col gap-1">
      <span className={`font-display text-3xl font-bold tracking-tight ${valueTone}`}>
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider text-ink-3">{label}</span>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">
      <span className="h-px w-6 bg-line" />
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-iris px-4 py-3 text-sm font-semibold text-white transition hover:bg-iris-soft disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2/60 px-4 py-3 text-sm font-semibold text-ink-2 transition hover:border-ink-3 hover:text-ink ${className}`}
    >
      {children}
    </button>
  );
}
