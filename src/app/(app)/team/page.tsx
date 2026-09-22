'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { liveApi } from '@/services/liveApi';

export default function TeamPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    liveApi
      .getMe()
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const members = [
    {
      name: currentUser?.name || 'Satyam Pote',
      email: currentUser?.email || 'satyampote9999@gmail.com',
      role: 'Owner',
      status: 'Active (Google Verified)',
    },
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
        <Button size="sm" onClick={() => alert('Invite link generator: team member addition active.')}>
          <UserPlus className="h-3.5 w-3.5 mr-1" /> Invite Member
        </Button>
      </div>

      <div className="border border-[#1c2529] rounded-lg bg-[#0f1416] divide-y divide-[#1c2529]">
        {members.map((m, i) => (
          <div key={i} className="p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#4285F4] flex items-center justify-center font-bold text-[11px] text-white">
                {m.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-[#f1f5f9]">{m.name}</div>
                <div className="text-[11px] font-mono text-[#38bdf8]">{m.email}</div>
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
