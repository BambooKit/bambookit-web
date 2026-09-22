/**
 * BambooKit Domain Models
 * Strongly-typed domain definitions for AI Agent Control Plane
 */

export type TaskStatus =
  | 'queued'
  | 'starting'
  | 'running'
  | 'waiting_for_approval'
  | 'testing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'completed' | 'failed' | 'offline';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ApprovalScope = 'once' | 'task' | 'project' | 'session';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type PermissionState = 'allowed' | 'approval_required' | 'blocked';

export type PermissionCategory =
  | 'filesystem'
  | 'terminal'
  | 'network'
  | 'git'
  | 'secrets'
  | 'cloud'
  | 'database'
  | 'deployment'
  | 'production';

export type ProviderId = 'anthropic' | 'openai' | 'google' | 'openrouter' | 'local' | 'custom' | 'opencode' | 'kilo';

export type ExecutionEnvironment = 'local' | 'cloud' | 'hybrid';

export type DeploymentStatus = 'queued' | 'building' | 'deploying' | 'live' | 'failed' | 'rolled_back';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  createdAt: string;
  membersCount: number;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  repository: {
    provider: 'github' | 'gitlab' | 'bitbucket';
    url: string;
    branch: string;
    lastCommitSha: string;
    lastCommitMessage: string;
  };
  environment: ExecutionEnvironment;
  activeAgentsCount: number;
  totalTasksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  projectId: string;
  name: string;
  description: string;
  provider: ProviderId;
  model: string;
  status: AgentStatus;
  currentTaskId?: string;
  currentTaskTitle?: string;
  totalTasksCompleted: number;
  runtimeSeconds: number;
  costUsd: number;
  lastActiveAt: string;
  isOnline: boolean;
}

export interface AgentTask {
  id: string;
  projectId: string;
  agentId: string;
  title: string;
  prompt: string;
  status: TaskStatus;
  startedAt: string;
  completedAt?: string;
  executionEnvironment: ExecutionEnvironment;
  filesTouched: string[];
  linesAdded: number;
  linesRemoved: number;
  testsPassed: number;
  testsFailed: number;
  commitSha?: string;
  requiresApproval?: boolean;
}

export type EventType =
  | 'agent.started'
  | 'agent.thinking'
  | 'agent.file_read'
  | 'agent.file_changed'
  | 'agent.command_started'
  | 'agent.command_finished'
  | 'agent.test_started'
  | 'agent.test_finished'
  | 'agent.approval_requested'
  | 'agent.approval_granted'
  | 'agent.approval_rejected'
  | 'agent.commit_created'
  | 'agent.deployment_started'
  | 'agent.deployment_finished'
  | 'agent.failed';

export interface AgentEvent {
  id: string;
  taskId: string;
  agentId: string;
  type: EventType;
  timestamp: string;
  summary: string;
  details?: Record<string, any>;
  data?: {
    file?: string;
    command?: string;
    output?: string;
    exitCode?: number;
    diff?: {
      file: string;
      additions: number;
      deletions: number;
      chunks: Array<{
        header: string;
        lines: Array<{
          type: 'context' | 'add' | 'remove';
          content: string;
          oldLine?: number;
          newLine?: number;
        }>;
      }>;
    };
    tests?: {
      suite: string;
      passed: number;
      failed: number;
      durationMs: number;
    };
    commit?: {
      sha: string;
      message: string;
      branch: string;
    };
    approval?: {
      id: string;
      action: string;
      risk: RiskLevel;
    };
  };
}

export interface ApprovalRequest {
  id: string;
  projectId: string;
  agentId: string;
  agentName: string;
  taskId: string;
  action: string;
  risk: RiskLevel;
  scopeAllowed: ApprovalScope[];
  status: ApprovalStatus;
  reason: string;
  affectedResources: string[];
  requestedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  details: {
    command?: string;
    files?: string[];
    environment?: string;
    service?: string;
  };
}

export interface PermissionPolicy {
  category: PermissionCategory;
  name: string;
  description: string;
  state: PermissionState;
  customRules?: string[];
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  description: string;
  isConnected: boolean;
  apiKeyMasked?: string;
  defaultModel: string;
  availableModels: string[];
  usageMonthlyTokens: number;
  costMonthlyUsd: number;
  isBYOK: boolean;
  endpointUrl?: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  environment: 'production' | 'staging' | 'preview';
  branch: string;
  commitSha: string;
  commitMessage: string;
  status: DeploymentStatus;
  url?: string;
  durationSeconds: number;
  createdAt: string;
  deployedByAgentId?: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'android' | 'desktop' | 'web';
  status: 'online' | 'offline' | 'idle';
  lastSeenAt: string;
  version: string;
  connectedProjectId?: string;
  ipAddressMasked: string;
}

export interface AuditEvent {
  id: string;
  actor: {
    type: 'user' | 'agent' | 'system' | 'device';
    name: string;
    id: string;
  };
  action: string;
  resource: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface UsageRecord {
  period: string; // e.g. '2026-09'
  bambookitPlatformFee: number;
  aiTokensTotal: number;
  aiCostEstUsd: number;
  workerSecondsTotal: number;
  workerCostUsd: number;
  deploymentsCount: number;
  storageMb: number;
  budgetCapUsd: number;
  budgetAlertThresholdPercent: number;
}

export interface PlanConfig {
  id: 'free' | 'pro' | 'team' | 'enterprise';
  name: string;
  priceInr: number;
  interval: 'month';
  headline: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'approval';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: 'vcs' | 'cloud' | 'ci' | 'alerts';
  description: string;
  status: 'available' | 'connected' | 'coming_soon';
  icon: string;
}
