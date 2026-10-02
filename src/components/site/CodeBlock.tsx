"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copyable command / code block. */
export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-bk-line bg-bk-panel">
      <div className="flex items-center justify-between border-b border-bk-line px-4 py-1.5 text-xs text-bk-faint">
        <span>{label ?? "PowerShell"}</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-bk-muted hover:bg-bk-raised hover:text-bk-fg"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              // Clipboard blocked: the text can still be selected by hand.
            }
          }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-bk-fg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
