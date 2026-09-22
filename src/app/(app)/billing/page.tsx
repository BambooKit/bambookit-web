'use client';

import React from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function BillingPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2529]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Subscription &amp; Billing</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Manage BambooKit control plane subscription, payment methods, and GST invoices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Subscription Card (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-5 space-y-4 border-[#10b981]/30 bg-[#0c1412]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#64748b] uppercase">Current Active Tier</span>
                <h3 className="text-lg font-bold text-[#f1f5f9] mt-0.5">Developer Preview (Free)</h3>
              </div>
              <Badge variant="success">Active (Unlimited Local & BYOK)</Badge>
            </div>

            <div className="text-2xl font-bold font-mono text-[#f1f5f9]">
              ₹0 <span className="text-xs font-normal text-[#94a3b8]">/ testing period</span>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">
              All developer control plane features, Google Drive integration, multi-model BYOK, and local supervisors are active and unrestricted during testing.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={() => alert('No payment required during testing.')}>
                Billing Settings
              </Button>
            </div>
          </Card>

          {/* Invoice History */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Invoice History</h3>
            <div className="p-8 text-center text-xs text-[#64748b] bg-[#080b0c] border border-[#1c2529] rounded">
              No invoices generated yet.
            </div>
          </Card>
        </div>

        {/* Payment Method Card */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#f1f5f9] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#10b981]" /> Payment Method
            </h3>
            <div className="p-4 rounded bg-[#080b0c] border border-[#1c2529] text-xs text-[#64748b] text-center">
              No payment card required for testing period.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
