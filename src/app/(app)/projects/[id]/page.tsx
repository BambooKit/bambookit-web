import React from 'react';
import Link from 'next/link';
import { FolderGit2, GitBranch, Bot, ArrowLeft, Cpu, Terminal, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DEMO_PROJECTS, DEMO_AGENTS, DEMO_TASKS } from '@/data/mockData';

export default function ProjectDetailsPage() {
  const project = DEMO_PROJECTS[0]; // BambooKit Web
  const agents = DEMO_AGENTS.filter((a) => a.projectId === project.id);
  const tasks = DEMO_TASKS.filter((t) => t.projectId === project.id);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#f1f5f9]">{project.name}</h1>
              <Badge variant="outline">{project.environment}</Badge>
            </div>
            <p className="text-xs font-mono text-[#64748b] mt-0.5">{project.repository.url}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm">
            <Play className="h-3.5 w-3.5 mr-1" /> Dispatch New Task
          </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <Card className="p-4 space-y-1">
          <div className="font-mono text-[#64748b]">GIT BRANCH &amp; COMMIT</div>
          <div className="font-semibold text-[#f1f5f9] flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5 text-[#10b981]" /> {project.repository.branch} ({project.repository.lastCommitSha})
          </div>
          <div className="text-[11px] text-[#94a3b8] truncate">{project.repository.lastCommitMessage}</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="font-mono text-[#64748b]">ACTIVE AGENTS</div>
          <div className="font-semibold text-[#f1f5f9] flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-[#34d399]" /> {agents.length} Dedicated Runtimes
          </div>
          <div className="text-[11px] text-[#94a3b8]">Backend (Claude 3.7) &amp; Frontend (Gemini 2.5)</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="font-mono text-[#64748b]">TOTAL TASKS COMPLETED</div>
          <div className="font-semibold text-[#f1f5f9]">{project.totalTasksCount} tasks executed</div>
          <div className="text-[11px] text-[#94a3b8]">All changes committed to Git history</div>
        </Card>
      </div>

      {/* Agents Attached to Project */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase text-[#94a3b8] tracking-wider">Assigned Agents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agents.map((ag) => (
            <Card key={ag.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-[#f1f5f9]">{ag.name}</div>
                  <div className="text-[11px] font-mono text-[#64748b]">{ag.model}</div>
                </div>
                <Badge variant={ag.status === 'running' ? 'success' : 'warning'} dot>
                  {ag.status}
                </Badge>
              </div>
              <p className="text-xs text-[#94a3b8]">{ag.description}</p>
              <div className="pt-2 border-t border-[#1c2529] flex justify-end">
                <Link href={`/agents/${ag.id}`}>
                  <Button variant="outline" size="sm">
                    Open Workspace
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
