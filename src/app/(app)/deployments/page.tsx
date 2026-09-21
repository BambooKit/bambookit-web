import React from 'react';
import { Rocket, GitCommit, ExternalLink, RotateCcw, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DEMO_DEPLOYMENTS } from '@/data/mockData';

export default function DeploymentsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Live Deployments &amp; Environments</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Automated production promotions, instant rollbacks, and environment release history.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {DEMO_DEPLOYMENTS.map((dep) => (
          <Card key={dep.id} className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c2529] pb-3">
              <div className="flex items-center gap-2.5">
                <Rocket className="h-5 w-5 text-[#10b981]" />
                <div>
                  <span className="font-semibold text-sm text-[#f1f5f9]">{dep.projectName}</span>
                  <span className="text-xs text-[#94a3b8] ml-2">({dep.environment})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Live ({dep.durationSeconds}s)</Badge>
                <span className="font-mono text-[11px] text-[#64748b]">ID: {dep.id}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-mono text-[#cbd5e1]">
                <GitCommit className="h-4 w-4 text-[#10b981]" />
                <span className="text-[#34d399] font-bold">{dep.commitSha}</span>
                <span>•</span>
                <span className="truncate">{dep.commitMessage}</span>
              </div>

              {dep.url && (
                <a
                  href={dep.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#10b981] hover:underline flex items-center gap-1 font-mono"
                >
                  {dep.url} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1c2529] text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Deployed 12 minutes ago by Backend Agent</span>
              </div>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-3 w-3 mr-1" /> Instant Rollback
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
