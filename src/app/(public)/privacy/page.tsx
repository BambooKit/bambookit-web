import React from 'react';
import { Navbar, Footer } from '@/components/layout/Navbar';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6 text-xs text-[#94a3b8] leading-relaxed">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Privacy Policy</h1>
        <p className="text-[#64748b]">Effective Date: September 2026</p>
        <div className="p-6 rounded-lg bg-[#0f1416] border border-[#1c2529] space-y-4">
          <h2 className="text-sm font-semibold text-[#f1f5f9]">1. Zero Model Training on Code</h2>
          <p>
            BambooKit does not sell, inspect, or use your proprietary codebase, repositories, or prompts to train AI models.
            When using BYOK mode, tokens stream directly between your isolated sandbox and your authorized AI provider.
          </p>
          <h2 className="text-sm font-semibold text-[#f1f5f9]">2. Ephemeral Storage</h2>
          <p>
            Cloud worker disks are wiped securely immediately after agent task completion. Artifacts, diff summaries, and
            replay timelines remain encrypted at rest within your workspace ledger.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
