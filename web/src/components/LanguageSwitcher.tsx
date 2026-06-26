import { useI18n } from "../i18n";
import { LANGS } from "../i18n/translations";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-surface-2/60 p-0.5">
      {LANGS.map(({ code, label, name }) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            title={name}
            aria-pressed={active}
            onClick={() => setLang(code)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition ${
              active ? "bg-mint/15 text-mint" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
