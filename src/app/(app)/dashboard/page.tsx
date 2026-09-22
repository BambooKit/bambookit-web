'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  ShieldAlert,
  FolderGit2,
  Coins,
  ArrowRight,
  GitCommit,
  CheckCircle2,
  Play,
  Terminal,
  Clock,
  Sparkles,
  Smartphone,
  Rocket,
  Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { liveApi } from '@/services/liveApi';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    Promise.allSettled([
      liveApi.getProjects(),
      liveApi.getTasks(),
      liveApi.getAgents(),
      liveApi.getApprovals(),
      liveApi.getDevices(),
      liveApi.getDeployments(),
      liveApi.getUsage(),
    ])
      .then(([projRes, taskRes, agentRes, apprRes, devRes, depRes, usgRes]) => {
        if (projRes.status === 'fulfilled') setProjects(projRes.value || []);
        if (taskRes.status === 'fulfilled') setTasks(taskRes.value || []);
        if (agentRes.status === 'fulfilled') setAgents(agentRes.value || []);
        if (apprRes.status === 'fulfilled') setApprovals(apprRes.value || []);
        if (devRes.status === 'fulfilled') setDevices(devRes.value || []);
        if (depRes.status === 'fulfilled') setDeployments(depRes.value || []);
        if (usgRes.status === 'fulfilled') setUsage(usgRes.value || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const activeAgents = agents.filter((a) => a.status === 'RUNNING' || a.status === 'WAITING_FOR_APPROVAL');
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const runningTasks = tasks.filter((t) => t.status === 'RUNNING' || t.status === 'WAITING_FOR_APPROVAL');
  const spotlightTask = runningTasks[0] || tasks[0] || null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner: Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Control Plane Overview</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Real-time telemetry and state synchronized with the BambooKit API Control Plane.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={activeAgents.length > 0 ? 'success' : 'default'} dot={activeAgents.length > 0}>
            {activeAgents.length} Active {activeAgents.length === 1 ? 'Worker' : 'Workers'}
          </Badge>
          {spotlightTask ? (
            <Link href="/agents">
              <Button size="sm" variant="primary">
                <Play className="h-3.5 w-3.5 mr-1" /> Inspect Task
              </Button>
            </Link>
          ) : (
            <Link href="/projects">
              <Button size="sm" variant="primary">
                <Plus className="h-3.5 w-3.5 mr-1" /> New Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          Control Plane connection issue: {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between text-xs text-[#94a3b8] font-mono">
            <span>ACTIVE AGENTS</span>
            <Bot className="h-4 w-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#f1f5f9] mt-2">{activeAgents.length}</div>
          <div className="text-[10px] text-[#64748b] mt-1">
            {activeAgents.length === 0 ? 'No agents currently running' : `${activeAgents.length} connected to cluster`}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-[#94a3b8] font-mono">
            <span>PENDING APPROVALS</span>
            <ShieldAlert className="h-4 w-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#fbbf24] mt-2">{pendingApprovals.length}</div>
          <div className="text-[10px] text-[#f59e0b] mt-1">
            {pendingApprovals.length === 0 ? 'Zero pending gates' : 'Requires human verification'}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-[#94a3b8] font-mono">
            <span>ACTIVE PROJECTS</span>
            <FolderGit2 className="h-4 w-4 text-[#06b6d4]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#f1f5f9] mt-2">{projects.length}</div>
          <div className="text-[10px] text-[#64748b] mt-1">
            {projects.length === 0 ? 'No registered repositories' : 'Synchronized in database'}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-[#94a3b8] font-mono">
            <span>MONTHLY USAGE</span>
            <Coins className="h-4 w-4 text-[#34d399]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#f1f5f9] mt-2">
            {usage ? formatCurrency(parseFloat(usage.estimatedCostUsd || '0')) : '$0.00'}
          </div>
          <div className="text-[10px] text-[#64748b] mt-1">
            {usage ? `${usage.percentBudgetUsed || 0}% of $${usage.budgetCapUsd || '75'} budget cap` : 'No usage recorded yet'}
          </div>
        </Card>
      </div>

      {/* Main Grid: Running Task Spotlight & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Agent Task Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-[#0f1416] border-b border-[#1c2529] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#10b981]" />
                <span className="font-semibold text-xs text-[#f1f5f9]">Live Agent Execution Stream</span>
              </div>
              {spotlightTask && (
                <Badge variant={spotlightTask.status === 'WAITING_FOR_APPROVAL' ? 'warning' : 'success'} dot>
                  {spotlightTask.status.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>

            {spotlightTask ? (
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#f1f5f9]">
                      Agent: {spotlightTask.agentId || 'Autonomous Worker'}
                    </div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">
                      Task: {spotlightTask.title}
                    </div>
                  </div>
                  <Link href={`/agents`}>
                    <Button variant="outline" size="sm">
                      Open Full Workspace <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="p-3 bg-[#080b0c] border border-[#1c2529] rounded font-mono text-[11px] space-y-1 text-[#94a3b8]">
                  <div className="text-[#64748b]">&gt; Branch: {spotlightTask.branch || 'main'} • Ref: {spotlightTask.commitSha || 'HEAD'}</div>
                  <div className="text-[#34d399]">Mode: {spotlightTask.executionMode || 'CLOUD'}</div>
                  {spotlightTask.prompt && (
                    <div className="text-[#cbd5e1] line-clamp-2 mt-1">Prompt: {spotlightTask.prompt}</div>
                  )}
                </div>

                {pendingApprovals.length > 0 && (
                  <div className="p-3 bg-[#13100a] border border-[#f59e0b]/30 rounded flex items-center justify-between text-xs">
                    <span className="text-[#fbbf24]">
                      {pendingApprovals[0].action} requires human authorization
                    </span>
                    <Link href="/approvals">
                      <Button variant="primary" size="sm">
                        Review Approval
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-[#64748b] space-y-2">
                <Terminal className="h-6 w-6 mx-auto text-[#64748b]" />
                <div className="text-[#f1f5f9] font-medium">No tasks currently executing</div>
                <p>Dispatch a task from a project workspace to stream live autonomous execution.</p>
              </div>
            )}
          </Card>

          {/* Connected Projects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#94a3b8]">
              <span className="font-mono uppercase tracking-wider">Active Projects</span>
              <Link href="/projects" className="text-[#10b981] hover:underline">
                View all ({projects.length})
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 text-center bg-[#0f1416] border border-[#1c2529] rounded-lg text-xs text-[#64748b]">
                No projects registered yet. Register a local folder via Desktop Connector or add one from Projects page.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.slice(0, 4).map((proj) => (
                  <Link key={proj.id} href={`/projects/${proj.id}`}>
                    <Card hoverable className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#f1f5f9]">{proj.name}</span>
                        <Badge variant="outline">{proj.executionMode || 'CLOUD'}</Badge>
                      </div>
                      <p className="text-[11px] text-[#94a3b8] line-clamp-1">{proj.description || 'No description'}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#64748b] pt-1 border-t border-[#1c2529]">
                        <span>{proj.defaultBranch || 'main'}</span>
                        <span>{proj.status || 'ACTIVE'}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Approvals, Deployments & Devices (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Actionable Approvals */}
          <Card>
            <CardHeader className="pb-2 mb-2">
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#f59e0b]" /> Pending Approvals
              </CardTitle>
            </CardHeader>
            {pendingApprovals.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#64748b]">
                <CheckCircle2 className="h-5 w-5 text-[#10b981] mx-auto mb-1" />
                No pending approval gates.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((appr) => (
                  <div key={appr.id} className="p-3 rounded bg-[#0a0d0e] border border-[#1c2529] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#f1f5f9]">{appr.action}</span>
                      <Badge variant="warning">{appr.riskLevel || 'HIGH'}</Badge>
                    </div>
                    <p className="text-[11px] text-[#94a3b8]">{appr.reason}</p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#64748b]">{appr.agentId || 'Agent'}</span>
                      <Link href="/approvals">
                        <Button variant="outline" size="sm">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Deployments */}
          <Card>
            <CardHeader className="pb-2 mb-2">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-[#10b981]" /> Live Deployments
              </CardTitle>
            </CardHeader>
            {deployments.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#64748b]">
                No deployments recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {deployments.slice(0, 3).map((dep) => (
                  <div key={dep.id} className="p-2.5 rounded bg-[#0a0d0e] border border-[#1c2529] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#f1f5f9]">{dep.environment}</span>
                      <Badge variant="success">Ready ({dep.durationSeconds || 0}s)</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#64748b]">
                      <GitCommit className="h-3 w-3" />
                      <span>{dep.commitSha || 'HEAD'}</span>
                      <span>•</span>
                      <span className="truncate">{dep.commitMessage || 'Deployment'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Connected Devices */}
          <Card>
            <CardHeader className="pb-2 mb-2">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[#06b6d4]" /> Remote Control Devices
              </CardTitle>
            </CardHeader>
            {devices.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#64748b]">
                No remote devices connected.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {devices.map((dev) => (
                  <div key={dev.id} className="flex items-center justify-between p-2 rounded bg-[#0a0d0e] border border-[#1c2529]">
                    <div>
                      <div className="text-[#f1f5f9] font-medium">{dev.name}</div>
                      <div className="text-[10px] font-mono text-[#64748b]">{dev.version}</div>
                    </div>
                    <Badge variant={dev.status === 'ONLINE' ? 'success' : 'default'} dot>
                      {dev.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
