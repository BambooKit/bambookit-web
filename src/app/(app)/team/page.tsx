import React from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TeamPage() {
  const members = [
    { name: 'Satyam', email: 'satyam@bambookit.dev', role: 'Owner', status: 'Active' },
    { name: 'Alex Rivera', email: 'alex@bambookit.dev', role: 'Admin', status: 'Active' },
    { name: 'Elena Chen', email: 'elena@bambookit.dev', role: 'Developer', status: 'Active' },
    { name: 'Devin Security', email: 'security-bot@bambookit.dev', role: 'Viewer', status: 'Active' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Team &amp; Access Controls</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Manage organization members, role-based authorization, and approval escalation policies.
          </p>
        </div>
        <Button size="sm">
          <UserPlus className="h-3.5 w-3.5 mr-1" /> Invite Member
        </Button>
      </div>

      <div className="border border-[#1c2529] rounded-lg bg-[#0f1416] divide-y divide-[#1c2529]">
        {members.map((m, i) => (
          <div key={i} className="p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#151b1e] border border-[#1c2529] flex items-center justify-center font-bold text-[11px] text-[#10b981]">
                {m.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-[#f1f5f9]">{m.name}</div>
                <div className="text-[11px] font-mono text-[#64748b]">{m.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline">{m.role}</Badge>
              <Badge variant="success">{m.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
