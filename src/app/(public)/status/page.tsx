import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/Badge';

export default function StatusPage() {
  const systems = [
    { name: 'Control Plane API Gateway', status: 'operational', uptime: '99.98%', latency: '14ms' },
    { name: 'Cloud Worker Provisioner (us-east-1)', status: 'operational', uptime: '99.95%', latency: '820ms spawn' },
    { name: 'Cloud Worker Provisioner (eu-central-1)', status: 'operational', uptime: '99.99%', latency: '790ms spawn' },
    { name: 'Realtime Event Stream Relay (WebSocket)', status: 'operational', uptime: '100.0%', latency: '8ms' },
    { name: 'Provider Relay (Anthropic / OpenAI / Gemini)', status: 'operational', uptime: '99.92%', latency: 'Pass-through' },
    { name: 'Android Device Push Gateway', status: 'operational', uptime: '99.99%', latency: 'FCM Direct' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="success" dot>ALL SYSTEMS OPERATIONAL</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#f1f5f9]">System Status &amp; Telemetry</h1>
          <p className="text-xs text-[#94a3b8]">Live heartbeat for BambooKit control plane and worker nodes.</p>
        </div>

        <div className="border border-[#1c2529] rounded-lg bg-[#0f1416] divide-y divide-[#1c2529]">
          {systems.map((s, i) => (
            <div key={i} className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                <span className="font-medium text-[#f1f5f9]">{s.name}</span>
              </div>
              <div className="flex items-center gap-6 font-mono text-[#94a3b8]">
                <span>{s.latency}</span>
                <span className="text-[#34d399]">{s.uptime}</span>
                <Badge variant="success">Operational</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-[#0a0d0e] border border-[#1c2529] text-xs text-[#64748b] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Checked every 30 seconds via global health probes.
          </span>
          <span className="font-mono">Simulated production status monitor</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
