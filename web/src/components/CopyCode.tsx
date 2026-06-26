import { useState } from "react";
import { CopyIcon } from "./icons";

export function CopyCode({
  title,
  code,
  copyLabel,
  copiedLabel,
}: {
  title?: string;
  code: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-base/60">
      {title && (
        <div className="flex items-center justify-between border-b border-line/70 px-4 py-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-3">{title}</span>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? copiedLabel : copyLabel}
            className={`inline-flex items-center gap-1.5 font-mono text-[11px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint ${
              copied ? "text-mint" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            <CopyIcon width={13} height={13} />
            {copied ? copiedLabel : copyLabel}
          </button>
        </div>
      )}
      {!title && (
        <div className="flex justify-end border-b border-line/70 px-4 py-1.5">
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? copiedLabel : copyLabel}
            className={`inline-flex items-center gap-1.5 font-mono text-[11px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint ${
              copied ? "text-mint" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            <CopyIcon width={13} height={13} />
            {copied ? copiedLabel : copyLabel}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-ink-2">
        {code}
      </pre>
    </div>
  );
}
