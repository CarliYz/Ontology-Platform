import { request } from './client';

export interface App {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  status: string;
  pages?: AppPage[];
  navItems?: AppNavItem[];
  updatedAt: string;
}

export interface AppPage {
  id: string;
  appId: string;
  name: string;
  type: 'record' | 'list' | 'dashboard' | 'workspace';
  config: string;
  bindings?: PageBinding[];
  updatedAt: string;
}

export interface AppNavItem {
  id: string;
  appId: string;
  label: string;
  icon?: string;
  targetPageId?: string;
  parentId?: string;
  order: number;
}

export interface PageBinding {
  id: string;
  pageId: string;
  refType: 'ontology' | 'action' | 'saved_view';
  refId: string;
  slotName: string;
}

export const appApi = {
  getApps: () => request<App[]>('/api/apps'),
  getApp: (id: string) => request<App>(`/api/apps/${id}`),
  createApp: (data: Partial<App>) => request<App>('/api/apps', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateApp: (id: string, data: Partial<App>) => request<App>(`/api/apps/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  deleteApp: (id: string) => request<void>(`/api/apps/${id}`, { method: 'DELETE' }),
  
  getAppPages: (appId: string) => request<AppPage[]>(`/api/apps/${appId}/pages`),
  createAppPage: (appId: string, data: any) => request<AppPage>(`/api/apps/${appId}/pages`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getAppNav: (appId: string) => request<AppNavItem[]>(`/api/apps/${appId}/nav`),
  createAppNav: (appId: string, data: any) => request<AppNavItem>(`/api/apps/${appId}/nav`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
