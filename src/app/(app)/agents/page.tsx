'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, ArrowRight, Play, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { liveApi } from '@/services/liveApi';

export default function AgentsIndexPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liveApi
      .getAgents()
      .then((data) => {
        setAgents(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Autonomous Coding Agents</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Supervise autonomous runtimes, track execution state, and inspect token expenditures.
          </p>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-[#64748b] font-mono text-xs">
          Loading active agents from control plane...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          Failed to load agents: {error}
        </div>
      )}

      {!loading && !error && agents.length === 0 && (
        <div className="p-16 text-center bg-[#0f1416] border border-[#1c2529] rounded-xl space-y-3">
          <Bot className="h-10 w-10 text-[#64748b] mx-auto" />
          <h3 className="text-sm font-semibold text-[#f1f5f9]">No Agents Connected</h3>
          <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
            Attach an agent provider key (OpenCode, OpenAI, Gemini, or Claude) in the Provider Hub.
          </p>
        </div>
      )}

      {!loading && agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} hoverable className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#f1f5f9]">{agent.name}</h3>
                    <div className="text-[11px] font-mono text-[#64748b]">{agent.model}</div>
                  </div>
                </div>
                <Badge
                  variant={
                    agent.status === 'RUNNING'
                      ? 'success'
                      : agent.status === 'WAITING_FOR_APPROVAL'
                      ? 'warning'
                      : 'default'
                  }
                  dot
                >
                  {agent.status}
                </Badge>
              </div>

              <p className="text-xs text-[#94a3b8] leading-relaxed">{agent.description || 'Specialized coding agent runtime.'}</p>

              <div className="p-2.5 rounded bg-[#080b0c] border border-[#1c2529] space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between text-[#64748b]">
                  <span>Provider: {agent.provider || 'BYOK'}</span>
                  <span>Mode: {agent.executionMode || 'CLOUD'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1c2529] text-xs">
                <div className="font-mono text-[11px] text-[#64748b]">
                  Project: {agent.projectId || 'Workspace Default'}
                </div>
                <Link href={`/agents/${agent.id}`}>
                  <Button variant="outline" size="sm">
                    Open Workspace <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
