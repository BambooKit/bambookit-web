'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderGit2,
  Bot,
  ShieldCheck,
  Activity,
  Rocket,
  KeyRound,
  Cpu,
  Coins,
  CreditCard,
  Users,
  Bell,
  Settings,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { liveApi } from '@/services/liveApi';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<{ name: string; tier: string } | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [activeAgentsCount, setActiveAgentsCount] = useState<number>(0);

  useEffect(() => {
    liveApi
      .getMe()
      .then((data) => {
        if (data?.user) setUserInfo(data.user);
        if (data?.workspace) setWorkspaceInfo(data.workspace);
      })
      .catch(() => {});

    liveApi
      .getApprovals()
      .then((approvals) => {
        const pending = (approvals || []).filter((a: any) => a.status === 'PENDING');
        setPendingApprovalsCount(pending.length);
      })
      .catch(() => {});

    liveApi
      .getAgents()
      .then((agents) => {
        const active = (agents || []).filter((a: any) => a.status === 'RUNNING' || a.status === 'WAITING_FOR_APPROVAL');
        setActiveAgentsCount(active.length);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderGit2 },
    {
      label: 'Agents',
      href: '/agents',
      icon: Bot,
      badge: activeAgentsCount > 0 ? `${activeAgentsCount} Active` : undefined,
    },
    {
      label: 'Approvals',
      href: '/approvals',
      icon: ShieldCheck,
      badgeVariant: 'warning' as const,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action` : undefined,
    },
    { label: 'Activity', href: '/activity', icon: Activity },
    { label: 'Deployments', href: '/deployments', icon: Rocket },
    { label: 'Providers (BYOK)', href: '/providers', icon: KeyRound },
    { label: 'Integrations', href: '/integrations', icon: Cpu },
    { label: 'Usage & Budget', href: '/usage', icon: Coins },
    { label: 'Billing', href: '/billing', icon: CreditCard },
    { label: 'Team', href: '/team', icon: Users },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d0e] flex flex-col md:flex-row text-xs text-[#f1f5f9]">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0f1416] border-b border-[#1c2529]">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
          <div className="h-6 w-6 rounded bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span>BambooKit</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded bg-[#151b1e] border border-[#1c2529] text-[#94a3b8]"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#0c1012] border-r border-[#1c2529] flex-shrink-0 flex flex-col justify-between`}
      >
        <div>
          {/* Workspace Switcher */}
          <div className="p-3.5 border-b border-[#1c2529] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
                <Layers className="h-4 w-4" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-xs text-[#f1f5f9] truncate">
                  {workspaceInfo?.name || "Satyam's Workspace"}
                </div>
                <div className="text-[10px] font-mono text-[#64748b] uppercase">
                  Plan: {workspaceInfo?.tier || 'PRO'}
                </div>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#64748b]" />
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                    isActive
                      ? 'bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20'
                      : 'text-[#94a3b8] hover:bg-[#151b1e] hover:text-[#f1f5f9] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#10b981]' : 'text-[#64748b]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant={item.badgeVariant || 'default'}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="p-3 border-t border-[#1c2529] space-y-3">
          <Link
            href="/docs"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] text-[#94a3b8] hover:bg-[#151b1e] hover:text-[#f1f5f9] transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#10b981]" />
            <span>Architecture &amp; Docs</span>
          </Link>

          <div className="flex items-center justify-between px-2 pt-1 border-t border-[#1c2529]/60">
            <div className="flex items-center gap-2 truncate">
              <div className="h-6 w-6 rounded-full bg-[#4285F4] flex items-center justify-center font-bold text-[11px] text-white">
                G
              </div>
              <div className="truncate">
                <div className="text-[11px] font-medium text-[#f1f5f9] truncate">
                  {userInfo?.name || 'Satyam Pote'}
                </div>
                <div className="text-[9px] text-[#38bdf8] font-mono truncate">
                  {userInfo?.email || 'satyampote9999@gmail.com'}
                </div>
              </div>
            </div>
            <Link href="/login" className="text-[10px] text-[#64748b] hover:text-[#f1f5f9]">
              Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 bg-[#0a0d0e] flex flex-col overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
