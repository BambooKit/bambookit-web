import React from 'react';
import Link from 'next/link';
import { FolderGit2, GitBranch, ArrowRight, Bot, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DEMO_PROJECTS } from '@/data/mockData';

export default function ProjectsIndexPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Connected Repositories &amp; Projects</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Projects hold execution environments, assigned agent worktrees, and persistent Git history.
          </p>
        </div>
        <Button size="sm">Connect Repository</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_PROJECTS.map((proj) => (
          <Link key={proj.id} href={`/projects/${proj.id}`}>
            <Card hoverable className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4]">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#f1f5f9]">{proj.name}</h3>
                    <div className="text-[11px] font-mono text-[#64748b]">{proj.repository.url}</div>
                  </div>
                </div>
                <Badge variant="outline">{proj.environment}</Badge>
              </div>

              <p className="text-xs text-[#94a3b8] leading-relaxed">{proj.description}</p>

              <div className="p-2.5 rounded bg-[#080b0c] border border-[#1c2529] space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" /> {proj.repository.branch}
                  </span>
                  <span>Commit: {proj.repository.lastCommitSha}</span>
                </div>
                <div className="text-[#cbd5e1] truncate">{proj.repository.lastCommitMessage}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1c2529] text-xs">
                <span className="font-mono text-[11px] text-[#64748b]">
                  {proj.activeAgentsCount} agents active • {proj.totalTasksCount} tasks completed
                </span>
                <span className="text-[#10b981] flex items-center gap-1">
                  Manage Project <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
