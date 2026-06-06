export interface ActionParameter {
  id: string;
  name: string;
  displayName: string;
  type: string;
  description?: string;
  required: boolean;
}

export interface GuardPolicy {
  requireApproval: boolean;
  dryRun: boolean;
  rateLimit?: number;
  scopeWhitelist?: string[];
}

export interface Action {
  id: string;
  apiName: string;
  displayName: string;
  description?: string;
  status: string;
  parameters: string; // JSON Stringified ActionParameter[]
  guardPolicy: string; // JSON Stringified GuardPolicy
  script: string;
  createdAt: string;
  updatedAt: string;
}
