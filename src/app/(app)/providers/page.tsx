'use client';

import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProviderConfig } from '@/types/domain';
import { DEMO_PROVIDERS } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>(DEMO_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfig | null>(null);

  const toggleConnection = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isConnected: !p.isConnected } : p))
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">AI Provider Hub (BYOK)</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Connect your own AI accounts or local runtimes. BambooKit does not resell or mark up third-party tokens.
          </p>
        </div>
        <Badge variant="success">BYOK Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => (
          <Card key={p.id} className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#f1f5f9]">{p.name}</h3>
                  <div className="text-[11px] font-mono text-[#64748b]">Default: {p.defaultModel}</div>
                </div>
              </div>
              <Badge variant={p.isConnected ? 'success' : 'default'} dot>
                {p.isConnected ? 'Connected' : 'Not Configured'}
              </Badge>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">{p.description}</p>

            <div className="p-3 bg-[#080b0c] border border-[#1c2529] rounded font-mono text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#64748b]">
                <span>CREDENTIAL / KEY</span>
                <span className="text-[10px] text-[#10b981]">AES-256 ENCRYPTED</span>
              </div>
              <div className="text-[#cbd5e1] font-mono text-[11px]">
                {p.apiKeyMasked || (p.endpointUrl ? p.endpointUrl : 'No key provided')}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1c2529] text-xs">
              <div className="font-mono text-[11px] text-[#64748b]">
                Monthly Spend: {formatCurrency(p.costMonthlyUsd)}
              </div>
              <Button
                variant={p.isConnected ? 'outline' : 'primary'}
                size="sm"
                onClick={() => toggleConnection(p.id)}
              >
                {p.isConnected ? 'Disconnect' : 'Connect Key'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
