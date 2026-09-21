import React from 'react';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/Badge';

export default function ChangelogPage() {
  const releases = [
    {
      version: 'v1.0.0-rc1',
      date: 'September 2026',
      status: 'Released',
      badgeVariant: 'success' as const,
      highlights: [
        'Initial release of BambooKit Web Control Plane Console.',
        'Interactive Agent Replay scrubber with timeline token inspections.',
        'Unified Diff Viewer supporting side-by-side and inline syntax viewing.',
        'Dangerous Action Human Approval Gates with scope selection.',
        'Full BYOK support for Anthropic Claude 3.7, OpenAI GPT-4.5, Google Gemini 2.5, and local Ollama.',
        'Outbound-only Desktop Connector protocol specification.',
      ],
    },
    {
      version: 'v0.9.4',
      date: 'August 2026',
      status: 'In Development',
      badgeVariant: 'warning' as const,
      highlights: [
        'BambooKit Android Companion application prototype (Jetpack Compose).',
        'Push notifications for production deployment approval gates.',
        'Biometric authentication for remote agent authorization.',
      ],
    },
    {
      version: 'v0.9.0',
      date: 'July 2026',
      status: 'Planned',
      badgeVariant: 'outline' as const,
      highlights: [
        'Multi-agent conflict resolution engine.',
        'Self-hosted worker nodes on private AWS/GCP Kubernetes clusters.',
        'Enterprise SAML SSO & team audit exports.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-12">
        <div className="space-y-3">
          <Badge variant="default">RELEASE CHRONOLOGY</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#f1f5f9]">Product Changelog</h1>
          <p className="text-xs text-[#94a3b8]">
            Track updates, released features, and planned capabilities across the BambooKit platform.
          </p>
        </div>

        <div className="space-y-8 border-l border-[#1c2529] pl-6 ml-2">
          {releases.map((rel, i) => (
            <div key={i} className="relative space-y-3">
              <div className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#10b981] border-2 border-[#0a0d0e]" />
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-[#f1f5f9]">{rel.version}</span>
                <span className="text-xs text-[#64748b]">{rel.date}</span>
                <Badge variant={rel.badgeVariant}>{rel.status}</Badge>
              </div>
              <ul className="p-4 rounded-lg bg-[#0f1416] border border-[#1c2529] text-xs text-[#cbd5e1] space-y-2">
                {rel.highlights.map((h, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-[#10b981]">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
