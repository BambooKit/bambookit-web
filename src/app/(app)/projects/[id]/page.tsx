'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FolderGit2, GitBranch, Bot, ArrowLeft, Cpu, Terminal, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { liveApi } from '@/services/liveApi';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = (params?.id as string) || '';

  const [project, setProject] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    Promise.allSettled([
      liveApi.getProjectById(projectId),
      liveApi.getAgents(),
      liveApi.getTasks(projectId),
    ])
      .then(([projRes, agentRes, taskRes]) => {
        if (projRes.status === 'fulfilled') setProject(projRes.value);
        if (agentRes.status === 'fulfilled') setAgents(agentRes.value || []);
        if (taskRes.status === 'fulfilled') setTasks(taskRes.value || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [projectId]);

  const assignedAgents = agents.filter((a) => a.projectId === projectId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#f1f5f9]">{project ? project.name : 'Project Workspace'}</h1>
              {project && <Badge variant="outline">{project.executionMode || 'CLOUD'}</Badge>}
            </div>
            <p className="text-xs font-mono text-[#64748b] mt-0.5">
              {project?.repositoryId ? `Repo: ${project.repositoryId}` : `ID: ${projectId}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-[#1a2327] hover:bg-[#212e34] text-[#38bdf8] border-[#0284c7]/40"
            onClick={() => alert(`Project ${project?.name || ''} synchronized to Google Drive (BambooKit/Projects/)`)}
          >
            <svg className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6m-.57-1L15.42 3.5H8.58l6.85 11.5h6.86z"/>
            </svg>
            Store in Google Drive
          </Button>
          <Button variant="primary" size="sm" onClick={() => alert('Dispatched autonomous task to project sandbox.')}>
            <Play className="h-3.5 w-3.5 mr-1" /> Dispatch New Task
          </Button>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-[#64748b] font-mono text-xs">
          Loading project data from BambooKit API...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          Error loading project: {error}
        </div>
      )}

      {!loading && (
        <>
          {/* Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <Card className="p-4 space-y-1">
              <div className="font-mono text-[#64748b]">GIT BRANCH &amp; STATUS</div>
              <div className="font-semibold text-[#f1f5f9] flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-[#10b981]" /> {project?.defaultBranch || 'main'}
              </div>
              <div className="text-[11px] text-[#94a3b8]">Status: {project?.status || 'ACTIVE'}</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="font-mono text-[#64748b]">ASSIGNED AGENTS</div>
              <div className="font-semibold text-[#f1f5f9] flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-[#34d399]" /> {assignedAgents.length} Dedicated Runtimes
              </div>
              <div className="text-[11px] text-[#94a3b8]">
                {assignedAgents.length === 0 ? 'No agent dedicated to this project' : 'Active and responding to tasks'}
              </div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="font-mono text-[#64748b]">PROJECT TASKS</div>
              <div className="font-semibold text-[#f1f5f9]">{tasks.length} tasks executed</div>
              <div className="text-[11px] text-[#94a3b8]">Registered in API control plane</div>
            </Card>
          </div>

          {/* Agents Attached to Project */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase text-[#94a3b8] tracking-wider">Assigned Agents</h2>
            {assignedAgents.length === 0 ? (
              <div className="p-6 text-center bg-[#0f1416] border border-[#1c2529] rounded-lg text-xs text-[#64748b]">
                No specific agents assigned to this project. Global agents can still execute tasks.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignedAgents.map((ag) => (
                  <Card key={ag.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-[#f1f5f9]">{ag.name}</div>
                        <div className="text-[11px] font-mono text-[#64748b]">{ag.model}</div>
                      </div>
                      <Badge variant={ag.status === 'RUNNING' ? 'success' : 'warning'} dot>
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
