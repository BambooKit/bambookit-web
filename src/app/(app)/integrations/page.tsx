import React from 'react';
import { Cpu, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DEMO_INTEGRATIONS } from '@/data/mockData';

export default function IntegrationsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Ecosystem Integrations</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Connect version control platforms, serverless hosts, alerting webhooks, and issue trackers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_INTEGRATIONS.map((int) => (
          <Card key={int.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#151b1e] border border-[#1c2529] flex items-center justify-center text-[#10b981]">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#f1f5f9]">{int.name}</h3>
                  <div className="text-[10px] font-mono text-[#64748b] uppercase">{int.category}</div>
                </div>
              </div>
              <Badge
                variant={
                  int.status === 'connected'
                    ? 'success'
                    : int.status === 'available'
                    ? 'info'
                    : 'default'
                }
                dot={int.status === 'connected'}
              >
                {int.status.replace('_', ' ')}
              </Badge>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">{int.description}</p>

            <div className="flex justify-end pt-2 border-t border-[#1c2529]">
              <Button
                variant={int.status === 'connected' ? 'outline' : 'secondary'}
                size="sm"
                disabled={int.status === 'coming_soon'}
              >
                {int.status === 'connected' ? 'Configure' : int.status === 'available' ? 'Connect' : 'Planned'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
