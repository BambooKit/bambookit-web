import React from 'react';
import { Shield, Lock, Eye, FileCode2, Network, KeyRound, AlertTriangle } from 'lucide-react';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/Badge';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="success">ENTERPRISE-GRADE AGENT SAFETY</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#f1f5f9] tracking-tight">
            Security &amp; Sandboxing Architecture
          </h1>
          <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">
            Giving an autonomous AI agent access to terminal commands, code repositories, and credentials requires
            rigorous boundary enforcement. BambooKit is built from day one with defense-in-depth isolation.
          </p>
        </div>

        {/* Security Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] space-y-3">
            <div className="h-9 w-9 rounded bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-[#f1f5f9] text-base">Ephemeral Worker Isolation</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Cloud agents run inside unprivileged micro-containers. Each task gets a dedicated temporary filesystem
              snapshot that is securely wiped upon task completion. Workers cannot access sibling tenant processes or
              host infrastructure.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] space-y-3">
            <div className="h-9 w-9 rounded bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Network className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-[#f1f5f9] text-base">Outbound-Only Desktop Connector</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              When executing tasks on your local workstation, the BambooKit connector establishes a secure outbound TLS
              WebSocket to our control plane. It never exposes listening ports or open ingress proxies on your local
              network.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] space-y-3">
            <div className="h-9 w-9 rounded bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-[#f1f5f9] text-base">Zero Raw Secret Leakage</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Environment variables and API keys are stored in hardware-backed key vaults. Secrets injected into builds
              are redacted from agent prompts, terminal logs, and event streams. Agents never receive plaintext production
              keys.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] space-y-3">
            <div className="h-9 w-9 rounded bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-[#f1f5f9] text-base">Interactive Human Approval Gates</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Dangerous operations—such as installing external npm packages, modifying infrastructure scripts, altering
              database tables, or deploying to production—are paused until explicitly authorized by a developer.
            </p>
          </div>
        </div>

        {/* Honest Disclosure Callout */}
        <div className="p-5 rounded-lg bg-[#14120c] border border-[#f59e0b]/20 flex items-start gap-3 text-xs text-[#fbbf24]">
          <AlertTriangle className="h-5 w-5 text-[#f59e0b] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-medium text-[#f1f5f9]">Honest Security Commitments</div>
            <div className="text-[#cbd5e1] leading-relaxed">
              BambooKit does not make deceptive &quot;100% unbreakable AI&quot; marketing claims. AI models can make mistakes;
              our software exists to strictly constrain their blast radius using deterministic operating-system sandboxing,
              immutable audit ledgers, and human-in-the-loop policies.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
