'use client';

import React, { useState } from 'react';
import { Terminal as TerminalIcon, Play, Pause, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'command' | 'success' | 'warn' | 'error';
  content: string;
}

const DEFAULT_LOGS: TerminalLog[] = [
  { id: '1', timestamp: '03:10:02', type: 'command', content: '$ git checkout -b feat/google-auth' },
  { id: '2', timestamp: '03:10:03', type: 'info', content: 'Switched to a new branch "feat/google-auth"' },
  { id: '3', timestamp: '03:10:08', type: 'command', content: '$ cat package.json | grep next-auth' },
  { id: '4', timestamp: '03:10:09', type: 'info', content: '"next-auth": "^4.24.5",' },
  { id: '5', timestamp: '03:10:21', type: 'command', content: '$ inspect src/lib/auth.ts' },
  { id: '6', timestamp: '03:11:04', type: 'info', content: 'Patching auth handler with GoogleProvider and session token callbacks...' },
  { id: '7', timestamp: '03:11:45', type: 'command', content: '$ npm test -- --run' },
  { id: '8', timestamp: '03:12:05', type: 'success', content: '✓ src/tests/auth.test.ts (8 tests) [142ms]' },
  { id: '9', timestamp: '03:12:12', type: 'success', content: '✓ src/tests/routes.test.ts (6 tests) [98ms]' },
  { id: '10', timestamp: '03:12:19', type: 'success', content: '✓ src/tests/session.test.ts (5 tests) [75ms]' },
  { id: '11', timestamp: '03:12:35', type: 'success', content: '✓ src/tests/security.test.ts (5 tests) [110ms]' },
  { id: '12', timestamp: '03:12:42', type: 'info', content: 'Test Files 4 passed (4) | Tests 24 passed (24) | Duration 1.24s' },
  { id: '13', timestamp: '03:12:50', type: 'command', content: '$ git commit -m "feat(auth): integrate google oauth & session callback"' },
  { id: '14', timestamp: '03:12:51', type: 'info', content: '[feat/google-auth 8f31c2a] 3 files changed, 142 insertions(+), 38 deletions(-)' },
  { id: '15', timestamp: '03:13:10', type: 'warn', content: 'GATE_PAUSE: BambooKit Policy requires human approval before production deployment.' },
];

export function TerminalViewer() {
  const [logs, setLogs] = useState<TerminalLog[]>(DEFAULT_LOGS);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.content}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-[#1c2529] bg-[#080b0c] font-mono text-xs overflow-hidden flex flex-col h-full">
      {/* Terminal Bar */}
      <div className="px-3 py-2 bg-[#0c1012] border-b border-[#1c2529] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#94a3b8]">
          <TerminalIcon className="h-3.5 w-3.5 text-[#10b981]" />
          <span>bambookit-worker-pty (isolated ephemeral sandbox)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#151b1e]"
            title={isPaused ? 'Resume Stream' : 'Pause Stream'}
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-[#34d399]" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#151b1e]"
            title="Copy Terminal Logs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#10b981]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setLogs([])}
            className="p-1 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#151b1e]"
            title="Clear Terminal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Lines */}
      <div className="p-3 space-y-1.5 overflow-y-auto flex-1 min-h-[260px] text-[11px] leading-relaxed select-text">
        {logs.length === 0 ? (
          <div className="text-[#64748b] italic">Terminal buffer is empty.</div>
        ) : (
          logs.map((log) => {
            let color = 'text-[#cbd5e1]';
            if (log.type === 'command') color = 'text-[#34d399] font-semibold';
            if (log.type === 'success') color = 'text-[#10b981]';
            if (log.type === 'warn') color = 'text-[#fbbf24]';
            if (log.type === 'error') color = 'text-[#f87171]';

            return (
              <div key={log.id} className="flex items-start gap-2.5">
                <span className="text-[#475569] shrink-0 select-none">{log.timestamp}</span>
                <span className={`break-all ${color}`}>{log.content}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer Status */}
      <div className="px-3 py-1 bg-[#0c1012] border-t border-[#1c2529] text-[10px] text-[#64748b] flex items-center justify-between">
        <span>Exit code: 0 • TTY: /dev/pts/1</span>
        <span>Simulated Cloud Worker Shell</span>
      </div>
    </div>
  );
}
