import React from 'react';
import { Coins, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DEMO_USAGE } from '@/data/mockData';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function UsagePage() {
  const percentUsed = Math.round((DEMO_USAGE.aiCostEstUsd / DEMO_USAGE.budgetCapUsd) * 100);

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

      {/* Budget Firewall Alert Bar */}
      <Card className="p-4 border-[#10b981]/30 bg-[#0c1412] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#34d399] font-medium">
            <ShieldCheck className="h-4 w-4 text-[#10b981]" /> Monthly Budget Firewall Active
          </div>
          <span className="font-mono text-[#cbd5e1]">
            {formatCurrency(DEMO_USAGE.aiCostEstUsd)} / {formatCurrency(DEMO_USAGE.budgetCapUsd)} ({percentUsed}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#1c2529] h-2 rounded-full overflow-hidden">
          <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${percentUsed}%` }} />
        </div>

        <p className="text-[11px] text-[#94a3b8]">
          Agents will automatically pause and request human authorization if monthly spending crosses 80% ($60.00).
        </p>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <Card className="p-4 space-y-1">
          <div className="font-mono text-[#64748b]">AI TOKENS (EST)</div>
          <div className="text-xl font-bold font-mono text-[#f1f5f9]">{formatNumber(DEMO_USAGE.aiTokensTotal)}</div>
          <div className="text-[10px] text-[#64748b]">Across Anthropic &amp; OpenAI</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="font-mono text-[#64748b]">EPHEMERAL WORKER COMPUTE</div>
          <div className="text-xl font-bold font-mono text-[#34d399]">
            {Math.round(DEMO_USAGE.workerSecondsTotal / 60)} mins
          </div>
          <div className="text-[10px] text-[#64748b]">Auto-shutdown on idle</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="font-mono text-[#64748b]">DEPLOYMENTS TRIGGERED</div>
          <div className="text-xl font-bold font-mono text-[#f1f5f9]">{DEMO_USAGE.deploymentsCount}</div>
          <div className="text-[10px] text-[#64748b]">Production &amp; Staging builds</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="font-mono text-[#64748b]">PERSISTENT STORAGE</div>
          <div className="text-xl font-bold font-mono text-[#f1f5f9]">{DEMO_USAGE.storageMb} MB</div>
          <div className="text-[10px] text-[#64748b]">Git diffs &amp; replay ledgers</div>
        </Card>
      </div>
    </div>
  );
}
