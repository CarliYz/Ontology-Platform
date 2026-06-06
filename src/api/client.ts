import { ApiResponse } from '../types/common';

const BASE_URL = '';

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const traceId = Math.random().toString(36).substring(2, 11);
  const actorId = localStorage.getItem('gov_actor_id') || 'ADMIN_USER';
  const actorRole = localStorage.getItem('gov_actor_role') || 'ADMIN';

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Trace-Id': traceId,
      'x-actor-id': actorId,
      'x-actor-role': actorRole,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw {
      code: `HTTP_${response.status}`,
      message: errorBody.message || response.statusText,
      traceId,
    };
  }

  return response.json();
}
