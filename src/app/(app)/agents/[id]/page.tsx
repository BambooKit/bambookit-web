'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Play,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  Terminal,
  FileCode2,
  History,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TerminalViewer } from '@/components/terminal/TerminalViewer';
import { DiffViewer } from '@/components/diff/DiffViewer';
import { AgentReplay } from '@/components/agent/AgentReplay';
import { liveApi } from '@/services/liveApi';

export default function AgentWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'replay' | 'terminal' | 'diff'>('replay');
  const [agent, setAgent] = useState<any>(null);
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([liveApi.getAgents(), liveApi.getTasks()])
      .then(([agentRes, taskRes]) => {
        if (agentRes.status === 'fulfilled' && agentRes.value && agentRes.value.length > 0) {
          setAgent(agentRes.value[0]);
        }
        if (taskRes.status === 'fulfilled' && taskRes.value && taskRes.value.length > 0) {
          setTask(taskRes.value[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div className="flex items-center gap-3">
          <Link href="/agents" className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#f1f5f9]">{agent ? agent.name : 'Agent Workspace'}</h1>
              {agent && (
                <Badge variant={agent.status === 'RUNNING' ? 'success' : 'warning'} dot>
                  {agent.status}
                </Badge>
              )}
              {agent && <Badge variant="outline">{agent.model || 'Direct API'}</Badge>}
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              {task ? task.title : 'No active autonomous task dispatched.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/approvals">
            <Button variant="primary" size="sm">
              <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Review Pending Gate
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-Pane Layout Meta Card: Runtime & Boundary Inspector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#0f1416] border border-[#1c2529]">
          <div className="text-[10px] font-mono text-[#64748b]">EXECUTION ENVIRONMENT</div>
          <div className="font-semibold text-[#f1f5f9] mt-1 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-[#10b981]" /> {agent?.executionMode || 'CLOUD'} Container
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0f1416] border border-[#1c2529]">
          <div className="text-[10px] font-mono text-[#64748b]">ACTIVE BRANCH</div>
          <div className="font-semibold text-[#34d399] mt-1 font-mono">
            {task?.branch || 'main'}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0f1416] border border-[#1c2529]">
          <div className="text-[10px] font-mono text-[#64748b]">COMMIT REF</div>
          <div className="font-semibold text-[#10b981] mt-1 flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" /> {task?.commitSha || 'HEAD'}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0f1416] border border-[#1c2529]">
          <div className="text-[10px] font-mono text-[#64748b]">PROVIDER RUNTIME</div>
          <div className="font-semibold text-[#f1f5f9] mt-1 font-mono">
            {agent?.provider || 'BYOK Relay'}
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-1 border-b border-[#1c2529] pb-px">
        <button
          onClick={() => setActiveTab('replay')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-medium transition-colors ${
            activeTab === 'replay'
              ? 'border-[#10b981] text-[#34d399] font-semibold'
              : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          <History className="h-3.5 w-3.5" /> Agent Replay Timeline
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-medium transition-colors ${
            activeTab === 'terminal'
              ? 'border-[#10b981] text-[#34d399] font-semibold'
              : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" /> Cloud Worker Terminal
        </button>

        <button
          onClick={() => setActiveTab('diff')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-medium transition-colors ${
            activeTab === 'diff'
              ? 'border-[#10b981] text-[#34d399] font-semibold'
              : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          <FileCode2 className="h-3.5 w-3.5" /> Unified Code Diffs
        </button>
      </div>

      {/* Dynamic Tab Content */}
      <div className="space-y-4">
        {activeTab === 'replay' && <AgentReplay />}
        {activeTab === 'terminal' && <TerminalViewer />}
        {activeTab === 'diff' && <DiffViewer />}
      </div>
    </div>
  );
}
