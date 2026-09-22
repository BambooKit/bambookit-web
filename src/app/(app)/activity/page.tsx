'use client';

import React, { useEffect, useState } from 'react';
import { Activity as ActivityIcon, User, Bot, Smartphone, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { liveApi } from '@/services/liveApi';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liveApi
      .getActivity()
      .then((data) => {
        setActivities(data || []);
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
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Immutable Activity &amp; Audit Log</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Cryptographically verifiable audit trail of all developer approvals, agent commands, and deployments.
          </p>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-[#64748b] font-mono text-xs">
          Loading audit events from control plane...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          Failed to load audit events: {error}
        </div>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="p-12 text-center bg-[#0f1416] border border-[#1c2529] rounded-lg text-xs text-[#64748b]">
          No audit records found. Real events will be captured automatically as agents execute actions.
        </div>
      )}

      {!loading && activities.length > 0 && (
        <div className="border border-[#1c2529] rounded-lg bg-[#0f1416] divide-y divide-[#1c2529]">
          {activities.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#151b1e] border border-[#1c2529] flex items-center justify-center text-[#10b981]">
                  {item.actorType === 'AGENT' ? (
                    <Bot className="h-4 w-4" />
                  ) : item.actorType === 'USER' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Smartphone className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#f1f5f9]">{item.actorName || item.actorId}</span>
                    <span className="text-[#34d399] font-medium">{item.action}</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#94a3b8] mt-0.5">
                    {item.resourceType} • {item.resourceId}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#64748b] font-mono text-[11px]">
                <Clock className="h-3.5 w-3.5" />
                <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
