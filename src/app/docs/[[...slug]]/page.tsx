'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Layers, Search, FileText, Shield, Terminal, ArrowRight } from 'lucide-react';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/Badge';

export default function DocsPortalPage() {
  const [selectedTopic, setSelectedTopic] = useState('architecture');

  const topics = [
    { id: 'introduction', title: 'Introduction & Mission', badge: 'Available' },
    { id: 'architecture', title: 'Control Plane Architecture', badge: 'Available' },
    { id: 'byok', title: 'Bring Your Own Key (BYOK)', badge: 'Available' },
    { id: 'sandboxing', title: 'Worker Sandboxing & Isolation', badge: 'Available' },
    { id: 'replay', title: 'Agent Replay & Event Schema', badge: 'Available' },
    { id: 'approvals', title: 'Dangerous Action Approval Gates', badge: 'Available' },
    { id: 'desktop', title: 'Desktop Connector Protocol', badge: 'Beta' },
    { id: 'android', title: 'Android Companion Architecture', badge: 'In Development' },
    { id: 'api', title: 'Planned REST & WebSocket API', badge: 'Planned API' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Docs Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <div className="text-xs font-mono uppercase text-[#10b981] tracking-wider">Documentation Guide</div>
          <div className="space-y-1">
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between ${
                  selectedTopic === t.id
                    ? 'bg-[#10b981]/15 text-[#34d399] font-medium border border-[#10b981]/30'
                    : 'text-[#94a3b8] hover:bg-[#151b1e] hover:text-[#f1f5f9]'
                }`}
              >
                <span>{t.title}</span>
                <span className="text-[9px] font-mono text-[#64748b]">{t.badge}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#1c2529] text-[11px] text-[#64748b]">
            External Docs Repository: <code className="text-[#34d399]">bambookit-docs</code>
          </div>
        </aside>

        {/* Docs Content */}
        <main className="flex-1 min-w-0 bg-[#0c1012] border border-[#1c2529] rounded-xl p-8 text-xs text-[#cbd5e1] space-y-6 leading-relaxed">
          {selectedTopic === 'architecture' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="success">AVAILABLE IN V1.0</Badge>
                <span className="text-[11px] font-mono text-[#64748b]">CORE_ARCHITECTURE.md</span>
              </div>

              <h1 className="text-2xl font-bold text-[#f1f5f9]">Control Plane vs. Execution Plane</h1>

              <p>
                BambooKit decouples <strong>decision logic</strong>, <strong>environment state</strong>, and{' '}
                <strong>execution runtimes</strong>. Coding agents do not hold permanent state, and AI model context
                windows are not treated as the database for the entire repository.
              </p>

              <div className="p-4 rounded-lg bg-[#080b0c] border border-[#1c2529] font-mono text-[11px] space-y-1.5 text-[#94a3b8]">
                <div className="text-[#10b981]">CLIENT (Web / Android / Desktop)</div>
                <div className="text-[#64748b]">  ↓ Authenticated WebSocket (TLS)</div>
                <div className="text-[#34d399]">BAMBOOKIT CONTROL PLANE (Task Dispatch, Policy, Persistence)</div>
                <div className="text-[#64748b]">  ↓ Isolated Job Queue</div>
                <div className="text-[#06b6d4]">EPHEMERAL WORKER CONTAINER (Git checkout, Agent, Sandbox)</div>
                <div className="text-[#64748b]">  ↓ Outbound BYOK API Call</div>
                <div className="text-[#f59e0b]">AI PROVIDER (Claude 3.7 / GPT-4.5 / Gemini / Local Ollama)</div>
              </div>

              <h2 className="text-sm font-semibold text-[#f1f5f9] pt-2">Ephemeral Worker Lifecycles</h2>
              <p>
                Instead of requiring users to pay for 24/7 dedicated virtual machines, BambooKit spawns micro-containers
                on demand. A worker pulls git commits, mounts cache layers, executes the assigned agent task, runs test
                verification, commits changes, streams telemetry, and destroys itself.
              </p>
            </div>
          )}

          {selectedTopic === 'byok' && (
            <div className="space-y-4">
              <Badge variant="success">BYOK PRINCIPLE</Badge>
              <h1 className="text-2xl font-bold text-[#f1f5f9]">Bring Your Own Key Architecture</h1>
              <p>
                BambooKit never marks up AI tokens. You configure your own Anthropic, OpenAI, Google, or OpenRouter API
                keys. When a worker invokes a model, requests route directly from your sandbox using encrypted hardware
                vault tokens.
              </p>
            </div>
          )}

          {selectedTopic === 'replay' && (
            <div className="space-y-4">
              <Badge variant="success">OBSERVABILITY</Badge>
              <h1 className="text-2xl font-bold text-[#f1f5f9]">Agent Replay &amp; Event Stream</h1>
              <p>
                Every action taken by an agent is structured as an immutable JSON event record. Developers can scrub
                through execution steps, inspecting exact terminal outputs, unified diff chunks, and verification tests.
              </p>
            </div>
          )}

          {selectedTopic === 'api' && (
            <div className="space-y-4">
              <Badge variant="warning">PLANNED API SPECIFICATION</Badge>
              <h1 className="text-2xl font-bold text-[#f1f5f9]">Future Control Plane Endpoints</h1>
              <p>
                The future <code className="text-[#34d399]">bambookit-api</code> backend will expose these standardized
                contracts for web, mobile, and CLI connectors:
              </p>
              <div className="p-4 bg-[#080b0c] border border-[#1c2529] rounded font-mono text-[11px] space-y-2 text-[#94a3b8]">
                <div><span className="text-[#10b981]">POST</span> /api/v1/projects/:id/tasks (Dispatch autonomous task)</div>
                <div><span className="text-[#06b6d4]">GET</span>  /api/v1/agents/:id/events (Stream replay events)</div>
                <div><span className="text-[#f59e0b]">POST</span> /api/v1/approvals/:id/grant (Human approval authorization)</div>
                <div><span className="text-[#f87171]">POST</span> /api/v1/workers/circuit-breaker (Emergency pause)</div>
              </div>
            </div>
          )}

          {selectedTopic !== 'architecture' && selectedTopic !== 'byok' && selectedTopic !== 'replay' && selectedTopic !== 'api' && (
            <div className="space-y-4">
              <Badge variant="info">DOCUMENTATION TOPIC</Badge>
              <h1 className="text-2xl font-bold text-[#f1f5f9]">
                {topics.find((t) => t.id === selectedTopic)?.title}
              </h1>
              <p>
                Complete technical specification and integration guidelines for this subsystem are maintained in the
                dedicated <code className="text-[#34d399]">bambookit-docs</code> repository and rendered natively here.
              </p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
