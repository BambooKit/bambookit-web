import React from 'react';
import { Navbar, Footer } from '@/components/layout/Navbar';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6 text-xs text-[#94a3b8] leading-relaxed">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Terms of Service</h1>
        <p className="text-[#64748b]">Effective Date: September 2026</p>
        <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] space-y-4">
          <h2 className="text-sm font-semibold text-[#f1f5f9]">1. Control Plane Responsibilities</h2>
          <p>
            BambooKit provides orchestration and isolation software for autonomous software engineering. Users maintain
            complete ownership of generated code, repository commits, and deployments.
          </p>
          <h2 className="text-sm font-semibold text-[#f1f5f9]">2. Human Oversight &amp; Dangerous Operations</h2>
          <p>
            While BambooKit enforces strict permission policies and approval gates, developers are ultimately responsible
            for reviewing diffs and granting approvals before code is promoted to live production environments.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
