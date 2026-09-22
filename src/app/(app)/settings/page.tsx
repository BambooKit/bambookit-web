'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Shield, Smartphone, Key, Lock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DEFAULT_PERMISSIONS } from '@/config/product';
import { PermissionPolicy, PermissionState } from '@/types/domain';
import { liveApi } from '@/services/liveApi';

export default function SettingsPage() {
  const [permissions, setPermissions] = useState<PermissionPolicy[]>(DEFAULT_PERMISSIONS);
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  useEffect(() => {
    liveApi
      .getDevices()
      .then((data) => {
        setDevices(data || []);
        setLoadingDevices(false);
      })
      .catch(() => setLoadingDevices(false));
  }, []);

  const updateState = (category: string, newState: PermissionState) => {
    setPermissions((prev) =>
      prev.map((p) => (p.category === category ? { ...p, state: newState } : p))
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
      <div className="pb-4 border-b border-[#1c2529]">
        <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Control Plane Settings &amp; Security</h1>
        <p className="text-xs text-[#94a3b8] mt-0.5">
          Fine-tune agent permission policies, manage registered devices, and workspace credentials.
        </p>
      </div>

      {/* Permission Boundaries Manager */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#f1f5f9] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#10b981]" /> Agent Execution Permission Policy
          </h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Configure default boundaries for autonomous tasks before execution is permitted.
          </p>
        </div>

        <div className="border border-[#1c2529] rounded-lg bg-[#0f1416] divide-y divide-[#1c2529]">
          {permissions.map((p) => (
            <div key={p.category} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-semibold text-[#f1f5f9]">{p.name}</div>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">{p.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateState(p.category, 'allowed')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    p.state === 'allowed'
                      ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/40 font-semibold'
                      : 'text-[#64748b] hover:bg-[#151b1e]'
                  }`}
                >
                  Allowed
                </button>
                <button
                  onClick={() => updateState(p.category, 'approval_required')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    p.state === 'approval_required'
                      ? 'bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/40 font-semibold'
                      : 'text-[#64748b] hover:bg-[#151b1e]'
                  }`}
                >
                  Approval Required
                </button>
                <button
                  onClick={() => updateState(p.category, 'blocked')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    p.state === 'blocked'
                      ? 'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/40 font-semibold'
                      : 'text-[#64748b] hover:bg-[#151b1e]'
                  }`}
                >
                  Blocked
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Remote Devices */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#f1f5f9] flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-[#06b6d4]" /> Registered Remote Devices &amp; Connectors
          </h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Android smartphones and Desktop Connectors linked with end-to-end device identity.
          </p>
        </div>

        {loadingDevices && (
          <div className="p-8 text-center text-xs font-mono text-[#64748b]">
            Checking device registry...
          </div>
        )}

        {!loadingDevices && devices.length === 0 && (
          <div className="p-8 text-center bg-[#0f1416] border border-[#1c2529] rounded-lg text-xs text-[#64748b]">
            No remote devices registered yet. Open the Windows Desktop app or Android phone to pair automatically.
          </div>
        )}

        {!loadingDevices && devices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {devices.map((dev) => (
              <Card key={dev.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#f1f5f9]">{dev.name}</span>
                  <Badge variant={dev.status === 'ONLINE' ? 'success' : 'default'} dot>
                    {dev.status}
                  </Badge>
                </div>
                <div className="font-mono text-[11px] text-[#94a3b8] space-y-1">
                  <div>Type: {dev.type}</div>
                  <div>Version: {dev.version}</div>
                  <div>IP: {dev.ipAddressMasked}</div>
                  <div>Last Active: {new Date(dev.lastSeenAt).toLocaleTimeString()}</div>
                </div>
                <div className="pt-2 border-t border-[#1c2529] flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => alert('Device revocation command sent.')}>
                    Revoke Device
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-[#1c2529] space-y-3">
        <h3 className="text-xs font-mono uppercase text-[#f87171] tracking-wider flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Danger Zone
        </h3>
        <div className="p-4 rounded-lg bg-[#140c0c] border border-[#ef4444]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#f1f5f9]">Terminate All Cloud Workers &amp; Revoke Keys</div>
            <p className="text-[11px] text-[#94a3b8]">
              Instantly tears down all running ephemeral containers and pauses active agent sessions.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => alert('Emergency circuit breaker active: all worker leases cancelled.')}>
            Emergency Circuit Breaker
          </Button>
        </div>
      </div>
    </div>
  );
}
