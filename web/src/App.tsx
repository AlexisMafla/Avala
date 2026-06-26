import { useState } from "react";
import { LiveBadge } from "./components/ui";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import {
  ActivityIcon,
  CodeIcon,
  HomeIcon,
  ServerIcon,
  TagIcon,
} from "./components/icons";
import { useI18n } from "./i18n";
import { Home } from "./screens/Home";
import { ApiScreen } from "./screens/Api";
import { McpScreen } from "./screens/Mcp";
import { UsageScreen } from "./screens/Usage";
import { PricingScreen } from "./screens/Pricing";
import { LegalScreen, type LegalDoc } from "./screens/Legal";

type Tab = "home" | "api" | "mcp" | "usage" | "pricing";

const NAV: { id: Tab; icon: typeof HomeIcon; labelKey: Tab }[] = [
  { id: "home", icon: HomeIcon, labelKey: "home" },
  { id: "api", icon: CodeIcon, labelKey: "api" },
  { id: "mcp", icon: ServerIcon, labelKey: "mcp" },
  { id: "pricing", icon: TagIcon, labelKey: "pricing" },
  { id: "usage", icon: ActivityIcon, labelKey: "usage" },
];

function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2.5 4 6v6c0 4.6 3.2 7.9 8 9.5 4.8-1.6 8-4.9 8-9.5V6l-8-3.5Z"
          stroke="var(--color-mint)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="m8.5 12 2.5 2.5 5-5"
          stroke="var(--color-mint)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-lg font-bold tracking-[0.18em] text-ink">
        AVALA
      </span>
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
  const { t } = useI18n();

  function navigate(next: Tab) {
    setLegalDoc(null);
    setTab(next);
  }

  function openLegal(doc: LegalDoc) {
    setLegalDoc(doc);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="bg-grid min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col md:max-w-2xl lg:max-w-4xl">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line/70 bg-base/80 px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md">
          <BrandMark />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <LiveBadge label={t.common.live} />
          </div>
        </header>

        <main className="flex-1 px-5 pb-36 pt-6 md:px-8 lg:px-10" id="main-content">
          {legalDoc ? (
            <LegalScreen doc={legalDoc} onBack={() => setLegalDoc(null)} />
          ) : (
            <>
              {tab === "home" && <Home onNavigate={navigate} />}
              {tab === "api" && <ApiScreen />}
              {tab === "mcp" && <McpScreen />}
              {tab === "pricing" && <PricingScreen onNavigate={navigate} />}
              {tab === "usage" && <UsageScreen />}
            </>
          )}
        </main>

        <footer className="border-t border-line/50 px-5 py-3 text-center text-xs text-ink-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openLegal("terms")}
              className="transition hover:text-ink-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint"
            >
              {t.footer.terms}
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => openLegal("privacy")}
              className="transition hover:text-ink-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint"
            >
              {t.footer.privacy}
            </button>
          </div>
          <p className="mt-2">{t.home.footer}</p>
        </footer>

        {!legalDoc && (
          <nav
            aria-label="Main navigation"
            className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line/70 bg-base/90 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:max-w-2xl lg:max-w-4xl"
          >
            <div className="flex items-center justify-around" role="tablist">
              {NAV.map(({ id, icon: Icon, labelKey }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-current={active ? "page" : undefined}
                    onClick={() => navigate(id)}
                    className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint sm:text-[11px] ${
                      active ? "text-mint" : "text-ink-3 hover:text-ink-2"
                    }`}
                  >
                    <Icon className={active ? "scale-110 transition" : "transition"} aria-hidden="true" />
                    <span className="truncate">{t.nav[labelKey]}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export type { Tab };
