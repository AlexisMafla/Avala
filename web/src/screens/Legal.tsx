import { Card } from "../components/ui";
import { useI18n } from "../i18n";

export type LegalDoc = "terms" | "privacy";

export function LegalScreen({ doc, onBack }: { doc: LegalDoc; onBack: () => void }) {
  const { t } = useI18n();
  const content = doc === "terms" ? t.legal.terms : t.legal.privacy;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm font-medium text-mint transition hover:text-mint-strong"
        >
          ← {t.legal.back}
        </button>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{content.title}</h1>
        <p className="text-xs text-ink-3">{content.updated}</p>
      </header>

      <Card className="flex flex-col gap-4 p-5">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-sm font-semibold text-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{section.body}</p>
          </section>
        ))}
      </Card>
    </div>
  );
}
