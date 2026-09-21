'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, CheckCircle2, ArrowRight, ArrowLeft, Cpu, Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("Satyam's Workspace");
  const [projectName, setProjectName] = useState('BambooKit Web');
  const [executionMode, setExecutionMode] = useState<'cloud' | 'local'>('cloud');
  const [provider, setProvider] = useState('anthropic');

  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2529]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm text-[#f1f5f9]">BambooKit Setup Wizard</span>
          </div>
          <span className="text-xs font-mono text-[#64748b]">Step {step} of 4</span>
        </div>

        {/* Step 1: Workspace & Project */}
        {step === 1 && (
          <div className="p-6 rounded-xl bg-[#0f1416] border border-[#1c2529] space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[#f1f5f9]">1. Create Your Control Plane Workspace</h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Your workspace holds connected repositories, agent policies, and audit logs.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94a3b8] mb-1 font-mono text-[11px]">Workspace Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080b0c] border border-[#1c2529] rounded text-[#f1f5f9] focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1 font-mono text-[11px]">First Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080b0c] border border-[#1c2529] rounded text-[#f1f5f9] focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1 font-mono text-[11px]">Git Repository URL (Public or Private)</label>
                <input
                  type="text"
                  defaultValue="https://github.com/BambooKit/bambookit-web"
                  className="w-full px-3 py-2 bg-[#080b0c] border border-[#1c2529] rounded text-[#f1f5f9] focus:outline-none focus:border-[#10b981] font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)}>
                Next: Execution Mode <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Execution Mode */}
        {step === 2 && (
          <div className="p-6 rounded-xl bg-[#0f1416] border border-[#1c2529] space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[#f1f5f9]">2. Choose Execution Mode</h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Where should coding agents compile, test, and run your software?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setExecutionMode('cloud')}
                className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2 ${
                  executionMode === 'cloud'
                    ? 'bg-[#10b981]/10 border-[#10b981]/50 text-[#f1f5f9]'
                    : 'bg-[#080b0c] border-[#1c2529] text-[#94a3b8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Cpu className="h-5 w-5 text-[#10b981]" />
                  {executionMode === 'cloud' && <Badge variant="success">Selected</Badge>}
                </div>
                <div className="font-semibold text-xs text-[#f1f5f9]">Ephemeral Cloud Worker</div>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                  Fast isolated containers in us-east-1. Zero laptop battery drain; executes while your computer is offline.
                </p>
              </div>

              <div
                onClick={() => setExecutionMode('local')}
                className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2 ${
                  executionMode === 'local'
                    ? 'bg-[#10b981]/10 border-[#10b981]/50 text-[#f1f5f9]'
                    : 'bg-[#080b0c] border-[#1c2529] text-[#94a3b8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Shield className="h-5 w-5 text-[#06b6d4]" />
                  {executionMode === 'local' && <Badge variant="info">Selected</Badge>}
                </div>
                <div className="font-semibold text-xs text-[#f1f5f9]">Desktop Connector (Local)</div>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                  Outbound TLS connection to your local machine. Runs on your files without uploading code to cloud workers.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Connect AI Provider <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Provider BYOK */}
        {step === 3 && (
          <div className="p-6 rounded-xl bg-[#0f1416] border border-[#1c2529] space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[#f1f5f9]">3. Bring Your Own Key (BYOK)</h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Select your preferred AI coding intelligence. BambooKit never adds token markups.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'anthropic', name: 'Anthropic Claude', model: 'claude-3-7-sonnet-20250219' },
                { id: 'openai', name: 'OpenAI', model: 'gpt-4.5-preview' },
                { id: 'google', name: 'Google Gemini', model: 'gemini-2.5-pro' },
                { id: 'local', name: 'Local Ollama', model: 'qwen2.5-coder:32b' },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    provider === p.id
                      ? 'bg-[#10b981]/10 border-[#10b981]/50 text-[#f1f5f9]'
                      : 'bg-[#080b0c] border-[#1c2529] text-[#94a3b8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-[#10b981]" />
                    <div>
                      <div className="font-medium text-xs text-[#f1f5f9]">{p.name}</div>
                      <div className="text-[10px] font-mono text-[#64748b]">Default: {p.model}</div>
                    </div>
                  </div>
                  {provider === p.id && <CheckCircle2 className="h-4 w-4 text-[#10b981]" />}
                </div>
              ))}
            </div>

            <div className="text-xs text-[#64748b] font-mono">
              In demo mode, mock provider credentials are pre-filled securely.
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(4)}>
                Next: Launch Agent <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm & Launch */}
        {step === 4 && (
          <div className="p-6 rounded-xl bg-[#0f1416] border border-[#1c2529] space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[#f1f5f9]">4. Ready to Supervise</h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Your autonomous control plane is initialized. You can now dispatch coding tasks and review diffs.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#080b0c] border border-[#1c2529] space-y-2 font-mono text-xs text-[#94a3b8]">
              <div className="flex justify-between">
                <span>Workspace:</span>
                <span className="text-[#f1f5f9]">{workspaceName}</span>
              </div>
              <div className="flex justify-between">
                <span>Project:</span>
                <span className="text-[#f1f5f9]">{projectName}</span>
              </div>
              <div className="flex justify-between">
                <span>Execution:</span>
                <span className="text-[#34d399] uppercase">{executionMode}</span>
              </div>
              <div className="flex justify-between">
                <span>Provider:</span>
                <span className="text-[#34d399] uppercase">{provider} (BYOK)</span>
              </div>
            </div>

            <Link href="/dashboard" className="block pt-2">
              <Button variant="primary" size="md" className="w-full">
                Enter Control Plane Console <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
