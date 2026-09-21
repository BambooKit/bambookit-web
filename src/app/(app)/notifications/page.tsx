'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, ShieldAlert, Rocket, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DEMO_NOTIFICATIONS } from '@/data/mockData';
import { NotificationItem } from '@/types/domain';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Notifications &amp; Realtime Alerts</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Realtime alerts dispatched to Web Console, Android Phone, and connected Webhooks.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          Mark All as Read
        </Button>
      </div>

      <div className="border border-[#1c2529] rounded-lg bg-[#0f1416] divide-y divide-[#1c2529]">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 flex items-start justify-between gap-4 text-xs transition-colors ${
              !n.read ? 'bg-[#10b981]/5' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded bg-[#151b1e] border border-[#1c2529] flex items-center justify-center shrink-0 text-[#10b981] mt-0.5">
                {n.type === 'approval' ? (
                  <ShieldAlert className="h-4 w-4 text-[#f59e0b]" />
                ) : n.type === 'success' ? (
                  <Rocket className="h-4 w-4 text-[#10b981]" />
                ) : (
                  <Info className="h-4 w-4 text-[#06b6d4]" />
                )}
              </div>
              <div>
                <div className="font-semibold text-[#f1f5f9] flex items-center gap-2">
                  <span>{n.title}</span>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />}
                </div>
                <p className="text-xs text-[#94a3b8] mt-1">{n.message}</p>
                <div className="text-[10px] font-mono text-[#64748b] mt-1.5">{n.timestamp}</div>
              </div>
            </div>

            <Badge variant={n.type === 'approval' ? 'warning' : n.type === 'success' ? 'success' : 'default'}>
              {n.type}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
