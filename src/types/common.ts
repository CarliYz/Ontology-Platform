/**
 * COMMON REF - The protocol for identifying entities across functional areas.
 */
export interface CommonRef {
  id: string;
  type: 'object' | 'link' | 'action' | 'interface' | 'analysis';
  version?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  traceId: string;
}

export enum PageStatus {
  LOADING = 'loading',
  EMPTY = 'empty',
  ERROR = 'error',
  SUCCESS = 'success',
}

export type SeverityType = 'error' | 'warning' | 'info' | 'success';
