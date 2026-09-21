import {
  Project,
  Agent,
  AgentTask,
  AgentEvent,
  ApprovalRequest,
  ApprovalStatus,
  ApprovalScope,
  ProviderConfig,
  Deployment,
  Device,
  AuditEvent,
  UsageRecord,
  NotificationItem,
  IntegrationItem,
  PermissionPolicy,
  User,
  Workspace,
} from '@/types/domain';

import {
  DEMO_PROJECTS,
  DEMO_AGENTS,
  DEMO_TASKS,
  DEMO_EVENTS,
  DEMO_APPROVALS,
  DEMO_PROVIDERS,
  DEMO_DEPLOYMENTS,
  DEMO_DEVICES,
  DEMO_AUDIT_LOG,
  DEMO_USAGE,
  DEMO_NOTIFICATIONS,
  DEMO_INTEGRATIONS,
  DEMO_USER,
  DEMO_WORKSPACE,
} from '@/data/mockData';

import { DEFAULT_PERMISSIONS } from '@/config/product';

export interface IProjectService {
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  createProject(data: Partial<Project>): Promise<Project>;
}

export interface IAgentService {
  getAgents(projectId?: string): Promise<Agent[]>;
  getAgentById(id: string): Promise<Agent | null>;
  getTasksByAgentId(agentId: string): Promise<AgentTask[]>;
  getEventsByTaskId(taskId: string): Promise<AgentEvent[]>;
}

export interface IApprovalService {
  getApprovals(): Promise<ApprovalRequest[]>;
  getPendingApprovalsCount(): Promise<number>;
  respondApproval(id: string, status: ApprovalStatus, scope: ApprovalScope, note?: string): Promise<ApprovalRequest>;
}

export interface IProviderService {
  getProviders(): Promise<ProviderConfig[]>;
  updateProvider(id: string, updates: Partial<ProviderConfig>): Promise<ProviderConfig>;
}

export interface IDeploymentService {
  getDeployments(projectId?: string): Promise<Deployment[]>;
  triggerRollback(deploymentId: string): Promise<Deployment>;
}

export interface IDeviceService {
  getDevices(): Promise<Device[]>;
}

export interface IAuditService {
  getAuditLog(): Promise<AuditEvent[]>;
}

export interface IUsageService {
  getUsage(): Promise<UsageRecord>;
}

export interface INotificationService {
  getNotifications(): Promise<NotificationItem[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}

export interface IPermissionService {
  getPermissions(): Promise<PermissionPolicy[]>;
  updatePermission(category: string, state: PermissionPolicy['state']): Promise<PermissionPolicy>;
}

export interface IUserService {
  getCurrentUser(): Promise<User>;
  getCurrentWorkspace(): Promise<Workspace>;
}

/**
 * Mock Service Implementation
 * Operates in-memory with optional localStorage sync for high-fidelity prototyping.
 */
class MockBambooKitServices
  implements
    IProjectService,
    IAgentService,
    IApprovalService,
    IProviderService,
    IDeploymentService,
    IDeviceService,
    IAuditService,
    IUsageService,
    INotificationService,
    IPermissionService,
    IUserService
{
  private projects: Project[] = [...DEMO_PROJECTS];
  private agents: Agent[] = [...DEMO_AGENTS];
  private tasks: AgentTask[] = [...DEMO_TASKS];
  private events: AgentEvent[] = [...DEMO_EVENTS];
  private approvals: ApprovalRequest[] = [...DEMO_APPROVALS];
  private providers: ProviderConfig[] = [...DEMO_PROVIDERS];
  private deployments: Deployment[] = [...DEMO_DEPLOYMENTS];
  private devices: Device[] = [...DEMO_DEVICES];
  private auditLog: AuditEvent[] = [...DEMO_AUDIT_LOG];
  private usage: UsageRecord = { ...DEMO_USAGE };
  private notifications: NotificationItem[] = [...DEMO_NOTIFICATIONS];
  private permissions: PermissionPolicy[] = [...DEFAULT_PERMISSIONS];

  // Projects
  async getProjects(): Promise<Project[]> {
    return [...this.projects];
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projects.find((p) => p.id === id || p.slug === id) || null;
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: data.name || 'New Project',
      slug: (data.name || 'new-project').toLowerCase().replace(/\s+/g, '-'),
      description: data.description || 'Configured via BambooKit control plane',
      repository: data.repository || {
        provider: 'github',
        url: 'https://github.com/org/repo',
        branch: 'main',
        lastCommitSha: 'a1b2c3d',
        lastCommitMessage: 'initial commit',
      },
      environment: data.environment || 'cloud',
      activeAgentsCount: 0,
      totalTasksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.unshift(newProj);
    return newProj;
  }

  // Agents
  async getAgents(projectId?: string): Promise<Agent[]> {
    if (projectId) {
      return this.agents.filter((a) => a.projectId === projectId);
    }
    return [...this.agents];
  }

  async getAgentById(id: string): Promise<Agent | null> {
    return this.agents.find((a) => a.id === id) || null;
  }

  async getTasksByAgentId(agentId: string): Promise<AgentTask[]> {
    return this.tasks.filter((t) => t.agentId === agentId);
  }

  async getEventsByTaskId(taskId: string): Promise<AgentEvent[]> {
    return this.events.filter((e) => e.taskId === taskId);
  }

  // Approvals
  async getApprovals(): Promise<ApprovalRequest[]> {
    return [...this.approvals];
  }

  async getPendingApprovalsCount(): Promise<number> {
    return this.approvals.filter((a) => a.status === 'pending').length;
  }

  async respondApproval(
    id: string,
    status: ApprovalStatus,
    scope: ApprovalScope,
    note?: string
  ): Promise<ApprovalRequest> {
    const index = this.approvals.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Approval request not found');

    const updated: ApprovalRequest = {
      ...this.approvals[index],
      status,
      respondedAt: new Date().toISOString(),
      respondedBy: DEMO_USER.name,
    };
    this.approvals[index] = updated;

    // Append to audit log
    this.auditLog.unshift({
      id: `aud_${Date.now()}`,
      actor: { type: 'user', name: DEMO_USER.name, id: DEMO_USER.id },
      action: status === 'approved' ? `Approved (${scope})` : 'Rejected',
      resource: `${updated.action}: ${updated.details.service || updated.details.command || updated.id}`,
      timestamp: 'Just now',
    });

    return updated;
  }

  // Providers
  async getProviders(): Promise<ProviderConfig[]> {
    return [...this.providers];
  }

  async updateProvider(id: string, updates: Partial<ProviderConfig>): Promise<ProviderConfig> {
    const index = this.providers.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Provider not found');
    this.providers[index] = { ...this.providers[index], ...updates };
    return this.providers[index];
  }

  // Deployments
  async getDeployments(projectId?: string): Promise<Deployment[]> {
    if (projectId) {
      return this.deployments.filter((d) => d.projectId === projectId);
    }
    return [...this.deployments];
  }

  async triggerRollback(deploymentId: string): Promise<Deployment> {
    const found = this.deployments.find((d) => d.id === deploymentId);
    if (!found) throw new Error('Deployment not found');

    const rollbackDep: Deployment = {
      id: `dep_rollback_${Date.now()}`,
      projectId: found.projectId,
      projectName: found.projectName,
      environment: found.environment,
      branch: found.branch,
      commitSha: found.commitSha,
      commitMessage: `Rollback to ${found.commitSha.slice(0, 7)}: ${found.commitMessage}`,
      status: 'live',
      url: found.url,
      durationSeconds: 24,
      createdAt: new Date().toISOString(),
    };
    this.deployments.unshift(rollbackDep);
    return rollbackDep;
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    return [...this.devices];
  }

  // Audit
  async getAuditLog(): Promise<AuditEvent[]> {
    return [...this.auditLog];
  }

  // Usage
  async getUsage(): Promise<UsageRecord> {
    return { ...this.usage };
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return [...this.notifications];
  }

  async markAsRead(id: string): Promise<void> {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  }

  async markAllAsRead(): Promise<void> {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  // Permissions
  async getPermissions(): Promise<PermissionPolicy[]> {
    return [...this.permissions];
  }

  async updatePermission(category: string, state: PermissionPolicy['state']): Promise<PermissionPolicy> {
    const index = this.permissions.findIndex((p) => p.category === category);
    if (index === -1) throw new Error('Permission category not found');
    this.permissions[index] = { ...this.permissions[index], state };
    return this.permissions[index];
  }

  // User & Workspace
  async getCurrentUser(): Promise<User> {
    return { ...DEMO_USER };
  }

  async getCurrentWorkspace(): Promise<Workspace> {
    return { ...DEMO_WORKSPACE };
  }
}

// Export singleton instance of mock services
export const mockServices = new MockBambooKitServices();
