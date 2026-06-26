import { useEffect, useMemo, useState } from "react";
import { API_BASE, fetchCatalog } from "../api";
import { CopyCode } from "../components/CopyCode";
import { ServerIcon } from "../components/icons";
import { Card, IconBadge, Pill } from "../components/ui";
import { useI18n } from "../i18n";

const DEFAULT_TOOLS = ["validate_tax_id", "validate_bank_account", "validate_iban"];

export function McpScreen() {
  const { t } = useI18n();
  const m = t.mcp;
  const [tools, setTools] = useState<string[]>(DEFAULT_TOOLS);

  const mcpUrl = `${API_BASE}/mcp`;

  useEffect(() => {
    fetchCatalog()
      .then((c) => setTools(c.mcp.tools))
      .catch(() => {});
  }, []);

  const remoteConfig = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            avala: { url: mcpUrl },
          },
        },
        null,
        2,
      ),
    [mcpUrl],
  );

  const stdioConfig = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            avala: {
              command: "npx",
              args: ["tsx", "src/mcp/stdio.ts"],
              cwd: "/ruta/al/proyecto",
            },
          },
        },
        null,
        2,
      ),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Pill tone="iris">{m.badge}</Pill>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{m.title}</h1>
        <p className="text-sm leading-relaxed text-ink-2">{m.subtitle}</p>
      </header>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <IconBadge tone="iris">
            <ServerIcon width={20} height={20} />
          </IconBadge>
          <div>
            <h2 className="font-display text-sm font-semibold text-ink">{m.serverConfig}</h2>
            <p className="font-mono text-xs text-mint">{mcpUrl}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <CopyCode
            title={m.remoteUrl}
            code={remoteConfig}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
          />
          <CopyCode
            title={m.localStdio}
            code={stdioConfig}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
          />
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">{m.exposedTools}</h2>
        {tools.map((name) => (
          <ToolCard
            key={name}
            name={name}
            tag={m.toolTags[name] ?? "TOOL"}
            description={m.toolDesc[name] ?? name}
            readyLabel={m.ready}
          />
        ))}
      </section>

      <Card className="p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">{m.integrationGuide}</h2>
        <ol className="flex flex-col gap-4">
          {m.steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-mint/40 bg-mint/10 font-mono text-xs font-bold text-mint">
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                <p className="mt-0.5 text-sm text-ink-2">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-lg border border-line/70 bg-base/50 px-3 py-2 font-mono text-xs text-ink-3">
          {m.invokeHint}
        </p>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">{m.cliTitle}</h2>
        <p className="text-sm text-ink-2">{m.cliHint}</p>
        <CopyCode
          code="npm run mcp"
          copyLabel={t.common.copy}
          copiedLabel={t.common.copied}
        />
      </section>
    </div>
  );
}

function ToolCard({
  name,
  tag,
  description,
  readyLabel,
}: {
  name: string;
  tag: string;
  description: string;
  readyLabel: string;
}) {
  return (
    <Card className="flex items-start gap-4 p-4">
      <IconBadge tone="mint">
        <span className="font-mono text-[10px] font-bold">{tag}</span>
      </IconBadge>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <code className="font-mono text-sm font-semibold text-ink">{name}</code>
          <Pill tone="mint" className="shrink-0">
            {readyLabel}
          </Pill>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">{description}</p>
      </div>
    </Card>
  );
}
