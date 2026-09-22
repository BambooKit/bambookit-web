'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, ShieldAlert, Rocket, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { liveApi } from '@/services/liveApi';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifs = () => {
    liveApi
      .getNotifications()
      .then((data) => {
        setNotifications(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await liveApi.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Offline fallback
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
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

      {loading && (
        <div className="p-12 text-center text-[#64748b] font-mono text-xs">
          Loading alerts from control plane...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          Failed to load notifications: {error}
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="p-16 text-center bg-[#0f1416] border border-[#1c2529] rounded-xl space-y-3">
          <Bell className="h-10 w-10 text-[#64748b] mx-auto" />
          <h3 className="text-sm font-semibold text-[#f1f5f9]">No Notifications</h3>
          <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
            You will receive instant alerts here when approval gates or task lifecycle events occur.
          </p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
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
                  {n.type === 'APPROVAL_REQUIRED' ? (
                    <ShieldAlert className="h-4 w-4 text-[#f59e0b]" />
                  ) : n.type === 'SUCCESS' ? (
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
                  <p className="text-xs text-[#94a3b8] mt-1">{n.body || n.message}</p>
                  <div className="text-[10px] font-mono text-[#64748b] mt-1.5">
                    {new Date(n.createdAt || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <Badge variant={n.type === 'APPROVAL_REQUIRED' ? 'warning' : 'default'}>
                {n.type?.replace(/_/g, ' ') || 'ALERT'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
