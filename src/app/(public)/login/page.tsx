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
          <a
            href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=236404722141-le31cp7pcd9dpnta2haro6nlc9tfud0o.apps.googleusercontent.com&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/callback/google')}&response_type=code&scope=${encodeURIComponent('openid email profile https://www.googleapis.com/auth/drive.file')}&access_type=offline&prompt=consent`}
            className="block"
          >
            <Button variant="secondary" size="md" className="w-full justify-center bg-white text-gray-900 hover:bg-gray-100 border-none font-medium">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign In with Google (@gmail.com)
            </Button>
          </a>

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
              <label className="block text-[#94a3b8] mb-1 font-mono text-[11px]">Developer Email</label>
              <input
                type="email"
                defaultValue="satyampote9999@gmail.com"
                className="w-full px-3 py-2 bg-[#080b0c] border border-[#1c2529] rounded text-[#f1f5f9] focus:outline-none focus:border-[#10b981]"
                placeholder="developer@gmail.com"
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
