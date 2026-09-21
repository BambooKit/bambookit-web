import React from 'react';
import Link from 'next/link';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BAMBOOKIT_PLANS } from '@/config/product';
import { formatInr } from '@/lib/utils';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="success">TRANSPARENT CONTROL PLANE PRICING</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#f1f5f9] tracking-tight">
            Predictable infrastructure for autonomous agents.
          </h1>
          <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">
            BambooKit does not resell AI tokens with hidden markups. You bring your own API keys (Anthropic, OpenAI,
            Google, OpenRouter) or local models, and pay only for BambooKit coordination, persistence, workers, and mobile
            access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {BAMBOOKIT_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-lg flex flex-col justify-between border transition-all ${
                plan.isPopular
                  ? 'bg-[#0e1614] border-[#10b981]/50 shadow-xl shadow-[#10b981]/5'
                  : 'bg-[#0f1416] border-[#1c2529]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-base text-[#f1f5f9]">{plan.name}</h2>
                  {plan.isPopular && <Badge variant="success">POPULAR</Badge>}
                </div>

                <div>
                  <span className="text-3xl font-bold font-mono text-[#f1f5f9]">
                    {plan.priceInr === 0 ? (plan.id === 'free' ? '₹0' : 'Custom') : formatInr(plan.priceInr)}
                  </span>
                  {plan.priceInr > 0 && <span className="text-xs text-[#64748b] font-mono"> / month</span>}
                </div>

                <p className="text-xs text-[#94a3b8] leading-relaxed">{plan.description}</p>

                <div className="pt-2 border-t border-[#1c2529]">
                  <div className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider mb-2">What is included</div>
                  <ul className="space-y-2 text-xs text-[#cbd5e1]">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/dashboard">
                  <Button variant={plan.isPopular ? 'primary' : 'outline'} size="sm" className="w-full">
                    {plan.id === 'enterprise' ? 'Contact Enterprise' : 'Select Plan'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* BYOK Separation Explainer */}
        <div className="p-6 rounded-xl bg-[#0d1214] border border-[#1c2529] max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-[#34d399] font-mono text-xs uppercase tracking-wider">
            <HelpCircle className="h-4 w-4" /> Understanding BambooKit vs. Third-Party AI Provider Costs
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            When you run an agent in BambooKit, model requests are sent directly using your configured API keys (or local
            Ollama instance). The token charges are billed directly by your AI provider (e.g., Anthropic or OpenAI) at
            their standard developer rates. BambooKit provides the isolated sandboxes, disk snapshots, replay telemetry,
            Git integration, diff reviews, and mobile notifications.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
