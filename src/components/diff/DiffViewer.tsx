'use client';

import React, { useState } from 'react';
import { FileCode, Split, AlignLeft, Check, Copy, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface DiffLine {
  type: 'context' | 'add' | 'remove';
  oldLine?: number;
  newLine?: number;
  content: string;
}

const SAMPLE_DIFF_FILES = [
  {
    file: 'src/lib/auth.ts',
    additions: 46,
    deletions: 12,
    lines: [
      { type: 'context', oldLine: 12, newLine: 12, content: 'export const authOptions: NextAuthOptions = {' },
      { type: 'context', oldLine: 13, newLine: 13, content: '  session: { strategy: "jwt" },' },
      { type: 'context', oldLine: 14, newLine: 14, content: '  providers: [' },
      { type: 'remove', oldLine: 15, content: '-   // Legacy credentials provider placeholder' },
      { type: 'add', newLine: 15, content: '+   GoogleProvider({' },
      { type: 'add', newLine: 16, content: '+     clientId: process.env.GOOGLE_CLIENT_ID!,' },
      { type: 'add', newLine: 17, content: '+     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,' },
      { type: 'add', newLine: 18, content: '+     authorization: { params: { prompt: "select_account" } },' },
      { type: 'add', newLine: 19, content: '+   }),' },
      { type: 'context', oldLine: 16, newLine: 20, content: '  ],' },
      { type: 'context', oldLine: 17, newLine: 21, content: '  callbacks: {' },
      { type: 'remove', oldLine: 18, content: '-   // No session callbacks configured' },
      { type: 'add', newLine: 22, content: '+   async session({ session, token }) {' },
      { type: 'add', newLine: 23, content: '+     if (token && session.user) session.user.id = token.sub!;' },
      { type: 'add', newLine: 24, content: '+     return session;' },
      { type: 'add', newLine: 25, content: '+   },' },
      { type: 'context', oldLine: 19, newLine: 26, content: '  },' },
      { type: 'context', oldLine: 20, newLine: 27, content: '};' },
    ] as DiffLine[],
  },
  {
    file: 'src/app/api/auth/[...nextauth]/route.ts',
    additions: 22,
    deletions: 4,
    lines: [
      { type: 'context', oldLine: 1, newLine: 1, content: 'import NextAuth from "next-auth";' },
      { type: 'context', oldLine: 2, newLine: 2, content: 'import { authOptions } from "@/lib/auth";' },
      { type: 'remove', oldLine: 3, content: '-// Temporary 404 stub' },
      { type: 'remove', oldLine: 4, content: '-export async function GET() { return new Response("Not configured"); }' },
      { type: 'add', newLine: 3, content: '+const handler = NextAuth(authOptions);' },
      { type: 'add', newLine: 4, content: '+export { handler as GET, handler as POST };' },
    ] as DiffLine[],
  },
];

export function DiffViewer() {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [isSplitView, setIsSplitView] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeFile = SAMPLE_DIFF_FILES[selectedFileIdx];

  const handleCopy = () => {
    const code = activeFile.lines.map((l) => l.content).join('\n');
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-[#1c2529] bg-[#0c1012] overflow-hidden flex flex-col font-sans text-xs">
      {/* Top Controls Bar */}
      <div className="px-4 py-2.5 bg-[#0f1416] border-b border-[#1c2529] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-[#10b981]" />
          <div className="flex items-center gap-1.5">
            {SAMPLE_DIFF_FILES.map((f, i) => (
              <button
                key={f.file}
                onClick={() => setSelectedFileIdx(i)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  selectedFileIdx === i
                    ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 font-semibold'
                    : 'text-[#94a3b8] hover:bg-[#151b1e]'
                }`}
              >
                {f.file}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-[11px] flex items-center gap-2">
            <span className="text-[#34d399]">+{activeFile.additions}</span>
            <span className="text-[#f87171]">-{activeFile.deletions}</span>
          </div>

          <div className="flex items-center border border-[#1c2529] rounded p-0.5 bg-[#080b0c]">
            <button
              onClick={() => setIsSplitView(false)}
              className={`p-1 rounded ${!isSplitView ? 'bg-[#151b1e] text-[#f1f5f9]' : 'text-[#64748b]'}`}
              title="Unified View"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsSplitView(true)}
              className={`p-1 rounded ${isSplitView ? 'bg-[#151b1e] text-[#f1f5f9]' : 'text-[#64748b]'}`}
              title="Split View"
            >
              <Split className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#151b1e] border border-[#1c2529]"
            title="Copy Diff"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#10b981]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Diff Code Table */}
      <div className="overflow-x-auto bg-[#080b0c] font-mono text-[11px]">
        <table className="w-full border-collapse">
          <tbody>
            {activeFile.lines.map((line, idx) => {
              let bg = 'hover:bg-[#101518]';
              let textColor = 'text-[#cbd5e1]';
              let prefix = ' ';

              if (line.type === 'add') {
                bg = 'bg-[#10b981]/10 hover:bg-[#10b981]/15';
                textColor = 'text-[#34d399]';
                prefix = '+';
              } else if (line.type === 'remove') {
                bg = 'bg-[#ef4444]/10 hover:bg-[#ef4444]/15';
                textColor = 'text-[#f87171]';
                prefix = '-';
              }

              return (
                <tr key={idx} className={`${bg} transition-colors border-b border-[#1c2529]/20`}>
                  <td className="py-0.5 px-2 text-right text-[#475569] select-none w-10 border-r border-[#1c2529]/40 text-[10px]">
                    {line.oldLine || ''}
                  </td>
                  <td className="py-0.5 px-2 text-right text-[#475569] select-none w-10 border-r border-[#1c2529]/40 text-[10px]">
                    {line.newLine || ''}
                  </td>
                  <td className="py-0.5 px-3 select-none text-[#64748b] w-4 text-[11px] font-bold">{prefix}</td>
                  <td className={`py-0.5 px-2 whitespace-pre leading-relaxed ${textColor}`}>{line.content}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Diff Footer Status */}
      <div className="px-4 py-2 bg-[#0c1012] border-t border-[#1c2529] flex items-center justify-between text-[11px] text-[#64748b]">
        <span>Synthesized unified Git patch from cloud worker snapshot</span>
        <span className="font-mono">Commit: 8f31c2a</span>
      </div>
    </div>
  );
}
