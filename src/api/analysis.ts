import { request } from './client';

export interface QueryEvent {
  id: string;
  queryType: string;
  targetRef?: string;
  parameters?: string;
  durationMs: number;
  resultCount: number;
  actorId: string;
  traceId: string;
  createdAt: string;
}

export interface Hotspot {
  id: string;
  window: string;
  targetRef: string;
  hitCount: number;
  intensity: number;
}

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  config: string;
  category: string;
  updatedAt: string;
}

export const analysisApi = {
  getQueryEvents: (params: { queryType?: string, actorId?: string, page?: number, limit?: number }) => {
    const q = new URLSearchParams();
    if (params.queryType) q.append('queryType', params.queryType);
    if (params.actorId) q.append('actorId', params.actorId);
    if (params.page) q.append('page', params.page.toString());
    if (params.limit) q.append('limit', params.limit.toString());
    return request<{ data: QueryEvent[], pagination: any }>(`/api/query-events?${q.toString()}`);
  },
  
  getQueryEvent: (id: string) => 
    request<QueryEvent>(`/api/query-events/${id}`),
  
  explainQuery: (id: string) => 
    request<any>(`/api/query-events/${id}/explain`),
  
  getHotspots: (window: string) => 
    request<Hotspot[]>(`/api/analysis/hotspots?window=${window}`),
  
  calculateImpact: (rootId: string, save: boolean = false) => 
    request<{ graphData: any, score: number }>('/api/analysis/impact', {
      method: 'POST',
      body: JSON.stringify({ rootId, save })
    }),
  
  analyzePath: (fromId: string, toId: string) => 
    request<any>('/api/analysis/path', {
      method: 'POST',
      body: JSON.stringify({ fromId, toId })
    }),

  exploreGraph: () => 
    request<any>('/api/analysis/impact', {
      method: 'POST',
      body: JSON.stringify({ rootId: 'Root', save: false })
    }),

  getSavedViews: () => 
    request<SavedView[]>('/api/saved-views'),
  
  saveView: (data: { name: string, config: any, category: string }) => 
    request<SavedView>('/api/saved-views', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  deleteView: (id: string) => 
    request<void>(`/api/saved-views/${id}`, { method: 'DELETE' })
};
