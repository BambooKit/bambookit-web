'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderGit2, GitBranch, ArrowRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { liveApi } from '@/services/liveApi';

export default function ProjectsIndexPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liveApi
      .getProjects()
      .then((data) => {
        setProjects(data || []);
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
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Connected Repositories &amp; Projects</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Real projects connected to the BambooKit API Control Plane.
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5 mr-1" /> New Project
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="p-12 text-center text-[#64748b] font-mono text-xs">
          Loading projects from BambooKit API...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          Could not connect to API: {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="p-16 text-center bg-[#0f1416] border border-[#1c2529] rounded-xl space-y-3">
          <FolderGit2 className="h-10 w-10 text-[#64748b] mx-auto" />
          <h3 className="text-sm font-semibold text-[#f1f5f9]">No Projects Registered</h3>
          <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
            Register a project locally through Windows Desktop Connector or initialize a new project workspace.
          </p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <Link key={proj.id} href={`/projects/${proj.id}`}>
              <Card hoverable className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4]">
                      <FolderGit2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#f1f5f9]">{proj.name}</h3>
                      <div className="text-[11px] font-mono text-[#64748b]">ID: {proj.id}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{proj.executionMode || 'CLOUD'}</Badge>
                </div>

                <p className="text-xs text-[#94a3b8] leading-relaxed">{proj.description || 'No description provided.'}</p>

                <div className="p-2.5 rounded bg-[#080b0c] border border-[#1c2529] space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-[#64748b]">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" /> {proj.defaultBranch || 'main'}
                    </span>
                    <span>Status: {proj.status || 'ACTIVE'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1c2529] text-xs">
                  <span className="font-mono text-[11px] text-[#64748b]">
                    Created: {new Date(proj.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[#10b981] flex items-center gap-1">
                    Manage Project <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

