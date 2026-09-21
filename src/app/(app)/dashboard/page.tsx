import React from 'react';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import {
  DEMO_PROJECTS,
  DEMO_AGENTS,
  DEMO_APPROVALS,
  DEMO_DEPLOYMENTS,
  DEMO_USAGE,
  DEMO_DEVICES,
} from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const activeAgents = DEMO_AGENTS.filter((a) => a.status === 'running' || a.status === 'waiting');
  const pendingApprovals = DEMO_APPROVALS.filter((a) => a.status === 'pending');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner: Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Control Plane Overview</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Real-time status across active agent workers, pending approvals, and connected devices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>
            2 Active Workers
          </Badge>
          <Link href="/agents/agent_backend_sonnet">
            <Button size="sm" variant="primary">
              <Play className="h-3.5 w-3.5 mr-1" /> Inspect Running Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between text-xs text-[#94a3b8] font-mono">
            <span>ACTIVE AGENTS</span>
            <Bot className="h-4 w-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#f1f5f9] mt-2">{activeAgents.length}</div>
          <div className="text-[10px] text-[#64748b] mt-1">Claude 3.7 &amp; Gemini 2.5 active</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-[#94a3b8] font-mono">
            <span>PENDING APPROVALS</span>
            <ShieldAlert className="h-4 w-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#fbbf24] mt-2">{pendingApprovals.length}</div>
          <div className="text-[10px] text-[#f59e0b] mt-1">Requires human verification</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-[#94a3b8] font-mono">
            <span>ACTIVE PROJECTS</span>
            <FolderGit2 className="h-4 w-4 text-[#06b6d4]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#f1f5f9] mt-2">{DEMO_PROJECTS.length}</div>
          <div className="text-[10px] text-[#64748b] mt-1">All repositories synchronized</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-[#94a3b8] font-mono">
            <span>MONTHLY USAGE</span>
            <Coins className="h-4 w-4 text-[#34d399]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#f1f5f9] mt-2">
            {formatCurrency(DEMO_USAGE.aiCostEstUsd)}
          </div>
          <div className="text-[10px] text-[#64748b] mt-1">58% of $75 budget cap</div>
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
              <Badge variant="warning" dot>
                Waiting for Human Approval
              </Badge>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#f1f5f9]">
                    Backend Agent (Claude 3.7 Sonnet)
                  </div>
                  <div className="text-[11px] text-[#94a3b8] mt-0.5">
                    Task: Add Google authentication and session callback flow
                  </div>
                </div>
                <Link href="/agents/agent_backend_sonnet">
                  <Button variant="outline" size="sm">
                    Open Full Workspace <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* Mini Terminal Execution Snippet */}
              <div className="p-3 bg-[#080b0c] border border-[#1c2529] rounded font-mono text-[11px] space-y-1 text-[#94a3b8]">
                <div className="text-[#64748b]">&gt; git checkout -b feat/google-auth</div>
                <div className="text-[#34d399]">+ Modified src/lib/auth.ts (+46, -12)</div>
                <div className="text-[#34d399]">+ Created src/app/api/auth/[...nextauth]/route.ts</div>
                <div className="text-[#10b981]">✓ 24 tests passed across 4 test suites</div>
                <div className="text-[#f59e0b]">! Gate triggered: Deployment to Production requires approval</div>
              </div>

              {/* Action Banner */}
              <div className="p-3 bg-[#13100a] border border-[#f59e0b]/30 rounded flex items-center justify-between text-xs">
                <span className="text-[#fbbf24]">
                  Deploy commit <code>8f31c2a</code> to live production cluster?
                </span>
                <Link href="/approvals">
                  <Button variant="primary" size="sm">
                    Review Approval
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Connected Projects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#94a3b8]">
              <span className="font-mono uppercase tracking-wider">Active Projects</span>
              <Link href="/projects" className="text-[#10b981] hover:underline">
                View all ({DEMO_PROJECTS.length})
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_PROJECTS.map((proj) => (
                <Link key={proj.id} href={`/projects/${proj.id}`}>
                  <Card hoverable className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#f1f5f9]">{proj.name}</span>
                      <Badge variant="outline">{proj.environment}</Badge>
                    </div>
                    <p className="text-[11px] text-[#94a3b8] line-clamp-1">{proj.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#64748b] pt-1 border-t border-[#1c2529]">
                      <span>{proj.repository.branch}</span>
                      <span>{proj.activeAgentsCount} agents active</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
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
            <div className="space-y-3">
              {pendingApprovals.map((appr) => (
                <div key={appr.id} className="p-3 rounded bg-[#0a0d0e] border border-[#1c2529] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#f1f5f9]">{appr.action}</span>
                    <Badge variant="warning">{appr.risk}</Badge>
                  </div>
                  <p className="text-[11px] text-[#94a3b8]">{appr.reason}</p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#64748b]">{appr.agentName}</span>
                    <Link href="/approvals">
                      <Button variant="outline" size="sm">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Deployments */}
          <Card>
            <CardHeader className="pb-2 mb-2">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-[#10b981]" /> Live Deployments
              </CardTitle>
            </CardHeader>
            <div className="space-y-2.5 text-xs">
              {DEMO_DEPLOYMENTS.map((dep) => (
                <div key={dep.id} className="p-2.5 rounded bg-[#0a0d0e] border border-[#1c2529] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#f1f5f9]">{dep.projectName}</span>
                    <Badge variant="success">Live ({dep.durationSeconds}s)</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#64748b]">
                    <GitCommit className="h-3 w-3" />
                    <span>{dep.commitSha}</span>
                    <span>•</span>
                    <span className="truncate">{dep.commitMessage}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Connected Devices */}
          <Card>
            <CardHeader className="pb-2 mb-2">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[#06b6d4]" /> Remote Control Devices
              </CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs">
              {DEMO_DEVICES.map((dev) => (
                <div key={dev.id} className="flex items-center justify-between p-2 rounded bg-[#0a0d0e] border border-[#1c2529]">
                  <div>
                    <div className="text-[#f1f5f9] font-medium">{dev.name}</div>
                    <div className="text-[10px] font-mono text-[#64748b]">{dev.version}</div>
                  </div>
                  <Badge variant={dev.status === 'online' ? 'success' : 'default'} dot>
                    {dev.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
