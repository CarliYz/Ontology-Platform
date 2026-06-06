export interface QueryEvent {
  id: string;
  occurred_at: string;
  query_type: string;
  source_app: string;
  duration_ms: number;
  status: string;
  result_count: number;
}

export interface QueryExplain {
  summary: string;
  path: any[];
  filters: any[];
  riskHints: string[];
}

export interface ImpactItem {
  source_ref: string;
  target_type: "query" | "page" | "action";
  target_ref: string;
  impact_level: "direct" | "indirect" | "potential";
}

export interface AnalysisReport {
  id: string;
  title: string;
  type: 'graph' | 'path' | 'hotspot' | 'impact';
  description?: string;
  created_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}
