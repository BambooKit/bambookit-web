"use client";

import { useMemo, useState } from "react";
import { cx } from "@/components/ui";
import { parsePatch, splitLines, type DiffLine } from "@/lib/diff";

/** Rows rendered before a "Show all" button, to keep huge files and patches responsive. */
const ROW_LIMIT = 3000;

function ShowAll({ total, onClick }: { total: number; onClick: () => void }) {
  return (
    <div className="border-t border-bk-line px-4 py-2 text-center text-xs text-bk-muted">
      Showing the first {ROW_LIMIT.toLocaleString()} of {total.toLocaleString()} lines.{" "}
      <button type="button" className="underline underline-offset-2 hover:text-bk-fg" onClick={onClick}>
        Show all
      </button>
    </div>
  );
}

const ROW_CLS: Record<DiffLine["kind"], string> = {
  add: "bg-bk-diff-add-bg",
  del: "bg-bk-diff-del-bg",
  ctx: "",
  hunk: "bg-bk-diff-hunk-bg",
  meta: "",
};

const GUTTER_CLS: Record<DiffLine["kind"], string> = {
  add: "bg-bk-diff-add-gutter text-bk-diff-add-fg/70",
  del: "bg-bk-diff-del-gutter text-bk-diff-del-fg/70",
  ctx: "text-bk-faint",
  hunk: "bg-bk-diff-hunk-bg text-bk-diff-hunk-fg/70",
  meta: "text-bk-faint",
};

const TEXT_CLS: Record<DiffLine["kind"], string> = {
  add: "text-bk-diff-add-fg",
  del: "text-bk-diff-del-fg",
  ctx: "text-bk-fg",
  hunk: "text-bk-diff-hunk-fg",
  meta: "italic text-bk-faint",
};

/** A unified diff with old/new line-number gutters and hunk headers. */
export function DiffTable({ patch }: { patch: string | null | undefined }) {
  const lines = useMemo(() => parsePatch(patch), [patch]);
  const [all, setAll] = useState(false);

  if (!patch || !patch.trim()) {
    return <p className="px-4 py-6 text-center text-xs text-bk-faint">No line-level patch was recorded for this change.</p>;
  }
  if (!lines) {
    // Not a unified diff: show the recorded text as-is rather than guessing.
    return (
      <div>
        <p className="border-b border-bk-line px-4 py-2 text-xs text-bk-faint">This change was recorded without line numbers.</p>
        <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-5 text-bk-fg">{patch}</pre>
      </div>
    );
  }
  const shown = all ? lines : lines.slice(0, ROW_LIMIT);
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs leading-5">
          <tbody>
            {shown.map((l, i) => (
              <tr key={i} className={ROW_CLS[l.kind]}>
                {l.kind === "hunk" || l.kind === "meta" ? (
                  <>
                    <td colSpan={3} className={cx("select-none border-r border-bk-line", GUTTER_CLS[l.kind])} />
                    <td className={cx("whitespace-pre px-3 py-0.5", TEXT_CLS[l.kind])}>{l.text}</td>
                  </>
                ) : (
                  <>
                    <td className={cx("w-px select-none whitespace-nowrap px-2 text-right tabular-nums", GUTTER_CLS[l.kind])}>{l.oldNo ?? ""}</td>
                    <td className={cx("w-px select-none whitespace-nowrap px-2 text-right tabular-nums", GUTTER_CLS[l.kind])}>{l.newNo ?? ""}</td>
                    <td className={cx("w-px select-none border-r border-bk-line px-1.5 text-center", TEXT_CLS[l.kind])} aria-hidden="true">
                      {l.kind === "add" ? "+" : l.kind === "del" ? "−" : " "}
                    </td>
                    <td className={cx("whitespace-pre px-3", TEXT_CLS[l.kind])}>
                      <span className="sr-only">{l.kind === "add" ? "added: " : l.kind === "del" ? "removed: " : ""}</span>
                      {l.text || " "}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!all && lines.length > ROW_LIMIT && <ShowAll total={lines.length} onClick={() => setAll(true)} />}
    </div>
  );
}

/** Plain file text with line numbers. */
export function CodeView({ text }: { text: string }) {
  const lines = useMemo(() => splitLines(text), [text]);
  const [all, setAll] = useState(false);
  const shown = all ? lines : lines.slice(0, ROW_LIMIT);
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs leading-5">
          <tbody>
            {shown.map((line, i) => (
              <tr key={i}>
                <td className="w-px select-none whitespace-nowrap border-r border-bk-line px-3 text-right tabular-nums text-bk-faint">{i + 1}</td>
                <td className="whitespace-pre px-3 text-bk-fg">{line || " "}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!all && lines.length > ROW_LIMIT && <ShowAll total={lines.length} onClick={() => setAll(true)} />}
    </div>
  );
}
