export interface AuditLog {
  user: string;
  action: string;
  time: string;
  status: 'Approved' | 'Success' | 'Denied';
  type: 'Schema' | 'System' | 'Security' | 'Policy';
}

export interface MetricPoint {
  time: string;
  value: number;
}
