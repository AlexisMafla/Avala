import type { Tab } from "../App";
import { useI18n } from "../i18n";
import {
  Card,
  GhostButton,
  IconBadge,
  Pill,
  PrimaryButton,
  SectionLabel,
} from "../components/ui";
import {
  ArrowRightIcon,
  BoltIcon,
  GaugeIcon,
  GlobeIcon,
  ServerIcon,
  ShieldIcon,
} from "../components/icons";

export function Home({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { t } = useI18n();
  const h = t.home;

  const features = [
    { icon: BoltIcon, ...h.features.payments },
    { icon: GaugeIcon, ...h.features.speed },
    { icon: GlobeIcon, ...h.features.multi },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-5 pt-6 text-center">
        <Pill tone="mint">{h.badge}</Pill>
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink">
          {h.titleA} <span className="text-mint">{h.titleHighlight}</span>
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-ink-2">{h.subtitle}</p>
        <div className="mt-2 flex w-full flex-col gap-3">
          <PrimaryButton onClick={() => onNavigate("api")} className="w-full">
            {h.exploreApi}
            <ArrowRightIcon width={18} height={18} />
          </PrimaryButton>
          <GhostButton onClick={() => onNavigate("mcp")} className="w-full">
            <ServerIcon width={18} height={18} />
            {h.getMcp}
          </GhostButton>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        {features.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="p-5">
            <IconBadge tone="mint">
              <Icon width={20} height={20} />
            </IconBadge>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{body}</p>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <SectionLabel>{h.network}</SectionLabel>
        <Card className="overflow-hidden p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <IconBadge tone="iris">
              <ShieldIcon width={20} height={20} />
            </IconBadge>
            <h3 className="mt-2 font-display text-xl font-semibold text-ink">{h.node.title}</h3>
            <p className="max-w-xs text-sm leading-relaxed text-ink-2">{h.node.body}</p>
          </div>

          <NodeDiagram />

          <ul className="mt-6 flex flex-col gap-3">
            {h.node.points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-ink">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-mint/40 bg-mint/10 text-mint">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m5 13 4 4 10-10"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <footer className="border-t border-line/60 pt-5 text-center text-xs text-ink-3">
        {h.footer}
      </footer>
    </div>
  );
}

function NodeDiagram() {
  return (
    <div className="mt-6 rounded-xl border border-line/70 bg-base/60 p-6">
      <svg viewBox="0 0 280 130" className="h-auto w-full" fill="none">
        <line x1="60" y1="100" x2="140" y2="45" stroke="var(--color-line)" strokeWidth="1.5" />
        <line x1="220" y1="100" x2="140" y2="45" stroke="var(--color-line)" strokeWidth="1.5" />
        <line x1="60" y1="100" x2="220" y2="100" stroke="var(--color-line)" strokeWidth="1.5" />

        <g>
          <circle cx="140" cy="45" r="22" fill="color-mix(in srgb, var(--color-mint) 12%, transparent)" stroke="var(--color-mint)" strokeWidth="1.5" />
          <path d="m132 45 5 5 11-11" stroke="var(--color-mint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <NodeDot cx={60} cy={100} />
        <NodeDot cx={220} cy={100} />
      </svg>
    </div>
  );
}

function NodeDot({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="16" fill="var(--color-surface-2)" stroke="var(--color-line)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="3.5" fill="var(--color-ink-3)" />
    </g>
  );
}
