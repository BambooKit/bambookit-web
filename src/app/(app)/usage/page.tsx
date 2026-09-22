'use client';

import React, { useEffect, useState } from 'react';
import { Coins, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { liveApi } from '@/services/liveApi';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function UsagePage() {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liveApi
      .getUsage()
      .then((data) => {
        setUsage(data || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const cost = usage ? parseFloat(usage.estimatedCostUsd || '0') : 0;
  const budgetCap = usage ? parseFloat(usage.budgetCapUsd || '75') : 75;
  const percentUsed = budgetCap > 0 ? Math.min(100, Math.round((cost / budgetCap) * 100)) : 0;
  const totalTokens = (usage?.inputTokens || 0) + (usage?.outputTokens || 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Usage &amp; Budget Firewall</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Monitor AI token expenditures, cloud worker compute seconds, and enforce strict spending circuit breakers.
          </p>
        </div>
        <Button size="sm">Adjust Firewall Limits</Button>
      </div>

      {loading && (
        <div className="p-12 text-center text-[#64748b] font-mono text-xs">
          Loading usage telemetry from control plane...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          Failed to load usage data: {error}
        </div>
      )}

      {!loading && (
        <>
          {/* Budget Firewall Alert Bar */}
          <Card className="p-4 border-[#10b981]/30 bg-[#0c1412] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#34d399] font-medium">
                <ShieldCheck className="h-4 w-4 text-[#10b981]" /> Monthly Budget Firewall Active
              </div>
              <span className="font-mono text-[#cbd5e1]">
                {formatCurrency(cost)} / {formatCurrency(budgetCap)} ({percentUsed}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#1c2529] h-2 rounded-full overflow-hidden">
              <div className="bg-[#10b981] h-full rounded-full transition-all" style={{ width: `${percentUsed}%` }} />
            </div>

            <p className="text-[11px] text-[#94a3b8]">
              Autonomous agents automatically pause and request human authorization if monthly spending crosses 80%.
            </p>
          </Card>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <Card className="p-4 space-y-1">
              <div className="font-mono text-[#64748b]">AI TOKENS (EST)</div>
              <div className="text-xl font-bold font-mono text-[#f1f5f9]">{formatNumber(totalTokens)}</div>
              <div className="text-[10px] text-[#64748b]">Model: {usage?.model || 'claude-3-7-sonnet'}</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="font-mono text-[#64748b]">EPHEMERAL WORKER COMPUTE</div>
              <div className="text-xl font-bold font-mono text-[#34d399]">
                {Math.round((usage?.workerSeconds || 0) / 60)} mins
              </div>
              <div className="text-[10px] text-[#64748b]">Real worker execution time</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="font-mono text-[#64748b]">ESTIMATED COST</div>
              <div className="text-xl font-bold font-mono text-[#f1f5f9]">{formatCurrency(cost)}</div>
              <div className="text-[10px] text-[#64748b]">Direct API provider rates</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="font-mono text-[#64748b]">PERSISTENT STORAGE</div>
              <div className="text-xl font-bold font-mono text-[#f1f5f9]">
                {Math.round((usage?.storageBytes || 0) / (1024 * 1024))} MB
              </div>
              <div className="text-[10px] text-[#64748b]">Drive snapshots &amp; logs</div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
