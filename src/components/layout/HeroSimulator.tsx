'use client';

import React, { useState } from 'react';
import { Terminal, CheckCircle2, ShieldAlert, GitCommit, Rocket, ChevronRight, Play, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function HeroSimulator() {
  const [step, setStep] = useState(3);
  const [isApproved, setIsApproved] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Task Dispatched',
      label: 'Android Phone / Web Prompt',
      content: '"Add Google authentication, fix signup flow, run test suites, commit & deploy."',
    },
    {
      id: 2,
      title: 'Agent Executing',
      label: 'Backend Agent (Claude 3.7 Sonnet)',
      content: 'Inspected routes/auth.ts -> Added GoogleProvider & JWT callback (+142 -38 lines)',
    },
    {
      id: 3,
      title: 'Verification & Gate',
      label: 'Ephemeral Cloud Sandbox',
      content: '24 tests passed (0 failures). Production deployment requested.',
    },
    {
      id: 4,
      title: 'Deployment Live',
      label: 'Edge Fleet & CDN',
      content: 'Commit 8f31c2a live on production cluster in 42 seconds.',
    },
  ];

  const handleApprove = () => {
    setIsApproved(true);
    setStep(4);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl border border-[#1c2529] bg-[#0c1012] shadow-2xl overflow-hidden text-left font-sans">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1417] border-b border-[#1c2529]">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ef4444]/60 border border-[#ef4444]/80" />
          <div className="h-3 w-3 rounded-full bg-[#f59e0b]/60 border border-[#f59e0b]/80" />
          <div className="h-3 w-3 rounded-full bg-[#10b981]/60 border border-[#10b981]/80" />
          <span className="ml-2 text-xs font-mono text-[#94a3b8]">
            bambookit-session: <span className="text-[#f1f5f9]">feat/google-auth</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>
            Ephemeral Worker Active
          </Badge>
          <span className="text-[11px] font-mono text-[#64748b]">latency: 18ms</span>
        </div>
      </div>

      {/* Main Workspace Simulation Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
        {/* Left: Interactive Step Pipeline */}
        <div className="md:col-span-4 border-r border-[#1c2529] p-4 bg-[#0a0d0e]/60 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider mb-3">
              Autonomous Execution Pipeline
            </div>
            <div className="space-y-2">
              {steps.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`w-full text-left p-2.5 rounded-md border transition-all text-xs flex items-start gap-2.5 ${
                      isActive
                        ? 'border-[#10b981]/40 bg-[#10b981]/5 text-[#f1f5f9]'
                        : isDone
                        ? 'border-[#1c2529] bg-[#0f1416]/40 text-[#94a3b8]'
                        : 'border-transparent text-[#64748b] opacity-60'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <Check className="h-3.5 w-3.5 text-[#10b981]" />
                      ) : isActive ? (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-[#10b981] border-t-transparent animate-spin" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-[#64748b]" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-1.5">
                        {s.title}
                        {isActive && (
                          <span className="text-[10px] text-[#10b981] font-mono bg-[#10b981]/10 px-1 rounded">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#64748b] truncate mt-0.5">{s.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1c2529] flex items-center justify-between text-[11px] text-[#64748b] font-mono">
            <span>BYOK: Anthropic Sonnet 3.7</span>
            <span>$0.14 est.</span>
          </div>
        </div>

        {/* Right: Dynamic Output / Interactive Gate */}
        <div className="md:col-span-8 p-5 flex flex-col justify-between bg-[#0a0d0e]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
                <Play className="h-3.5 w-3.5 text-[#10b981]" /> Dispatching User Prompt from Android App
              </div>
              <div className="p-4 rounded-lg bg-[#0f1416] border border-[#1c2529] font-mono text-xs text-[#cbd5e1] leading-relaxed">
                &quot;Add Google authentication to our Next.js application, fix the signup flow, run test suites, commit
                the changes and deploy to production.&quot;
              </div>
              <div className="text-xs text-[#94a3b8]">
                BambooKit initialized an isolated cloud worker container, cloned repository branch{' '}
                <code className="text-[#34d399]">main</code>, and dispatched context to Backend Agent.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#94a3b8]">
                <span className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-[#10b981]" />
                  Agent Execution Log
                </span>
                <span className="text-[#34d399]">+142 -38 lines</span>
              </div>
              <div className="p-3 bg-[#080b0c] border border-[#1c2529] rounded text-[11px] space-y-1.5 overflow-x-auto text-[#94a3b8]">
                <div className="text-[#64748b]">&gt; agent.read_file src/lib/auth.ts</div>
                <div className="text-[#64748b]">&gt; agent.diff_applied src/app/api/auth/[...nextauth]/route.ts</div>
                <div className="text-[#34d399]">+ GoogleProvider(&#123; clientId: process.env.GOOGLE_ID, ... &#125;)</div>
                <div className="text-[#34d399]">+ async session(&#123; session, token &#125;) =&gt; session.user.id = token.sub</div>
                <div className="text-[#ef4444]">- // placeholder login handler</div>
                <div className="text-[#64748b]">&gt; agent.exec npm run build</div>
                <div className="text-[#10b981]">✓ Compiled successfully in 1.4s</div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b]">
                  <ShieldAlert className="h-4 w-4" /> Policy Gate: Dangerous Action Approval
                </div>
                <Badge variant="warning">Production Deployment</Badge>
              </div>

              <div className="p-4 rounded-lg bg-[#15130b] border border-[#f59e0b]/30 space-y-2.5 text-xs">
                <div className="text-[#f1f5f9] font-medium flex items-center justify-between">
                  <span>Backend Agent requests permission to deploy to Production</span>
                  <span className="text-[11px] font-mono text-[#fbbf24]">Target: Live Cluster</span>
                </div>
                <p className="text-[#cbd5e1] text-[11px]">
                  All 24 unit and integration tests passed in sandbox. BambooKit policy blocks unapproved production
                  rollouts.
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-[#94a3b8]">
                  <span>SHA: 8f31c2a</span>
                  <span>•</span>
                  <span>Affected: Production CDN &amp; Auth DB</span>
                </div>
              </div>

              {!isApproved ? (
                <div className="flex items-center gap-3 pt-2">
                  <Button variant="primary" size="sm" onClick={handleApprove}>
                    Approve &amp; Trigger Deployment
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                    Inspect Diffs First
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#34d399] font-mono">
                  <CheckCircle2 className="h-4 w-4" /> Approval granted by user. Dispatching to production fleet...
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#34d399]">
                  <Rocket className="h-4 w-4 text-[#10b981]" /> Deployment Live
                </div>
                <Badge variant="success">Completed</Badge>
              </div>
              <div className="p-4 bg-[#0a1410] border border-[#10b981]/30 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-[#f1f5f9]">
                  <span className="flex items-center gap-1.5">
                    <GitCommit className="h-3.5 w-3.5 text-[#10b981]" /> 8f31c2a
                  </span>
                  <span className="text-[#34d399]">Live in 42s</span>
                </div>
                <p className="text-[11px] text-[#cbd5e1]">
                  https://bambookit.dev updated. Agent session archived into immutable replay ledger. Worker container
                  destroyed to minimize cloud costs.
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748b]">
                <span>Status: Zero active compute charges</span>
                <Button variant="ghost" size="sm" onClick={() => { setStep(1); setIsApproved(false); }}>
                  Reset Interactive Flow
                </Button>
              </div>
            </div>
          )}

          {/* Quick Footer inside simulator */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1c2529] text-[11px] text-[#64748b]">
            <span>Simulation: Interactive Frontend State</span>
            <button
              onClick={() => setStep((prev) => (prev % 4) + 1)}
              className="flex items-center gap-1 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
            >
              Next Step <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
