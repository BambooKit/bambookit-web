import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Terminal,
  Smartphone,
  Cpu,
  KeyRound,
  GitPullRequest,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Coins,
  History,
  Lock,
} from 'lucide-react';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { HeroSimulator } from '@/components/layout/HeroSimulator';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BAMBOOKIT_PLANS } from '@/config/product';
import { formatInr } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 overflow-hidden border-b border-[#1c2529]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1c2529_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 text-xs font-mono text-[#34d399]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            BAMBOOKIT v1.0 • AI AGENT CONTROL PLANE
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#f1f5f9] max-w-4xl mx-auto leading-tight sm:leading-none">
            Control your AI software engineers <span className="text-[#10b981]">from anywhere</span>.
          </h1>

          <p className="text-base sm:text-lg text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
            Run coding agents locally or in the cloud. BambooKit manages permissions, persistent project state, security
            boundaries, approval gates, and observability—without keeping your laptop awake.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="shadow-lg shadow-[#10b981]/20">
                Launch Live Console <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg">
                Read Architecture Docs
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> 100% BYOK (Bring Your Own Key)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> Ephemeral Cloud Workers
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> Outbound-only Desktop Connector
            </span>
          </div>

          {/* Interactive Hero Simulator */}
          <div className="pt-10">
            <HeroSimulator />
          </div>
        </div>
      </section>

      {/* Core Architecture Value Props */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#10b981]">Beyond AI Token Wrappers</h2>
          <p className="text-2xl sm:text-3xl font-semibold text-[#f1f5f9] tracking-tight">
            The infrastructure layer autonomous agents were missing.
          </p>
          <p className="text-sm text-[#94a3b8]">
            AI models can generate code, but software engineering requires isolation, persistence, guardrails, and
            lifecycle control. BambooKit wraps your coding agents with production-grade control plane primitives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] hover:border-[#27343a] transition-all space-y-3">
            <div className="h-10 w-10 rounded-md bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f1f5f9]">Security Firewall &amp; Approvals</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Never let an agent access production credentials, drop database tables, or execute unauthorized network
              requests without interactive human approval.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] hover:border-[#27343a] transition-all space-y-3">
            <div className="h-10 w-10 rounded-md bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f1f5f9]">Mobile &amp; Remote Control</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Dispatch tasks and approve production deployments from your Android phone. Ephemeral cloud workers execute
              work continuously while you are away.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] hover:border-[#27343a] transition-all space-y-3">
            <div className="h-10 w-10 rounded-md bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <History className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f1f5f9]">Agent Replay &amp; Diff Audit</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Step back through every file read, terminal execution, diff chunk, test result, and thought token with an
              interactive time-travel scrubber.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] hover:border-[#27343a] transition-all space-y-3">
            <div className="h-10 w-10 rounded-md bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f1f5f9]">True BYOK Independence</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Connect your own OpenAI, Anthropic, Gemini, OpenRouter, or local Ollama instances. BambooKit charges for
              control plane features, not model markups.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] hover:border-[#27343a] transition-all space-y-3">
            <div className="h-10 w-10 rounded-md bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f1f5f9]">Ephemeral Cloud Workers</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Workers spin up on demand in isolated sandboxes, clone your repository, run the agent, commit results, and
              shut down immediately to prevent idle costs.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] hover:border-[#27343a] transition-all space-y-3">
            <div className="h-10 w-10 rounded-md bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <Coins className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f1f5f9]">Budget Firewall</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Set hard spending limits per task, per agent, and per project. Terminate runaway agent loops before they run
              up unexpected API provider invoices.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Diagram Section */}
      <section className="py-16 bg-[#080b0c] border-y border-[#1c2529]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs font-mono text-[#10b981] uppercase tracking-wider mb-2">Control Plane Architecture</h2>
            <p className="text-2xl font-bold text-[#f1f5f9]">How BambooKit Enforces Safety &amp; State</p>
          </div>

          <div className="p-6 rounded-xl bg-[#0c1012] border border-[#1c2529] font-mono text-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-[#151b1e] border border-[#1c2529] space-y-1">
                <div className="text-[#34d399] font-semibold">1. Client Trigger</div>
                <div className="text-[#94a3b8] text-[11px]">Android App, Web Console, or CLI</div>
              </div>
              <div className="p-4 rounded-lg bg-[#151b1e] border border-[#1c2529] space-y-1">
                <div className="text-[#34d399] font-semibold">2. Control Plane</div>
                <div className="text-[#94a3b8] text-[11px]">Task Queue, Policy Engine &amp; DB</div>
              </div>
              <div className="p-4 rounded-lg bg-[#151b1e] border border-[#1c2529] space-y-1">
                <div className="text-[#34d399] font-semibold">3. Execution Worker</div>
                <div className="text-[#94a3b8] text-[11px]">Isolated VM / Desktop Connector</div>
              </div>
              <div className="p-4 rounded-lg bg-[#151b1e] border border-[#1c2529] space-y-1">
                <div className="text-[#34d399] font-semibold">4. Audit &amp; Persist</div>
                <div className="text-[#94a3b8] text-[11px]">Replay Events, Git Diff, Artifacts</div>
              </div>
            </div>
            <div className="text-center text-[11px] text-[#64748b] pt-2">
              All agent actions stream back in real time over authenticated outbound TLS connections. Workers hold zero
              unauthorized access keys.
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#10b981]">Transparent Pricing</h2>
          <p className="text-2xl sm:text-3xl font-semibold text-[#f1f5f9]">Control Plane Infrastructure Plans</p>
          <p className="text-xs sm:text-sm text-[#94a3b8]">
            Pay only for BambooKit coordination and persistent environments. You bring your own AI API keys or local models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {BAMBOOKIT_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-lg flex flex-col justify-between border transition-all ${
                plan.isPopular
                  ? 'bg-[#0f1816] border-[#10b981]/50 shadow-xl shadow-[#10b981]/5'
                  : 'bg-[#0f1416] border-[#1c2529]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base text-[#f1f5f9]">{plan.name}</h3>
                  {plan.isPopular && <Badge variant="success">POPULAR</Badge>}
                </div>

                <div>
                  <span className="text-3xl font-bold font-mono text-[#f1f5f9]">
                    {plan.priceInr === 0 ? (plan.id === 'free' ? '₹0' : 'Custom') : formatInr(plan.priceInr)}
                  </span>
                  {plan.priceInr > 0 && <span className="text-xs text-[#64748b] font-mono"> / month</span>}
                </div>

                <p className="text-xs text-[#94a3b8] leading-relaxed">{plan.description}</p>

                <ul className="space-y-2 pt-2 text-xs text-[#cbd5e1]">
                  {plan.features.slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link href={plan.id === 'enterprise' ? '/contact' : '/dashboard'}>
                  <Button
                    variant={plan.isPopular ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full"
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 bg-[#0c1012] border-t border-[#1c2529]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-[#f1f5f9]">Ready to supervise your AI software engineers?</h2>
          <p className="text-sm text-[#94a3b8] max-w-xl mx-auto">
            Experience the interactive control plane today. Inspect live tasks, test human approval gates, and step
            through agent replay events.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg">Explore Console Demo</Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg">
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
