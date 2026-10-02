import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

/** Inline: `code`, **bold**, [text](href). */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("`")) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**")) out.push(<strong key={key} className="text-bk-fg">{tok.slice(2, -2)}</strong>);
    else {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      out.push(href.startsWith("/") ? <Link key={key} href={href}>{label}</Link> : <a key={key} href={href}>{label}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Small markdown renderer for the docs: headings (with {#id}), paragraphs, lists, tables, fenced code. */
export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/^\n+|\n+$/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(<CodeBlock key={k++} code={code.join("\n")} label={lang === "text" ? "Example" : lang === "powershell" ? "PowerShell" : lang || "Code"} />);
      continue;
    }
    const heading = /^(#{2,3})\s+(.*?)(?:\s+\{#([\w-]+)\})?$/.exec(line);
    if (heading) {
      const Tag = heading[1] === "##" ? "h2" : "h3";
      const id = heading[3] ?? heading[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      blocks.push(<Tag key={k++} id={id} className="scroll-mt-20">{inline(heading[2], `h${k}`)}</Tag>);
      i++;
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={k++} className="overflow-x-auto">
          <table>
            <thead><tr>{head.map((c, j) => <th key={j}>{inline(c, `th${k}${j}`)}</th>)}</tr></thead>
            <tbody>{body.map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c, `td${k}${ri}${j}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^(-|\d+\.)\s/.test(line)) {
      const ordered = /^\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^(-|\d+\.)\s/.test(lines[i])) items.push(lines[i++].replace(/^(-|\d+\.)\s+/, ""));
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={k++}>{items.map((it, j) => <li key={j}>{inline(it, `li${k}${j}`)}</li>)}</List>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{2,3}\s|\||-\s|\d+\.\s)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={k++}>{inline(para.join(" "), `p${k}`)}</p>);
  }
  return <div className="prose-bk">{blocks}</div>;
}
