import { describe, it, expect } from 'vitest';
import { mockServices } from './services/mockServices';
import { formatCurrency, formatInr, formatNumber } from './lib/utils';
import { BAMBOOKIT_PLANS } from './config/product';

describe('BambooKit Domain & Mock Services Test Suite', () => {
  it('should retrieve demo projects accurately', async () => {
    const projects = await mockServices.getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(4);
    expect(projects[0].slug).toBe('bambookit-web');
  });

  it('should retrieve active agents and tasks', async () => {
    const agents = await mockServices.getAgents();
    expect(agents.length).toBeGreaterThanOrEqual(4);
    const backendAgent = agents.find((a) => a.id === 'agent_backend_sonnet');
    expect(backendAgent).toBeDefined();
    expect(backendAgent?.provider).toBe('anthropic');

    if (backendAgent?.currentTaskId) {
      const events = await mockServices.getEventsByTaskId(backendAgent.currentTaskId);
      expect(events.length).toBeGreaterThan(0);
    }
  });

  it('should process dangerous action approval updates correctly', async () => {
    const initialApprovals = await mockServices.getApprovals();
    const pending = initialApprovals.find((a) => a.status === 'pending');
    expect(pending).toBeDefined();

    if (pending) {
      const updated = await mockServices.respondApproval(pending.id, 'approved', 'task');
      expect(updated.status).toBe('approved');
      expect(updated.respondedBy).toBe('Satyam');

      const auditLog = await mockServices.getAuditLog();
      expect(auditLog[0].action).toContain('Approved');
    }
  });

  it('should format currency and numbers correctly', () => {
    expect(formatCurrency(44.0)).toBe('$44.00');
    expect(formatInr(799)).toBe('₹799');
    expect(formatNumber(1500000)).toBe('1,500,000');
  });

  it('should have properly structured pricing configuration', () => {
    expect(BAMBOOKIT_PLANS.length).toBe(4);
    const freePlan = BAMBOOKIT_PLANS.find((p) => p.id === 'free');
    const proPlan = BAMBOOKIT_PLANS.find((p) => p.id === 'pro');
    expect(freePlan?.priceInr).toBe(0);
    expect(proPlan?.priceInr).toBe(799);
  });
});
