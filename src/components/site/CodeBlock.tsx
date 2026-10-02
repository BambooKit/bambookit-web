"use client";

import { useState } from "react";

/** Copyable command block. */
export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-bk-line bg-bk-panel">
      <div className="flex items-center justify-between border-b border-bk-line px-4 py-2 text-xs text-bk-faint">
        <span>{label ?? "PowerShell"}</span>
        <button
          type="button"
          className="rounded px-2 py-0.5 text-bk-muted hover:bg-bk-raised hover:text-bk-fg"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-bk-fg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
