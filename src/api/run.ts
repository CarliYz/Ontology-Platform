import { request } from "./client";

export interface Run {
  id: string;
  actionId: string;
  status: string;
  input: string;
  output?: string;
  error?: string;
  parentRunId?: string;
  idempotencyKey?: string;
  actorId: string;
  createdAt: string;
  updatedAt: string;
  action?: {
    displayName: string;
    apiName: string;
  };
  steps?: RunStep[];
}

export interface RunStep {
  id: string;
  name: string;
  status: string;
  startTime: string;
  endTime?: string;
  logs?: string;
}

export const runApi = {
  getRuns: (actionId?: string) => 
    request<Run[]>(`/api/runs${actionId ? `?actionId=${actionId}` : ''}`),
  
  getRun: (id: string) => 
    request<Run>(`/api/runs/${id}`),
  
  cancelRun: (id: string) => 
    request<Run>(`/api/runs/${id}/cancel`, { method: 'POST' }),
  
  retryRun: (id: string) => 
    request<Run>(`/api/runs/${id}/retry`, { method: 'POST' }),
  
  executeAction: (actionId: string, input: any, idempotencyKey?: string) => 
    request<Run>(`/api/actions/${actionId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ input, idempotencyKey })
    })
};
