import { request } from './client';
import { Action } from '../types/action';

export const actionApi = {
  getActions: () => request<Action[]>('/api/actions'),
  getAction: (id: string) => request<Action>(`/api/actions/${id}`),
  createAction: (data: Partial<Action>) => request<Action>('/api/actions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAction: (id: string, data: Partial<Action>) => request<Action>(`/api/actions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  executeAction: (id: string, input: any, idempotencyKey?: string) => request<any>(`/api/actions/${id}/execute`, {
    method: 'POST',
    body: JSON.stringify({ input, idempotencyKey })
  })
};
