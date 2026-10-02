import type { ReactNode } from "react";

/**
 * Minimal markdown for untrusted chat text: paragraphs, headings, lists, fenced code,
 * `inline code`, **bold** and [links](https://…). Everything is rendered as React text
 * (escaped); there is no raw HTML. Only http(s) links become anchors.
 */

const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("`")) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**")) out.push(<strong key={key} className="font-semibold">{tok.slice(2, -2)}</strong>);
    else {
      const [, label, href] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok)!;
      if (/^https?:\/\//i.test(href)) {
        out.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">
            {label}
          </a>,
        );
      } else out.push(tok);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const LIST_ITEM = /^\s{0,3}([-*+]|\d+[.)])\s+/;
const HEADING = /^\s{0,3}#{1,6}\s+/;
const FENCE = /^\s{0,3}(```|~~~)/;

export function RichText({ text, className }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith(fence[1])) code.push(lines[i++]);
      i++; // closing fence (may be missing while the agent is still writing)
      blocks.push(
        <pre key={k++}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    if (HEADING.test(line)) {
      blocks.push(<h4 key={k++}>{inline(line.replace(HEADING, ""), `h${k}`)}</h4>);
      i++;
      continue;
    }
    if (LIST_ITEM.test(line)) {
      const ordered = /^\s{0,3}\d/.test(line);
      const items: string[] = [];
      while (i < lines.length && LIST_ITEM.test(lines[i])) {
        let item = lines[i++].replace(LIST_ITEM, "");
        // Indented continuation lines belong to the item.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !LIST_ITEM.test(lines[i])) item += ` ${lines[i++].trim()}`;
        items.push(item);
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List key={k++}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, `l${k}-${j}`)}</li>
          ))}
        </List>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !FENCE.test(lines[i]) && !HEADING.test(lines[i]) && !LIST_ITEM.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={k++}>{inline(para.join("\n"), `p${k}`)}</p>);
  }
  return <div className={`chat-md ${className ?? ""}`}>{blocks}</div>;
}
