import React from 'react';
import Link from 'next/link';
import { Layers, GitFork, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg text-[#f1f5f9]">
              Bamboo<span className="text-[#10b981]">Kit</span>
            </span>
          </Link>
          <h1 className="text-xl font-semibold text-[#f1f5f9]">Developer Sign In</h1>
          <p className="text-xs text-[#94a3b8]">Access your autonomous agent control plane</p>
        </div>

        <div className="p-6 rounded-xl bg-[#0f1416] border border-[#1c2529] space-y-4">
          <Link href="/dashboard" className="block">
            <Button variant="secondary" size="md" className="w-full justify-center">
              <GitFork className="h-4 w-4 mr-2" /> Continue with GitHub
            </Button>
          </Link>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#1c2529] w-full" />
            <span className="bg-[#0f1416] px-2 text-[10px] text-[#64748b] uppercase tracking-wider font-mono absolute">
              or email
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#94a3b8] mb-1 font-mono text-[11px]">Work Email</label>
              <input
                type="email"
                defaultValue="satyam@bambookit.dev"
                className="w-full px-3 py-2 bg-[#080b0c] border border-[#1c2529] rounded text-[#f1f5f9] focus:outline-none focus:border-[#10b981]"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-[#94a3b8] mb-1 font-mono text-[11px]">Access Token / Password</label>
              <input
                type="password"
                defaultValue="••••••••••••••••"
                className="w-full px-3 py-2 bg-[#080b0c] border border-[#1c2529] rounded text-[#f1f5f9] focus:outline-none focus:border-[#10b981]"
              />
            </div>
          </div>

          <Link href="/dashboard" className="block pt-2">
            <Button variant="primary" size="md" className="w-full">
              Sign In to Console <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>

          <div className="p-2.5 rounded bg-[#10b981]/5 border border-[#10b981]/20 text-[11px] text-[#34d399] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Demo Mode: Instant access without credentials.</span>
          </div>
        </div>

        <div className="text-center text-xs text-[#64748b]">
          New to BambooKit?{' '}
          <Link href="/onboarding" className="text-[#10b981] hover:underline">
            Start onboarding wizard
          </Link>
        </div>
      </div>
    </div>
  );
}
