import { request } from './client';

export interface Role {
  id: string;
  name: string;
  description?: string;
  rules?: PermissionRule[];
}

export interface PermissionRule {
  id: string;
  roleId: string;
  resource: string;
  action: string;
  effect: 'ALLOW' | 'DENY';
  condition?: string;
  role?: Role;
}

export interface AlertRule {
  id: string;
  name: string;
  category: string;
  threshold: string;
  severity: string;
  enabled: boolean;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  sourceType: string;
  sourceId: string;
  message: string;
  severity: string;
  createdAt: string;
  rule?: AlertRule;
}

export interface CostRecord {
  id: string;
  window: string;
  computeSecs: number;
  queryCount: number;
  category?: string;
  createdAt: string;
}

export interface ConfigItem {
  id: string;
  key: string;
  value: string;
  group: string;
  description?: string;
}

export const governanceApi = {
  getRoles: () => request<Role[]>('/api/governance/roles'),
  createRole: (data: any) => request<Role>('/api/governance/roles', { method: 'POST', body: JSON.stringify(data) }),
  
  getPermissions: () => request<PermissionRule[]>('/api/governance/permissions'),
  createPermission: (data: any) => request<PermissionRule>('/api/governance/permissions', { method: 'POST', body: JSON.stringify(data) }),
  
  getAuditLogs: (params: { actorId?: string, page?: number }) => {
    const q = new URLSearchParams();
    if (params.actorId) q.append('actorId', params.actorId);
    if (params.page) q.append('page', params.page.toString());
    return request<any[]>(`/api/governance/auditlogs?${q.toString()}`);
  },
  
  getAlertRules: () => request<AlertRule[]>('/api/governance/alerts/rules'),
  createAlertRule: (data: any) => request<AlertRule>('/api/governance/alerts/rules', { method: 'POST', body: JSON.stringify(data) }),
  
  getAlertEvents: () => request<AlertEvent[]>('/api/governance/alerts/events'),
  
  getCostRecords: () => request<CostRecord[]>('/api/governance/cost/records'),
  
  getUsageMetrics: () => request<{ queryCount: number, runCount: number, alertCount: number }>('/api/governance/usage'),
  
  getConfigs: () => request<ConfigItem[]>('/api/governance/config'),
  saveConfig: (data: any) => request<ConfigItem>('/api/governance/config', { method: 'POST', body: JSON.stringify(data) })
};
