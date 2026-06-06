import { request } from './client';
import { ObjectType, LinkType } from '../types/ontology';

export const ontologyApi = {
  getOntologies: (page = 1, pageSize = 20) => 
    request<any>(`/api/ontologies?page=${page}&pageSize=${pageSize}`),

  createOntology: (name: string) =>
    request<any>('/api/ontologies', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getOntology: (id: string) =>
    request<any>(`/api/ontologies/${id}`),

  getObjectTypes: (ontologyId: string) => 
    request<ObjectType[]>(`/api/ontologies/${ontologyId}/object-types`),
  
  getLinkTypes: (ontologyId: string) => 
    request<LinkType[]>(`/api/ontologies/${ontologyId}/link-types`),

  getObjectType: (ontologyId: string, objectTypeId: string) =>
    request<ObjectType>(`/api/object-types/${objectTypeId}`),

  getVersions: (ontologyId: string) =>
    request<any[]>(`/api/ontologies/${ontologyId}/versions`),

  publishOntology: (id: string, changelog: string) =>
    request<any>(`/api/ontologies/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ changelog }),
    }),

  rollbackOntology: (id: string, versionId: string) =>
    request<any>(`/api/ontologies/${id}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ versionId }),
    }),

  getDiff: (id: string, from?: string, to?: string) =>
    request<any>(`/api/ontologies/${id}/diff?from=${from || ''}&to=${to || ''}`),
};
