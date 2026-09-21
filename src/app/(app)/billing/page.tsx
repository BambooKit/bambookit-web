import React from 'react';
import { CreditCard, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BAMBOOKIT_PLANS } from '@/config/product';
import { formatInr } from '@/lib/utils';

export default function BillingPage() {
  const currentPlan = BAMBOOKIT_PLANS[1]; // Pro

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
                <span className="text-[10px] font-mono text-[#64748b] uppercase">Current Active Plan</span>
                <h3 className="text-lg font-bold text-[#f1f5f9] mt-0.5">{currentPlan.name} Plan</h3>
              </div>
              <Badge variant="success">Active (Renews Oct 15)</Badge>
            </div>

            <div className="text-2xl font-bold font-mono text-[#f1f5f9]">
              {formatInr(currentPlan.priceInr)} <span className="text-xs font-normal text-[#94a3b8]">/ month</span>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">{currentPlan.description}</p>

            <div className="flex items-center gap-3 pt-2">
              <Button size="sm">Upgrade to Team</Button>
              <Button variant="outline" size="sm">
                Manage Payment Card
              </Button>
            </div>
          </Card>

          {/* Invoice History */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Invoice History</h3>
            <div className="divide-y divide-[#1c2529] border border-[#1c2529] rounded text-xs">
              {[
                { id: 'INV-2026-08', date: 'Aug 15, 2026', amount: '₹799.00', status: 'Paid' },
                { id: 'INV-2026-07', date: 'Jul 15, 2026', amount: '₹799.00', status: 'Paid' },
              ].map((inv) => (
                <div key={inv.id} className="p-3 flex items-center justify-between">
                  <div className="font-mono text-[11px] text-[#f1f5f9]">{inv.id}</div>
                  <div className="text-[#94a3b8]">{inv.date}</div>
                  <div className="font-mono text-[#cbd5e1]">{inv.amount}</div>
                  <Badge variant="success">{inv.status}</Badge>
                  <button className="text-[#94a3b8] hover:text-[#f1f5f9]">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Payment Method Card */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#f1f5f9] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#10b981]" /> Payment Method
            </h3>
            <div className="p-3 rounded bg-[#080b0c] border border-[#1c2529] text-xs font-mono space-y-1">
              <div className="text-[#f1f5f9]">Visa ending in 4242</div>
              <div className="text-[10px] text-[#64748b]">Expires 08/29 • Default</div>
            </div>
            <p className="text-[11px] text-[#94a3b8]">
              Charges appear as &quot;BAMBOOKIT.DEV&quot; on your bank statement.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
