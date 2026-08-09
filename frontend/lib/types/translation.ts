export interface Dataset {
  id: string;
  name: string;
  source_language: string;
  target_language: string;
  description?: string;
  category?: string;
  created_by_sub?: string;
  created_at: string;
  updated_at?: string;
}

export interface DatasetsResponse {
  datasets: Dataset[];
  total: number;
}

export interface EntryStats {
  total_entries: number;
  pending_count: number;
  completed_count: number;
  completion_percentage: number;
}

export interface UserEntryStats {
  total_entries: number;
  annotated_by_user: number;
  remaining_for_user: number;
  user_completion_percentage: number;
}

export interface DatasetStatsResponse {
  dataset: Dataset;
  overall_stats: EntryStats;
  user_stats: UserEntryStats;
}

export interface Annotation {
  id: string;
  corrected_translation: string;
  notes?: string;
  keycloak_sub?: string;
  created_at: string;
  updated_at?: string;
}

export interface Entry {
  id: string;
  source_text: string;
  reference_translation: string;
  status: string;
  dataset_id: string;
  created_at: string;
  annotation?: Annotation;
}

export interface AnnotateRequest {
  corrected_translation: string;
  notes?: string;
}
