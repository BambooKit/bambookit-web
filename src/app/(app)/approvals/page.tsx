'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { liveApi } from '@/services/liveApi';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadApprovals = () => {
    setLoading(true);
    liveApi
      .getApprovals()
      .then((data) => {
        setApprovals(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED', scope: string = 'ONCE') => {
    try {
      await liveApi.respondApproval(id, status, `Authorized as ${scope} execution from Web Console`);
      setActionSuccessMsg(
        status === 'APPROVED'
          ? `Authorized execution successfully. Triggering pipeline...`
          : 'Action was rejected. Agent was notified to abort risky step.'
      );
      loadApprovals();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Approval decision failed: ${err.message}`);
    }
  };

  const pending = approvals.filter((a) => a.status === 'PENDING');
  const resolved = approvals.filter((a) => a.status !== 'PENDING');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Dangerous Action Approval Gates</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            BambooKit pauses autonomous execution when an agent touches sensitive infrastructure, credentials, or production.
          </p>
        </div>
        <Badge variant={pending.length > 0 ? 'warning' : 'success'}>
          {pending.length} Pending Actions
        </Badge>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-[#10b981]/15 border border-[#10b981]/30 rounded-lg text-xs text-[#34d399] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          Failed to fetch approvals from API: {error}
        </div>
      )}

      {/* Pending Approvals */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase text-[#f59e0b] tracking-wider">Awaiting Human Review</h2>

        {loading && (
          <div className="p-8 text-center text-xs font-mono text-[#64748b]">
            Loading approvals from control plane...
          </div>
        )}

        {!loading && pending.length === 0 && (
          <Card className="p-8 text-center text-xs text-[#64748b] space-y-2">
            <CheckCircle2 className="h-8 w-8 text-[#10b981] mx-auto" />
            <div className="text-[#f1f5f9] font-medium">All clear — Zero pending approval gates</div>
            <p>Agents will prompt you automatically when risky boundaries are encountered.</p>
          </Card>
        )}

        {!loading &&
          pending.map((appr) => (
            <Card key={appr.id} className="p-5 space-y-4 border-[#f59e0b]/30 bg-[#0e1214]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c2529] pb-3">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="h-5 w-5 text-[#f59e0b]" />
                  <div>
                    <span className="font-semibold text-sm text-[#f1f5f9]">{appr.action}</span>
                    <span className="text-xs text-[#94a3b8] ml-2">requested by {appr.agentId || 'Autonomous Agent'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={appr.riskLevel === 'HIGH' ? 'danger' : 'warning'}>{appr.riskLevel} risk</Badge>
                  <span className="font-mono text-[11px] text-[#64748b]">ID: {appr.id}</span>
                </div>
              </div>

              <p className="text-xs text-[#cbd5e1] leading-relaxed">{appr.reason}</p>

              {/* Affected Resources */}
              {appr.resources && appr.resources.length > 0 && (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="text-[#64748b]">AFFECTED RESOURCES:</div>
                  <div className="flex flex-wrap gap-2">
                    {appr.resources.map((res: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#151b1e] border border-[#1c2529] text-[#94a3b8]">
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Command / Details Preview */}
              {appr.details?.command && (
                <div className="p-2.5 rounded bg-[#080b0c] border border-[#1c2529] font-mono text-[11px] text-[#34d399]">
                  &gt; {appr.details.command}
                </div>
              )}

              {/* Decision Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1c2529]">
                <div className="text-[11px] text-[#64748b] font-mono">Scope: Select authorization boundary</div>
                <div className="flex items-center gap-2">
                  <Button variant="danger" size="sm" onClick={() => handleAction(appr.id, 'REJECTED', 'ONCE')}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Action
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleAction(appr.id, 'APPROVED', 'TASK')}>
                    Approve for Task
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleAction(appr.id, 'APPROVED', 'ONCE')}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve Once
                  </Button>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Resolved Approvals History */}
      {!loading && resolved.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-[#1c2529]">
          <h2 className="text-xs font-mono uppercase text-[#64748b] tracking-wider">Historical Gate Audits</h2>
          <div className="divide-y divide-[#1c2529] border border-[#1c2529] rounded-lg bg-[#0f1416]">
            {resolved.map((appr) => (
              <div key={appr.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#f1f5f9]">{appr.action}</span>
                  <span className="text-[#64748b] ml-2">by {appr.agentId || 'Agent'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#64748b]">
                    {appr.resolvedById ? `resolved by ${appr.resolvedById}` : 'audit resolved'}
                  </span>
                  <Badge variant={appr.status === 'APPROVED' ? 'success' : 'danger'}>{appr.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
