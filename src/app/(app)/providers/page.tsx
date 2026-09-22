'use client';

import React, { useEffect, useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, RefreshCw, Lock, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { liveApi } from '@/services/liveApi';
import { formatCurrency } from '@/lib/utils';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liveApi
      .getProviders()
      .then((data) => {
        setProviders(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleConnection = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">AI Provider Hub (BYOK)</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Connect your own AI accounts or local runtimes (OpenCode, Kilo, ChatGPT, Gemini, Ollama). BambooKit never marks up token costs.
          </p>
        </div>
        <Badge variant="success">BYOK Active</Badge>
      </div>

      {loading && (
        <div className="p-12 text-center text-[#64748b] font-mono text-xs">
          Loading configured AI providers from control plane...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          Error: {error}
        </div>
      )}

      {!loading && providers.length === 0 && (
        <div className="p-16 text-center bg-[#0f1416] border border-[#1c2529] rounded-xl space-y-3">
          <KeyRound className="h-10 w-10 text-[#64748b] mx-auto" />
          <h3 className="text-sm font-semibold text-[#f1f5f9]">No Providers Configured</h3>
          <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
            Add an API key or local model endpoint to start executing autonomous agent tasks.
          </p>
        </div>
      )}

      {!loading && providers.length > 0 && (
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
                <Badge variant={p.enabled ? 'success' : 'default'} dot>
                  {p.enabled ? 'Connected' : 'Not Configured'}
                </Badge>
              </div>

              <p className="text-xs text-[#94a3b8] leading-relaxed">
                {p.provider === 'ANTHROPIC'
                  ? 'Anthropic Claude models including 3.7 Sonnet for high-reasoning fullstack tasks.'
                  : p.provider === 'OPENAI'
                  ? 'OpenAI GPT-4.5 & o3-mini models via direct developer token.'
                  : p.provider === 'GOOGLE'
                  ? 'Google Gemini 2.5 Pro with large context window processing.'
                  : p.provider === 'OLLAMA'
                  ? 'Local offline models running on your workstation GPU.'
                  : 'Multi-modal AI inference engine.'}
              </p>

              <div className="p-3 bg-[#080b0c] border border-[#1c2529] rounded font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#64748b]">
                  <span>ENDPOINT / KEY</span>
                  <span className="text-[10px] text-[#10b981]">AES-256 GCM SECURED</span>
                </div>
                <div className="text-[#cbd5e1] font-mono text-[11px]">
                  {p.baseUrl || 'https://api.bambookit.dev'} • {p.enabled ? 'sk-••••••••••••••••' : 'No key provided'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1c2529] text-xs">
                <div className="font-mono text-[11px] text-[#64748b]">
                  Status: {p.enabled ? 'Active' : 'Disabled'}
                </div>
                <Button
                  variant={p.enabled ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => toggleConnection(p.id)}
                >
                  {p.enabled ? 'Disconnect' : 'Connect Key'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
