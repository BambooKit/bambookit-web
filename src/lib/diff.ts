/** Unified-diff parsing for the session Changes view. Pure functions, no React. */

export type DiffLineKind = "hunk" | "add" | "del" | "ctx" | "meta";

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
  /** Line number in the old file (deleted and context lines). */
  oldNo?: number;
  /** Line number in the new file (added and context lines). */
  newNo?: number;
}

const HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/;

/**
 * Parse a unified diff (one or more files, one or more hunks) into display lines with old/new
 * line numbers. File headers (diff --git, index, ---, +++) are skipped. Returns null when the
 * text contains no hunk, so the caller can show it as plain text instead.
 */
export function parsePatch(patch: string | null | undefined): DiffLine[] | null {
  if (!patch) return null;
  const lines = patch.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  const out: DiffLine[] = [];
  let oldNo = 0;
  let newNo = 0;
  let oldLeft = 0;
  let newLeft = 0;
  let sawHunk = false;
  for (const line of lines) {
    const inHunk = oldLeft > 0 || newLeft > 0;
    if (!inHunk) {
      const m = HUNK.exec(line);
      if (m) {
        oldNo = Number(m[1]);
        newNo = Number(m[3]);
        oldLeft = m[2] === undefined ? 1 : Number(m[2]);
        newLeft = m[4] === undefined ? 1 : Number(m[4]);
        sawHunk = true;
        out.push({ kind: "hunk", text: line });
      } else if (sawHunk && line.startsWith("\\")) {
        out.push({ kind: "meta", text: line.slice(1).trim() });
      }
      continue;
    }
    const sign = line[0];
    const text = line.slice(1);
    if (sign === "+") {
      out.push({ kind: "add", text, newNo: newNo++ });
      newLeft--;
    } else if (sign === "-") {
      out.push({ kind: "del", text, oldNo: oldNo++ });
      oldLeft--;
    } else if (sign === "\\") {
      out.push({ kind: "meta", text: line.slice(1).trim() });
    } else {
      // Context line; some tools strip the leading space of empty context lines.
      out.push({ kind: "ctx", text: sign === " " ? text : line, oldNo: oldNo++, newNo: newNo++ });
      oldLeft--;
      newLeft--;
    }
  }
  return sawHunk ? out : null;
}

/** Split file text into lines for a line-numbered view. */
export function splitLines(text: string): string[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}
