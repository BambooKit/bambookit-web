const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev_test_token',
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API call to ${endpoint} failed with HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

export const liveApi = {
  getProjects: () => fetchApi('/v1/projects'),
  getProjectById: (id: string) => fetchApi(`/v1/projects/${id}`),
  createProject: (data: { name: string; description?: string; executionMode?: string }) =>
    fetchApi('/v1/projects', { method: 'POST', body: JSON.stringify(data) }),

  getTasks: (projectId?: string) => fetchApi(projectId ? `/v1/tasks?projectId=${projectId}` : '/v1/tasks'),
  getTaskById: (id: string) => fetchApi(`/v1/tasks/${id}`),
  createTask: (data: { projectId: string; agentId?: string; title: string; prompt?: string }) =>
    fetchApi('/v1/tasks', { method: 'POST', body: JSON.stringify(data) }),

  getApprovals: () => fetchApi('/v1/approvals'),
  respondApproval: (id: string, decision: 'APPROVED' | 'REJECTED', reason?: string) =>
    fetchApi(`/v1/approvals/${id}/respond`, { method: 'POST', body: JSON.stringify({ status: decision, reason }) }),

  getDevices: () => fetchApi('/v1/devices'),
  getProviders: () => fetchApi('/v1/providers'),
  getAgents: () => fetchApi('/v1/agents'),
  getEvents: (taskId?: string) => fetchApi(taskId ? `/v1/events?taskId=${taskId}` : '/v1/events'),
  getActivity: () => fetchApi('/v1/activity'),
  getDeployments: (projectId?: string) => fetchApi(projectId ? `/v1/deployments?projectId=${projectId}` : '/v1/deployments'),
  getUsage: () => fetchApi('/v1/usage'),
  getNotifications: () => fetchApi('/v1/notifications'),
  markNotificationsRead: () => fetchApi('/v1/notifications/read-all', { method: 'POST' }),
  getMe: () => fetchApi('/v1/auth/me'),
};
