import React from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1c2529] bg-[#0a0d0e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] group-hover:border-[#10b981]/60 transition-colors">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-semibold text-base tracking-tight text-[#f1f5f9]">
              Bamboo<span className="text-[#10b981]">Kit</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#94a3b8]">
            <Link href="/pricing" className="hover:text-[#f1f5f9] transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-[#f1f5f9] transition-colors">
              Docs
            </Link>
            <Link href="/security" className="hover:text-[#f1f5f9] transition-colors">
              Security
            </Link>
            <Link href="/status" className="hover:text-[#f1f5f9] transition-colors">
              Status
            </Link>
            <Link href="/changelog" className="hover:text-[#f1f5f9] transition-colors">
              Changelog
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Live Console
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#1c2529] bg-[#080b0c] text-xs text-[#64748b] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-[#f1f5f9] font-medium text-sm">
            <div className="h-6 w-6 rounded bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Layers className="h-3.5 w-3.5" />
            </div>
            BambooKit
          </div>
          <p className="max-w-sm text-[#94a3b8] leading-relaxed">
            The control plane for autonomous AI software engineers. Orchestrate, persist, enforce boundaries, review diffs,
            and monitor execution from web, mobile, and desktop.
          </p>
          <div className="text-[11px] text-[#475569]">
            © {new Date().getFullYear()} BambooKit Inc. Built for autonomous developer infrastructure.
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-[#f1f5f9] mb-3">Product</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="hover:text-[#f1f5f9] transition-colors">
                Console Dashboard
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-[#f1f5f9] transition-colors">
                Pricing (BYOK)
              </Link>
            </li>
            <li>
              <Link href="/security" className="hover:text-[#f1f5f9] transition-colors">
                Security &amp; Sandboxing
              </Link>
            </li>
            <li>
              <Link href="/status" className="hover:text-[#f1f5f9] transition-colors">
                System Status
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[#f1f5f9] mb-3">Resources</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/docs" className="hover:text-[#f1f5f9] transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="hover:text-[#f1f5f9] transition-colors">
                Changelog
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/BambooKit"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#f1f5f9] transition-colors"
              >
                GitHub Organization
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[#f1f5f9] mb-3">Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy" className="hover:text-[#f1f5f9] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#f1f5f9] transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
